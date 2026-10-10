// Rebuild the placeholder market-town tileset and Tiled JSON map.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const cobble = (a,b) => rect(0,0,16,16,a)+rect(0,0,7,7,b)+rect(8,0,8,7,b)+rect(4,8,8,7,b)+rect(0,8,3,7,b)+rect(13,8,3,7,b);
const roof = (a,b) => rect(0,0,16,16,a)+[2,6,10,14].map(y=>rect(0,y,16,1,b)).join('');
const wall = (a,b) => rect(0,0,16,16,a)+rect(0,0,1,16,b)+rect(15,0,1,16,b)+rect(0,15,16,1,b);
const tiles = [
  cobble('#5e5648','#6f6655'),                                                                         // 0 cobbles
  cobble('#5a5245','#685f50')+rect(9,3,2,1,'#7d735f'),                                                 // 1 worn cobbles
  rect(0,0,16,16,'#5f7442')+rect(3,4,1,2,'#7d8f55')+rect(11,10,1,2,'#7d8f55'),                         // 2 grass
  rect(0,0,16,16,'#7c684a')+rect(3,5,2,1,'#93805b')+rect(10,11,3,1,'#6a583e'),                         // 3 packed dirt
  rect(0,0,16,16,'#5f7442')+rect(1,1,14,11,'#2f4a2c')+rect(3,2,9,6,'#3f5f36')+rect(7,11,3,5,'#4a3a28'), // 4 tree
  roof('#8a4a35','#6d3627'),                                                                           // 5 red tile roof
  roof('#a68a4f','#86703f'),                                                                           // 6 thatch roof
  wall('#cbbf9c','#8f8468'),                                                                           // 7 plaster wall
  wall('#cbbf9c','#8f8468')+rect(4,3,8,13,'#5a4330')+rect(5,4,6,12,'#6e5339')+rect(9,9,1,2,'#c5b275'), // 8 door
  wall('#cbbf9c','#8f8468')+rect(4,4,8,7,'#3c4a48')+rect(7,4,2,7,'#8f8468')+rect(4,7,8,1,'#8f8468'),  // 9 window
  rect(0,0,16,16,'#5e5648')+[0,4,8,12].map((x,i)=>rect(x,0,4,8,i%2?'#d8cfae':'#7f9a6a')).join('')+rect(1,8,14,6,'#6a5236')+rect(1,8,14,1,'#8c7049'), // 10 market stall
  rect(0,0,16,16,'#5e5648')+rect(2,4,12,11,'#6c6f66')+rect(4,6,8,7,'#22332f')+rect(2,4,12,2,'#8f9184')+rect(1,0,1,8,'#5d4630')+rect(14,0,1,8,'#5d4630')+rect(1,0,14,2,'#6a5236'), // 11 well
  rect(0,0,16,16,'#5e5648')+rect(3,2,10,13,'#6a5236')+rect(3,4,10,1,'#3c3326')+rect(3,11,10,1,'#3c3326')+rect(4,2,8,1,'#2a3f44'), // 12 barrel
  rect(0,0,16,16,'#5f7442')+rect(0,4,16,10,'#6d6e63')+rect(0,4,16,2,'#8a8b7d')+rect(5,6,1,8,'#55564d')+rect(11,6,1,8,'#55564d'), // 13 low stone wall
  rect(0,0,16,16,'#5e5648')+rect(2,1,12,9,'#6a5236')+rect(3,2,10,7,'#c9bc98')+rect(4,3,4,4,'#e4d9b8')+rect(9,4,3,1,'#6b6152')+rect(3,10,2,6,'#5d4630')+rect(11,10,2,6,'#5d4630'), // 14 notice board
  wall('#4b4034','#2f281f')+rect(2,3,12,11,'#5d4630')+[4,7,10].map(y=>rect(2,y,12,1,'#3d2f21')).join('')+rect(5,8,6,1,'#d8d2bd'), // 15 shuttered stall
  roof('#3f4650','#2e333a'),                                                                           // 16 slate roof
  wall('#6e5a45','#4a3c2e')+rect(0,7,16,1,'#4a3c2e')+rect(7,0,1,16,'#4a3c2e'),                         // 17 dark timber wall
  rect(0,0,16,16,'#5e5648')+rect(1,1,1,15,'#5d4630')+rect(14,1,1,15,'#5d4630')+rect(1,2,14,1,'#5d4630')+rect(3,3,4,9,'#9a7a58')+rect(9,3,4,8,'#856749'), // 18 hide rack
  rect(0,0,16,16,'#5e5648')+rect(2,4,12,11,'#7d6444')+rect(2,4,12,1,'#a08458')+rect(2,4,1,11,'#a08458')+rect(2,9,12,1,'#5d4630'), // 19 crate
  wall('#cbbf9c','#8f8468')+rect(3,3,10,6,'#6a5236')+rect(4,4,8,4,'#c5b275')+rect(6,5,4,2,'#6a5236'), // 20 inn sign
  wall('#6e5a45','#4a3c2e')+rect(4,3,8,13,'#3a2d20')+rect(5,4,6,12,'#4b3a29'),                         // 21 dark door
];
const svg = tiles.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
writeFileSync('public/assets/town-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="48" shape-rendering="crispEdges">${svg}</svg>\n`);

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
  ['reeve',88,104],['innkeeper',120,328],['shopkeeper',168,160],['board',216,136],
  ['child',232,216],['fishmonger',328,160],['barrel',360,152],['fox',424,104],['stall',440,312],['from-border',256,344],['stocks',200,232],['night-trader',456,328],['seeker',280,216],['hide-1',24,24],['hide-2',488,88],['hide-3',24,360],['waystone',296,232],['from-waystone',296,248],['scribe',168,120],['lectern',184,120],
  ['hall-door',88,84],['from-hall',72,100],['inn-door',104,306],['from-inn',88,324],['tannery-door',456,274],['from-tannery',440,290],
];
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
  layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
  tilesets:[{firstgid:1,name:'town',image:'../assets/town-tiles.svg',imagewidth:128,imageheight:48,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:24,
    tiles:[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
writeFileSync('public/maps/town.json',JSON.stringify(map,null,2)+'\n');
