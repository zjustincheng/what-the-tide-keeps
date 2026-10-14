// Rebuild the placeholder market-town tileset and Tiled JSON map.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
import { ellipse, rect as krect, rows, scatter, sheet, stairs, vary } from './tile-kit.mjs';
const rect = (x,y,w,h,c,o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o===undefined?'':` fill-opacity="${o}"`}/>`;
// Millbrook, lit from the upper left like the fields: each stone, tile, and plank has its lit edge and its shadow.
const shadow = (cx,cy,rx,ry) => ellipse(cx,cy,rx,ry,'#000000',0.22);
// Cobbles: rounded stones in offset courses, each lit on top and shaded below, with dark joints between.
const COURSES = [[0,0,5,4],[6,0,5,4],[12,0,4,4],[0,5,3,5],[4,5,5,5],[10,5,6,5],[0,11,6,5],[7,11,5,5],[13,11,3,5]];
const cobble = (a,b) => rect(0,0,16,16,'#3f3a30')+COURSES.map(([x,y,w,h]) => rect(x,y,w,h,a)+rect(x,y,w,1,b)+rect(x,y,1,h,b)+rect(x+w-1,y+1,1,h-1,'#4a4438')).join('');
// Roofs: rows of overlapping tiles, each row throwing a shadow on the one below, joints staggered row to row.
const roof = (a,b,c) => rect(0,0,16,16,a)+[0,4,8,12].map((y,i)=>rect(0,y,16,1,c)+rect(0,y+3,16,1,b)+[3,7,11,15].map(x=>rect((x+(i%2)*2)%16,y,1,3,b)).join('')).join('');
// Plaster, mottled so a long wall isn't flat, with no band that would stripe a wall several tiles tall.
const plaster = (a,b) => rect(0,0,16,16,a)+rect(3,4,3,1,b,0.5)+rect(10,9,4,1,b,0.4)+rect(6,13,2,1,b,0.5)+rect(12,2,1,1,'#ffffff',0.08)+rect(2,10,1,1,'#ffffff',0.08);
const wall = (a,b) => plaster(a,b)+rect(0,0,1,16,b)+rect(15,0,1,16,b);
const grassTile = () => rect(0,0,16,16,'#5f7442')+rect(3,4,1,2,'#7d8f55')+rect(4,5,1,1,'#4f6338')+rect(11,10,1,2,'#7d8f55')+rect(12,11,1,1,'#4f6338')+rect(13,2,1,1,'#6f8650');
const door = (frame,plank,dark) => rect(3,2,10,14,frame)+rect(4,3,8,13,plank)+[6,9].map(x=>rect(x,3,1,13,dark)).join('')+rect(4,3,8,1,'#000000',0.25)+rect(4,15,8,1,'#000000',0.3);
const tiles = [
  cobble('#5e5648','#6f6655'),                                                                         // 0 cobbles
  cobble('#5a5245','#685f50')+rect(7,6,2,1,'#7d735f')+rect(1,12,2,2,'#4f4a3e'),                        // 1 worn cobbles
  grassTile(),                                                                                         // 2 grass
  rect(0,0,16,16,'#7c684a')+rect(3,5,2,1,'#93805b')+rect(10,11,3,1,'#6a583e')+rect(12,3,1,1,'#93805b')+rect(6,12,1,1,'#5f4f38')+rect(1,8,2,1,'#6a583e'), // 3 packed dirt
  grassTile()+shadow(9,14.5,6,1.6)+rect(7,10,3,6,'#4a3a28')+rect(9,10,1,6,'#33281c')+ellipse(8,6.5,7.5,6.5,'#2f4a2c')+ellipse(7,5.5,6,5,'#3f5f36')+ellipse(5.5,3.5,3,2,'#56794a'), // 4 tree
  roof('#8a4a35','#6d3627','#a65c43'),                                                                 // 5 red tile roof
  rect(0,0,16,16,'#a68a4f')+[1,4,6,9,12,14].map((x,i)=>rect(x,0,1,16,i%2?'#86703f':'#c2a865')).join('')+[3,8,13].map(y=>rect(0,y,16,1,'#86703f',0.6)).join(''), // 6 thatch roof
  wall('#cbbf9c','#8f8468'),                                                                           // 7 plaster wall
  wall('#cbbf9c','#8f8468')+door('#5a4330','#6e5339','#5a4330')+rect(10,9,1,2,'#c5b275')+rect(10,9,1,1,'#e2d29a'), // 8 door
  wall('#cbbf9c','#8f8468')+rect(3,3,10,9,'#6a5236')+rect(4,4,8,7,'#2e3c3a')+rect(7,4,2,7,'#6a5236')+rect(4,7,8,1,'#6a5236')+rect(5,5,1,1,'#7a9a9a')+rect(10,5,1,1,'#7a9a9a')+rect(2,12,12,1,'#8c7049')+rect(2,13,12,1,'#000000',0.2), // 9 window
  rect(0,0,16,16,'#5e5648')+[0,4,8,12].map((x,i)=>rect(x,0,4,6,i%2?'#d8cfae':'#7f9a6a')+rect(x+1,6,2,1,i%2?'#d8cfae':'#7f9a6a')).join('')+rect(0,0,16,1,'#000000',0.15)
    +rect(1,8,14,7,'#6a5236')+rect(1,8,14,1,'#8c7049')+rect(3,9,2,2,'#b84a32')+rect(6,9,2,2,'#c9a858')+rect(9,9,3,2,'#8a6a3a')+rect(1,14,14,1,'#4a3826'), // 10 market stall
  rect(0,0,16,16,'#5e5648')+shadow(9,14,7,2)+ellipse(8,9,7,5.5,'#55564d')+ellipse(8,8.5,6.5,5,'#7a7b6e')+ellipse(8,9,4,3,'#1a2826')+rect(6,8,2,1,'#3a5450')
    +rect(1,0,2,9,'#5d4630')+rect(13,0,2,9,'#5d4630')+rect(1,0,14,2,'#6a5236')+rect(1,0,14,1,'#8c7049')+rect(7,2,1,4,'#8a8a7a')+rect(6,6,3,2,'#6a5236'), // 11 well
  rect(0,0,16,16,'#5e5648')+shadow(9,14.5,6,1.5)+rect(4,2,8,13,'#6a5236')+rect(3,4,10,9,'#6a5236')+[5,8,11].map(x=>rect(x,3,1,11,'#5a4430')).join('')+rect(4,2,2,13,'#86683f')
    +rect(3,5,10,1,'#3c3326')+rect(3,11,10,1,'#3c3326')+rect(5,2,6,1,'#2a3f44'),                         // 12 barrel
  grassTile()+shadow(8,14,8,1)+rect(0,4,16,10,'#6d6e63')+[[0,4,5,5],[6,4,5,5],[12,4,4,5],[0,9,3,5],[4,9,6,5],[11,9,5,5]].map(([x,y,w,h])=>rect(x,y,w,h,'#7a7b6e')+rect(x,y,w,1,'#929385')+rect(x+w-1,y,1,h,'#55564d')).join(''), // 13 low stone wall
  rect(0,0,16,16,'#5e5648')+shadow(9,15,5,1)+rect(3,10,2,6,'#5d4630')+rect(11,10,2,6,'#5d4630')+rect(2,1,12,9,'#6a5236')+rect(2,1,12,1,'#8c7049')+rect(3,2,10,7,'#7d6444')
    +rect(4,3,4,5,'#d8cfae')+rect(4,3,4,1,'#b8b090')+rect(9,3,3,3,'#c9bc98')+rect(5,5,2,1,'#6b6152')+rect(9,7,3,1,'#e4d9b8')+rect(6,3,1,1,'#a84a32'), // 14 notice board
  wall('#4b4034','#2f281f')+rect(2,3,12,11,'#5d4630')+[4,7,10].map(y=>rect(2,y,12,1,'#3d2f21')).join('')+rect(2,3,12,1,'#7a5f3e')+rect(1,8,14,2,'#3a3a34')+rect(1,8,14,1,'#6d6e63')+rect(12,8,1,2,'#8a8a7a'), // 15 shuttered stall
  roof('#3f4650','#2e333a','#505966'),                                                                 // 16 slate roof
  rect(0,0,16,16,'#6e5a45')+rect(0,0,2,16,'#3a2e22')+rect(14,0,2,16,'#3a2e22')+rect(0,7,16,2,'#3a2e22')+[[2,0,6,7],[8,0,6,7],[2,9,6,7],[8,9,6,7]].map(([x,y,w,h])=>rect(x+1,y+1,w-1,1,'#806a52')).join('')+rect(4,2,1,4,'#3a2e22')+rect(11,10,1,4,'#3a2e22'), // 17 dark timber wall
  rect(0,0,16,16,'#5e5648')+rect(1,1,2,15,'#5d4630')+rect(13,1,2,15,'#5d4630')+rect(1,1,14,2,'#6a5236')+rect(1,1,14,1,'#8c7049')+rect(3,3,4,10,'#9a7a58')+rect(3,3,4,1,'#b4946a')+rect(8,3,4,9,'#856749')+rect(8,3,4,1,'#9a7a58')+rect(6,12,1,2,'#9a7a58'), // 18 hide rack
  rect(0,0,16,16,'#5e5648')+shadow(9,15,7,1)+rect(2,4,12,11,'#7d6444')+rect(2,4,12,1,'#a08458')+rect(2,4,1,11,'#a08458')+rect(13,5,1,10,'#5d4630')+rect(2,14,12,1,'#4a3826')
    +rect(3,6,10,1,'#5d4630',0.6)+rect(3,11,10,1,'#5d4630',0.6)+[[3,5],[12,5],[3,13],[12,13]].map(([x,y])=>rect(x,y,1,1,'#3d2f21')).join(''), // 19 crate
  wall('#cbbf9c','#8f8468')+rect(2,2,9,1,'#3d2f21')+rect(3,3,1,2,'#3d2f21')+rect(9,3,1,2,'#3d2f21')+rect(2,5,10,8,'#6a5236')+rect(2,5,10,1,'#8c7049')+rect(3,6,8,6,'#c5b275')+rect(5,7,3,4,'#6a5236')+rect(8,8,1,2,'#6a5236')+rect(5,7,3,1,'#e8dcc0'), // 20 inn sign
  wall('#6e5a45','#4a3c2e')+door('#2a2019','#4b3a29','#3a2d20'),                                       // 21 dark door
];
// Variants of the grass and the cobbles, so the town's ground isn't a grid: tufts, clover, a stone gone, moss in the joints.
const GRASS_VARIANTS = [tiles.length + 1, tiles.length + 2], COBBLE_VARIANTS = [tiles.length + 3];
tiles.push(
  scatter(tiles[2], 3, [['#7d8f55',1,2],['#6f8a4a',1,3],['#55693f',2,1],['#c9bb6e',1,1],['#d8d0b8',1,1]], 8),
  scatter(tiles[2], 4, [['#53663c',3,2],['#6a5a3c',2,1],['#7d8f55',1,2],['#4c5e36',2,2]], 6),
  tiles[0] + krect(8,8,4,4,'#4a4338') + krect(2,2,2,1,'#5a6a3a') + krect(13,12,2,1,'#5a6a3a'),
);
const svg = sheet(tiles);
writeFileSync('public/assets/town-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows(tiles)*16}" shape-rendering="crispEdges">${svg}</svg>\n`);
// TILES_ONLY=1 redraws the tiles and leaves the map alone: the map has been edited by hand since this script made it.
if (process.env.TILES_ONLY) process.exit(0);

const w=32,h=24, floor=Array(w*h).fill(0), furniture=Array(w*h).fill(0);
const put=(a,x,y,t)=>a[y*w+x]=t;
const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
// Tiled data is 1-based; 0 means empty.
const [COBBLE,WORN,GRASS,DIRT,TREE,RED,THATCH,WALL,DOOR,WINDOW,STALL,WELL,BARREL,STONE,BOARD,SHUTTER,SLATE,TIMBER,RACK,CRATE,SIGN,DARKDOOR]=tiles.map((_,i)=>i+1);
const house=(x0,x1,top,roofTile,wallTile,doorX,doorTile,windows=[])=>{
  fill(furniture,x0,top,x1,top+1,roofTile);fill(furniture,x0,top+2,x1,top+2,wallTile);
  for(const x of windows)put(furniture,x,top+2,WINDOW);put(furniture,doorX,top+2,doorTile);
};
fill(floor,0,0,w-1,h-1,GRASS);
fill(floor,14,0,17,h-1,COBBLE);                     // the high street, north to south
fill(floor,8,8,22,15,COBBLE);                       // the market square
for(const [x,y] of [[10,9],[15,12],[20,14],[12,13],[16,4],[15,19]]) put(floor,x,y,WORN);
fill(floor,23,11,30,12,DIRT);fill(floor,24,6,30,20,DIRT); // the carnivore quarter's lanes
// Trees close the town in; the road enters north and leaves south.
fill(furniture,0,0,13,0,TREE);fill(furniture,18,0,w-1,0,TREE);
fill(furniture,0,1,0,h-1,TREE);fill(furniture,w-1,1,w-1,h-1,TREE);
fill(furniture,1,h-1,13,h-1,TREE);fill(furniture,18,h-1,w-2,h-1,TREE);
// Herbivore district, west: the reeve's hall and the inn.
house(2,9,2,RED,WALL,5,DOOR,[3,8]);
house(2,10,16,THATCH,WALL,6,DOOR,[3,9]);put(furniture,4,18,SIGN);
fill(floor,5,5,6,7,COBBLE);fill(floor,6,19,6,20,COBBLE);
// Market square: stalls, the notice board, the well, and the fishmonger's barrel.
fill(furniture,9,8,11,8,STALL);fill(furniture,19,8,21,8,STALL);
put(furniture,13,7,BOARD);put(furniture,12,12,WELL);put(furniture,22,9,BARREL);put(furniture,22,10,CRATE);
// The carnivore quarter, east, behind a wall whose gate stands open by day.
fill(furniture,23,1,23,10,STONE);fill(furniture,23,13,23,h-2,STONE);
house(25,30,2,SLATE,TIMBER,27,DARKDOOR,[]);
house(25,30,14,SLATE,TIMBER,28,DARKDOOR,[]);       // the tannery
fill(furniture,25,9,26,9,RACK);put(furniture,30,9,CRATE);
put(furniture,27,20,SHUTTER);put(furniture,26,20,BARREL);
const layer=(name,data,id)=>({id,name,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
const points=[
  ['spawn',256,40],['north',256,20],['south',256,372],
  ['reeve',120,104],['innkeeper',120,328],['shopkeeper',168,168],['board',216,136],
  ['child',232,216],['fishmonger',328,168],['barrel',360,152],['fox',424,104],['stall',440,312],['from-border',256,344],['stocks',200,232],['night-trader',456,328],['seeker',280,216],['hide-1',344,40],['hide-2',488,88],['hide-3',24,360],['waystone',296,232],['from-waystone',296,248],['scribe',168,116],['lectern',184,120],
  ['hall-door',88,84],['from-hall',72,100],['inn-door',104,306],['from-inn',88,324],['tannery-door',456,274],['from-tannery',440,290],
];
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
  layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
  tilesets:[{firstgid:1,name:'town',image:'../assets/town-tiles.svg',imagewidth:128,imageheight:rows(tiles)*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows(tiles)*8,
    tiles:[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
vary(floor,w,3,GRASS_VARIANTS,5);vary(floor,w,1,COBBLE_VARIANTS,6,0.2);
writeFileSync('public/maps/town.json',JSON.stringify(map,null,2)+'\n');
