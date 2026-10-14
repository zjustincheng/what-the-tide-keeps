// Rebuild the placeholder farmland tileset and Tiled JSON map: the open country south of the church.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
import { ellipse, rows, scatter, sheet, vary } from './tile-kit.mjs';
const rect = (x,y,w,h,c,o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o===undefined?'':` fill-opacity="${o}"`}/>`;
// The farmland, drawn lit from the upper left: highlights up and left, shadow down and right, so everything stands on the ground.
const GREEN = '#5f7442', G_LIGHT = '#6f8650', G_DARK = '#4f6338', SOIL = '#5a5530';
const WATER = '#2f5560', WATER_DEEP = '#264853', RIPPLE = '#4a7682', GLINT = '#7aa3ab';
const WOOD = '#6a5236', WOOD_LIGHT = '#8c7049', WOOD_DARK = '#4a3826';
const ROCK = '#7a7b6e', ROCK_LIGHT = '#969789', ROCK_DARK = '#55564d';
// Grass with a few tufts: a light blade over a dark one, so they read as blades and not dots.
const tuft = (x,y) => rect(x,y,1,2,'#7d8f55')+rect(x+1,y+1,1,1,G_DARK);
const grass = (base=GREEN) => rect(0,0,16,16,base)+tuft(3,4)+tuft(11,10)+tuft(7,13)+rect(13,2,1,1,G_LIGHT);
// A shadow cast on the ground, down and to the right of whatever stands there.
const shadow = (cx,cy,rx,ry) => ellipse(cx,cy,rx,ry,'#000000',0.22);
const water = () => rect(0,0,16,16,WATER)+rect(1,13,3,1,WATER_DEEP)+rect(11,5,3,1,WATER_DEEP)
  +rect(2,3,4,1,RIPPLE)+rect(3,2,2,1,RIPPLE,0.5)+rect(9,8,5,1,RIPPLE)+rect(10,7,3,1,RIPPLE,0.5)+rect(4,12,3,1,RIPPLE)+rect(12,3,1,1,GLINT)+rect(6,9,1,1,GLINT);
// A tree: a round canopy, darker underneath, lit on top, a trunk with its shaded side, and a shadow at its foot.
const tree = (leaf, dark, light, fruit, ground=GREEN) => rect(0,0,16,16,ground)+shadow(9,14.5,6,1.6)
  +rect(7,10,3,6,'#4a3a28')+rect(9,10,1,6,'#33281c')
  +ellipse(8,6.5,7.5,6.5,dark)+ellipse(7,5.5,6,5,leaf)+ellipse(5.5,3.5,3,2,light)+rect(11,7,2,1,dark)+rect(3,8,1,1,dark)
  +(fruit ? rect(4,5,2,2,fruit)+rect(4,5,1,1,'#e08a6a')+rect(10,4,2,2,fruit)+rect(10,4,1,1,'#e08a6a')+rect(7,8,2,2,fruit) : '');
const stalks = (heads) => [1,5,9,13].map((x,i) => { const top = i % 2 ? 1 : 3;
  return rect(x,top+3,1,13-top-3,'#8a7838')+rect(x+1,top+4,1,12-top-3,'#6f6030')+(heads ? rect(x,top,2,4,'#d2bd68')+rect(x,top,1,2,'#e8d890')+rect(x+1,top+3,1,1,'#a89048') : ''); }).join('');
const tiles = [
  grass(),                                                                                                 // 0 grass
  grass('#5a6f40')+rect(5,8,1,1,'#d8cf9a')+rect(4,8,1,1,'#c9bb6e')+rect(6,8,1,1,'#c9bb6e')+rect(5,7,1,1,'#c9bb6e')+rect(5,9,1,1,'#c9bb6e'), // 1 grass with a flower
  rect(0,0,16,16,'#8a7350')+rect(0,0,16,1,'#7a6646')+rect(2,3,2,1,'#a48a60')+rect(10,9,3,1,'#6f5c40')+rect(6,13,1,1,'#a48a60')
    +rect(12,4,1,1,'#b49a6c')+rect(13,5,1,1,'#5f4d36')+rect(4,10,2,1,'#5f4d36',0.6)+rect(8,6,1,1,'#a48a60'),  // 2 road
  rect(0,0,16,16,SOIL)+stalks(true),                                                                       // 3 wheat
  grass()+shadow(10,15,2,1)+rect(7,0,2,16,WOOD)+rect(7,0,1,16,WOOD_LIGHT)+rect(6,2,4,3,WOOD)+rect(6,2,4,1,WOOD_LIGHT)+rect(6,10,4,3,WOOD)+rect(6,10,4,1,WOOD_LIGHT)+rect(9,3,1,2,WOOD_DARK)+rect(9,11,1,2,WOOD_DARK), // 4 fence, vertical
  tree('#3f5f36','#2f4a2c','#56794a'),                                                                     // 5 tree
  rect(0,0,16,16,'#3b4237')+[[0,0,7,5],[8,0,8,5],[0,6,4,5],[5,6,7,5],[13,6,3,5],[0,12,9,4],[10,12,6,4]].map(([x,y,w,h]) =>
    rect(x,y,w,h,'#535a4b')+rect(x,y,w,1,'#646b5b')+rect(x+w-1,y,1,h,'#454c40')).join(''),                 // 6 church wall
  rect(0,0,16,16,'#2b2a22')+rect(1,0,14,16,'#6c5336')+[4,8,12].map(x=>rect(x,0,1,16,'#4f3c27')).join('')+rect(1,0,14,1,'#8f714a')
    +rect(1,4,14,1,'#3d3020')+rect(1,11,14,1,'#3d3020')+[3,7,11].map(x=>rect(x,4,1,1,'#9a9a8a')+rect(x,11,1,1,'#9a9a8a')).join('')+rect(10,7,2,2,'#c5b275')+rect(10,7,1,1,'#e2d29a'), // 7 church door
  grass()+shadow(10,15,3,1)+rect(7,6,2,10,'#5d4630')+rect(8,6,1,10,'#3f2f20')+rect(2,2,12,5,WOOD_LIGHT)+rect(2,2,12,1,'#b49863')+rect(2,6,12,1,WOOD)+rect(13,2,1,5,WOOD)+rect(4,4,6,1,'#5d4630')+rect(4,4,1,1,'#3f2f20'), // 8 signpost
  grass()+shadow(9,13.5,7,2)+rect(2,4,12,10,'#a58c48')+rect(1,5,14,8,'#a58c48')+rect(2,4,12,2,'#cdb465')+rect(1,5,1,2,'#cdb465')
    +[4,8,11].map(x=>rect(x,6,1,7,'#8a7438')).join('')+rect(1,12,14,1,'#7d6a35')+rect(14,6,1,7,'#7d6a35')+rect(5,7,1,1,'#e2cf86')+rect(9,9,1,1,'#e2cf86'), // 9 hay bale
  rect(0,0,16,16,'#7a7444')+[[1,3],[6,6],[10,2],[3,10],[9,12]].map(([x,y])=>rect(x,y,4,1,'#a99a55')+rect(x+1,y+1,3,1,'#5f5a34')).join('')+rect(12,8,2,2,'#d2bd68'), // 10 trampled wheat
  grass()+shadow(8,11,8,1)+rect(0,5,16,2,WOOD)+rect(0,5,16,1,WOOD_LIGHT)+rect(0,9,16,2,WOOD)+rect(0,9,16,1,WOOD_LIGHT)
    +rect(2,3,3,10,'#5d4630')+rect(2,3,3,1,WOOD_LIGHT)+rect(4,4,1,9,WOOD_DARK)+rect(11,3,3,10,'#5d4630')+rect(11,3,3,1,WOOD_LIGHT)+rect(13,4,1,9,WOOD_DARK), // 11 fence, horizontal
  rect(0,0,16,16,SOIL)+stalks(true)+rect(7,4,2,12,'#5d4630')+rect(2,6,12,2,'#5d4630')+rect(1,6,1,3,'#c2a868')+rect(14,6,1,3,'#c2a868')
    +rect(5,1,6,5,'#c2a868')+rect(6,3,1,1,'#2b2420')+rect(9,3,1,1,'#2b2420')+rect(4,0,8,2,'#5b4a35')+rect(3,1,10,1,'#4a3c2c')+rect(5,8,6,5,'#7d5b44')+rect(10,8,1,5,'#5d4434'), // 12 scarecrow
  water(),                                                                                                 // 13 river
  water()+rect(0,0,4,16,'#4f6b3a')+rect(4,0,1,16,'#3f5530')+[[1,2],[2,7],[0,11]].map(([x,y])=>rect(x,y,1,5,'#7d9a4a')+rect(x,y,1,2,'#5d4630')).join('')+rect(3,4,1,4,'#6d8a40'), // 14 reedy bank
  rect(0,0,16,16,WATER)+rect(0,2,16,12,'#7a5f3e')+[0,4,8,12].map(x=>rect(x,2,1,12,'#5d4630')+rect(x+1,2,1,12,'#94764e')).join('')
    +rect(0,2,16,1,'#a48a60')+rect(0,13,16,1,'#4a3826')+rect(2,6,1,1,'#3d3020')+rect(10,10,1,1,'#3d3020'), // 15 bridge
  rect(0,0,16,16,'#3f6a72')+[[1,2,5,4],[9,1,5,5],[3,9,6,5],[11,10,4,4]].map(([x,y,w,h]) =>
    rect(x,y+h,w,1,'#d8e4e0',0.35)+rect(x,y,w,h,ROCK)+rect(x,y,w,1,ROCK_LIGHT)+rect(x,y,1,h,ROCK_LIGHT)+rect(x+w-1,y+1,1,h-1,ROCK_DARK)).join(''), // 16 ford stones
  rect(0,0,16,16,'#bcae8a')+rect(0,0,16,2,'#4a3826')+rect(0,0,2,16,'#4a3826')+rect(14,0,2,16,'#4a3826')+rect(2,8,12,1,'#4a3826')
    +rect(4,3,8,4,'#3c4a48')+rect(4,3,8,1,'#2a3432')+rect(7,3,1,4,'#4a3826')+rect(2,9,12,1,'#d2c6a2')+rect(3,12,2,1,'#a8997a'), // 17 mill wall
  rect(0,0,16,16,'#5d4630')+[0,4,8,12].map((y,i)=>rect(0,y,16,3,'#7a5a3a')+rect(0,y,16,1,'#94704a')+[2,6,10,14].map(x=>rect((x+(i%2)*2)%16,y,1,3,'#5d4630')).join('')).join(''), // 18 mill roof
  rect(0,0,16,16,WATER)+ellipse(8,8,7.5,7.5,'#4a3826')+ellipse(8,8,6,6,'#2f5560')+rect(7,1,2,14,'#7a5f3e')+rect(1,7,14,2,'#7a5f3e')
    +rect(7,1,1,14,'#94764e')+rect(1,7,14,1,'#94764e')+ellipse(8,8,1.5,1.5,'#3d3020')+rect(2,13,3,1,'#d8e4e0',0.5)+rect(11,14,3,1,'#d8e4e0',0.4), // 19 water wheel
  tree('#4f6f3a','#355229','#679050','#b84a32'),                                                           // 20 apple tree
  grass()+shadow(9,15,6,1)+rect(3,1,10,14,ROCK)+rect(3,1,10,1,ROCK_LIGHT)+rect(3,1,1,13,ROCK_LIGHT)+rect(12,2,1,12,ROCK_DARK)
    +rect(5,4,6,1,ROCK_DARK)+rect(5,7,6,1,ROCK_DARK)+rect(6,10,4,1,ROCK_DARK)+rect(4,11,2,3,'#5f7a48')+rect(2,14,12,2,'#6d6e63')+rect(2,14,12,1,'#8a8b7d'), // 21 Covenant shrine
  grass()+shadow(10,15,4,1)+rect(5,2,6,13,ROCK)+rect(6,1,4,1,ROCK)+rect(5,2,2,12,ROCK_LIGHT)+rect(10,2,1,13,ROCK_DARK)+rect(7,6,1,3,'#5f7a48')+rect(8,10,2,2,'#7a8a5a')+rect(4,14,8,2,'#55564d'), // 22 standing stone
  rect(0,0,16,16,'#3a4a30')+shadow(9,15,7,1)+rect(1,8,14,8,'#8a7a58')+rect(2,6,12,2,'#8a7a58')+rect(4,4,8,2,'#9a8a66')+rect(6,2,4,2,'#a89870')+rect(7,0,2,2,'#5d4630')
    +rect(2,6,5,2,'#a89870')+rect(9,8,6,8,'#74664a')+rect(6,9,4,7,'#2a2219')+rect(6,9,1,7,'#4a3c2c'),     // 23 tent
  rect(0,0,16,16,'#3a4a30')+[[3,5],[7,4],[11,5],[12,9],[11,12],[7,13],[3,12],[2,9]].map(([x,y])=>rect(x,y,2,2,'#6d6e63')+rect(x,y,1,1,'#8a8b7d')).join('')
    +ellipse(7.5,9,4,3,'#2e2c28')+rect(5,8,6,2,'#3d2a1c')+rect(6,10,5,1,'#4a3020')+rect(8,9,1,1,'#7a4a2a'),     // 24 cold campfire
  tree('#2c4a30','#1f3524','#3d6040',undefined,'#3a4a30'),                                                 // 25 dark wood
  rect(0,0,16,16,'#3a4a30')+[[3,4,'#55603e'],[10,10,'#2c3824'],[12,3,'#6a5a3a'],[5,12,'#5a4a30'],[8,7,'#4a5a38'],[1,9,'#2c3824']].map(([x,y,c])=>rect(x,y,2,1,c)).join('')+rect(14,13,1,1,'#7a6a40'), // 26 woodland floor
  grass()+shadow(9,13,7,2)+ellipse(8,8,7,5.5,ROCK_DARK)+ellipse(7.5,7.5,6.5,5,ROCK)+ellipse(6,6,3,2,ROCK_LIGHT)+ellipse(8,8,1.5,1.2,'#3a3a34')
    +rect(3,8,3,1,ROCK_DARK)+rect(10,9,3,1,ROCK_DARK),                                                    // 27 millstone
  water()+ellipse(5,4.5,2.5,2,'#5f8a4a')+rect(5,3,1,2,WATER)+ellipse(12,10.5,2.5,2,'#5f8a4a')+rect(12,9,1,2,WATER)+rect(4,4,1,1,'#e0d6c0')+rect(4,3,1,1,'#c8a8b0'), // 28 lily pond
  grass()+shadow(9,14,7,1.5)+ellipse(8,9,7.5,5.5,'#2f4a2c')+ellipse(5,8,4,4,'#3f5f36')+ellipse(11,9,4,3.5,'#3f5f36')+ellipse(4,6.5,2,1.5,'#56794a')+ellipse(10,7.5,2,1.5,'#56794a'), // 29 bush
];
// Variants of the grass, scattered over the fields so they don't read as a grid: tufts and clover, and a little bare earth.
const GRASS_VARIANTS = [tiles.length + 1, tiles.length + 2];
tiles.push(
  scatter(grass('#5f7442'), 1, [['#7d8f55',1,2],['#6f8a4a',1,3],['#55693f',2,1],['#c9bb6e',1,1],['#d8d0b8',1,1]], 8),
  scatter(grass('#5f7442'), 2, [['#53663c',3,2],['#6a5a3c',2,1],['#7d8f55',1,2],['#4c5e36',2,2]], 6),
);
const svg = sheet(tiles);
writeFileSync('public/assets/fields-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows(tiles)*16}" shape-rendering="crispEdges">${svg}</svg>\n`);
// TILES_ONLY=1 redraws the tiles and leaves the map alone: the map has been edited by hand since this script made it.
if (process.env.TILES_ONLY) process.exit(0);

const w=64,h=48, floor=Array(w*h).fill(0), furniture=Array(w*h).fill(0);
const put=(a,x,y,t)=>a[y*w+x]=t;
const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
// Tiled data is 1-based; 0 means empty.
const [G,FLOWER,ROAD,WHEAT,FENCE,TREE,WALL,DOOR,SIGN,HAY,TRAMPLED,RAIL,SCARECROW,RIVER,REEDS,BRIDGE,FORD,MILLWALL,MILLROOF,WHEEL,APPLE,SHRINE,STONE,TENT,FIRE,DARK,WOODS,MILLSTONE,POND,BUSH]=tiles.map((_,i)=>i+1);
fill(floor,0,0,w-1,h-1,G);
for(let i=0;i<60;i++) put(floor,(i*37+11)%w,(i*23+7)%h,FLOWER);
// Edges: the church's south wall to the north, trees everywhere else, with gaps for the roads out.
fill(furniture,0,0,w-1,1,TREE);fill(furniture,22,0,41,2,WALL);put(furniture,31,2,DOOR);put(furniture,32,2,DOOR);
fill(furniture,0,0,0,h-1,TREE);fill(furniture,w-1,0,w-1,h-1,TREE);fill(furniture,0,h-1,w-1,h-1,TREE);
fill(furniture,30,h-1,33,h-1,0);fill(furniture,w-1,40,w-1,41,0);
// The track runs on east up onto the downs; a path follows the stream north into the fen.
fill(furniture,w-1,22,w-1,23,0);fill(furniture,13,0,14,1,0);fill(floor,13,0,14,3,ROAD);
// The high road south to Millbrook, and a cross track from the mill to the shrine.
fill(floor,30,3,33,h-1,ROAD);fill(floor,1,22,w-1,23,ROAD);fill(floor,46,24,47,41,ROAD);fill(floor,46,40,w-1,41,ROAD);
put(furniture,34,20,SIGN);
// Where the track bends south for the border, a second waymark.
put(furniture,48,21,SIGN);
// The mill stream runs the whole length of the west, crossed by a bridge and, further south, a ford.
fill(furniture,10,0,11,h-1,RIVER);fill(furniture,12,0,12,h-1,REEDS);
fill(furniture,10,22,12,23,0);fill(floor,10,22,12,23,BRIDGE);
fill(furniture,10,39,12,41,0);fill(floor,10,39,12,41,FORD);
// The mill, where the bear is chained to the millstone.
fill(furniture,2,8,8,9,MILLROOF);fill(furniture,2,10,8,11,MILLWALL);fill(furniture,9,9,9,11,WHEEL);
fill(floor,4,12,6,21,ROAD);put(furniture,5,14,MILLSTONE);put(furniture,5,11,DOOR);
for(const [x,y] of [[2,16],[8,17],[3,19]]) put(furniture,x,y,HAY);
// Southwest: dark woods with a winding path to an abandoned camp.
fill(furniture,1,26,9,46,DARK);fill(floor,1,26,9,46,WOODS);
fill(furniture,1,39,9,41,0);fill(furniture,3,34,8,38,0);fill(furniture,6,26,7,33,0);fill(floor,6,24,7,25,ROAD);
put(furniture,4,34,TENT);put(furniture,6,36,FIRE);
// Deeper in, a hollow where something large has made its nest.
fill(furniture,2,42,7,45,0);
// The locust field, with a trampled clearing and a gap in the fence from the road.
fill(furniture,14,5,27,19,WHEAT);fill(furniture,28,5,28,19,FENCE);fill(furniture,14,4,28,4,RAIL);fill(furniture,14,20,28,20,RAIL);
fill(furniture,17,9,21,13,0);fill(floor,17,9,21,13,TRAMPLED);fill(furniture,22,11,28,12,0);fill(floor,22,11,28,12,TRAMPLED);
put(furniture,17,14,SCARECROW);
// A pond in the meadow below the track.
fill(furniture,16,30,23,35,POND);fill(furniture,17,29,22,29,REEDS);
for(const [x,y] of [[15,40],[25,33],[20,43],[27,27],[14,27],[24,44]]) put(furniture,x,y,BUSH);
// Groves break up the open meadows without closing them off.
for(const [x0,y0,pattern] of [[24,39,'xx.x|.xxx|xx..'],[37,39,'.xx.|xxxx|.x.x'],[49,24,'x.xx|xx.x'],[58,44,'xxx|.xx'],[14,44,'x.x|xxx'],[60,18,'xx|xx']])
  pattern.split('|').forEach((row,dy)=>[...row].forEach((c,dx)=>{ if(c==='x') put(furniture,x0+dx,y0+dy,TREE); }));
// The orchard, east of the road, in rows with room to walk between.
for(let x=38;x<=56;x+=3) for(let y=5;y<=17;y+=3) put(furniture,x,y,APPLE);
// The hay yard, fenced, below the track.
fill(furniture,36,27,44,27,RAIL);fill(furniture,36,34,44,34,RAIL);fill(furniture,36,28,36,33,FENCE);fill(furniture,44,28,44,33,FENCE);fill(furniture,44,30,44,31,0);
for(const [x,y] of [[38,29],[39,29],[38,32],[42,32]]) put(furniture,x,y,HAY);
// An old Covenant shrine in a ring of standing stones, southeast.
put(furniture,55,33,SHRINE);
for(const [x,y] of [[52,30],[58,30],[51,33],[59,35],[52,36],[55,37]]) put(furniture,x,y,STONE);
const layer=(name,data,id)=>({id,name,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
const points=[
  ['spawn',512,64],['door',512,44],['south',512,760],['from-town',512,736],['east',1016,656],['from-border',996,656],
  ['sign',552,344],['locust',312,184],['bell',280,152],['scarecrow',280,232],['locust-road',488,280],
  ['bear',104,232],['miller',56,216],['heron',296,600],['camp',104,616],['camp-cache',56,616],['weevil-woods',136,656],
  ['weevil-orchard',728,200],['orchard-cache',920,104],['weevil-yard',664,488],
  ['shrine',888,504],['shrine-cache',888,568],['exile',888,456],['ford-cache',216,680],['pond-spot',392,512],['stream-spot',216,224],
  ['shepherd',440,696],['sheep-woods',104,472],['sheep-orchard',616,248],['sheep-yard',744,520],['swarm',72,712],['stream-bank',216,392],['camp-fields',600,392],['camp-woods',88,584],['gibbet',440,344],['bones',120,696],['warden',888,568],['leech',184,648],['mill-door',88,196],['from-mill',88,210],['log',112,424],['waymark',776,360],['waystone',568,424],['from-waystone',568,440],['pilgrim',712,344],['pilgrim-shrine',856,504],['carter-cart',664,404],['hive-1',824,104],['hive-2',840,152],['forage-1',232,504],['forage-2',88,600],['forage-3',424,520],['forage-4',680,328],['forage-5',104,648],['carter',632,408],['beekeeper',840,120],['downs',1016,368],['from-downs',992,368],['upstream',224,16],['from-fen',224,52],
  ['water-1',168,628],['water-2',184,628],['water-3',200,628],['water-4',168,668],['water-5',184,668],['water-6',200,668],
];
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
  layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
  tilesets:[{firstgid:1,name:'fields',image:'../assets/fields-tiles.svg',imagewidth:128,imageheight:rows(tiles)*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows(tiles)*8,
    tiles:[3,4,5,6,7,8,9,11,12,13,14,17,18,19,20,21,22,23,24,25,27,28,29].map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
vary(floor,w,G,GRASS_VARIANTS,11);
map.layers[0].data=floor;
writeFileSync('public/maps/farmland.json',JSON.stringify(map,null,2)+'\n');
