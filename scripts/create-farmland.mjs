// Rebuild the placeholder farmland tileset and Tiled JSON map: the open country south of the church.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const grass = (base) => rect(0,0,16,16,base)+rect(3,4,1,2,'#7d8f55')+rect(11,10,1,2,'#7d8f55')+rect(7,13,2,1,'#55693f');
const water = (a,b) => rect(0,0,16,16,a)+rect(2,4,5,1,b)+rect(9,10,5,1,b)+rect(5,13,3,1,b);
const tree = (leaf,dark,fruit) => rect(0,0,16,16,'#5f7442')+rect(1,1,14,11,dark)+rect(3,2,9,6,leaf)+rect(7,11,3,5,'#4a3a28')+(fruit?rect(4,4,2,2,fruit)+rect(10,7,2,2,fruit)+rect(6,9,2,2,fruit):'');
const tiles = [
  grass('#5f7442'),                                                                                    // 0 grass
  grass('#5a6f40')+rect(5,8,1,1,'#c9bb6e'),                                                            // 1 grass with a flower
  rect(0,0,16,16,'#8a7350')+rect(2,3,2,1,'#a48a60')+rect(10,9,3,1,'#6f5c40')+rect(6,13,1,1,'#a48a60'),  // 2 road
  rect(0,0,16,16,'#6a6a38')+[1,5,9,13].map(x=>rect(x,2,2,12,'#b9a352')+rect(x,0,2,3,'#d8c46f')).join(''), // 3 wheat
  rect(0,0,16,16,'#5f7442')+rect(6,0,4,16,'#6a5236')+rect(7,0,1,16,'#8c7049'),                          // 4 fence, vertical
  tree('#3f5f36','#2f4a2c'),                                                                           // 5 tree
  rect(0,0,16,16,'#535a4b')+rect(0,5,16,1,'#3b4237')+rect(0,11,16,1,'#3b4237')+rect(6,0,1,5,'#3b4237')+rect(11,6,1,5,'#3b4237'), // 6 church wall
  rect(0,0,16,16,'#2b2a22')+rect(1,0,14,16,'#6c5336')+rect(3,0,1,16,'#8f714a')+rect(12,0,1,16,'#8f714a')+rect(10,8,2,2,'#c5b275'), // 7 church door
  rect(0,0,16,16,'#5f7442')+rect(7,6,2,10,'#5d4630')+rect(2,2,12,5,'#8c7049')+rect(3,3,10,1,'#b49863'),  // 8 signpost
  rect(0,0,16,16,'#5f7442')+rect(1,4,14,11,'#a58c48')+rect(1,4,14,2,'#cdb465')+rect(1,9,14,1,'#7d6a35'),  // 9 hay bale
  rect(0,0,16,16,'#7a7444')+rect(2,5,4,1,'#a99a55')+rect(9,11,5,1,'#a99a55'),                           // 10 trampled wheat
  rect(0,0,16,16,'#5f7442')+rect(0,6,16,3,'#6a5236')+rect(0,6,16,1,'#8c7049')+rect(2,4,2,9,'#5d4630')+rect(12,4,2,9,'#5d4630'), // 11 fence, horizontal
  rect(0,0,16,16,'#6a6a38')+rect(7,4,2,12,'#5d4630')+rect(3,6,10,2,'#5d4630')+rect(5,1,6,5,'#c2a868')+rect(4,0,8,2,'#5b4a35')+rect(5,8,6,5,'#7d5b44'), // 12 scarecrow
  water('#2f5560','#4a7682'),                                                                          // 13 river
  water('#2f5560','#4a7682')+rect(0,0,3,16,'#4f6b3a')+rect(1,2,1,5,'#7d9a4a')+rect(0,9,2,6,'#6d8a40'),  // 14 reedy bank
  rect(0,0,16,16,'#2f5560')+rect(0,2,16,12,'#7a5f3e')+[2,6,10,14].map(x=>rect(x,2,1,12,'#5d4630')).join(''), // 15 bridge
  rect(0,0,16,16,'#3f6a72')+rect(1,2,5,4,'#8a8a7a')+rect(9,1,5,5,'#7d7d6e')+rect(3,9,6,5,'#8a8a7a')+rect(11,10,4,4,'#7d7d6e'), // 16 ford stones
  rect(0,0,16,16,'#bcae8a')+rect(0,0,1,16,'#8a7d60')+rect(15,0,1,16,'#8a7d60')+rect(0,15,16,1,'#8a7d60')+rect(4,4,8,6,'#3c4a48'), // 17 mill wall
  rect(0,0,16,16,'#7a5a3a')+[2,6,10,14].map(y=>rect(0,y,16,1,'#5d4630')).join(''),                     // 18 mill roof
  rect(0,0,16,16,'#2f5560')+rect(1,1,14,14,'#5d4630')+rect(3,3,10,10,'#2f5560')+rect(7,1,2,14,'#7a5f3e')+rect(1,7,14,2,'#7a5f3e'), // 19 water wheel
  tree('#4f6f3a','#355229','#c2533a'),                                                                 // 20 apple tree
  rect(0,0,16,16,'#5f7442')+rect(3,1,10,14,'#8a8b7d')+rect(4,2,8,2,'#a8a998')+rect(6,6,4,1,'#5a5b52')+rect(6,9,4,1,'#5a5b52')+rect(2,14,12,2,'#6d6e63'), // 21 Covenant shrine
  rect(0,0,16,16,'#5f7442')+rect(5,2,6,13,'#7a7b6e')+rect(6,3,3,10,'#929385')+rect(4,14,8,2,'#55564d'),  // 22 standing stone
  rect(0,0,16,16,'#3a4a30')+rect(1,6,14,10,'#8a7a58')+rect(3,3,10,4,'#9a8a66')+rect(6,1,4,3,'#a89870')+rect(7,9,2,7,'#3a2e22'), // 23 tent
  rect(0,0,16,16,'#3a4a30')+rect(3,6,10,7,'#3a3833')+rect(4,7,8,5,'#56524a')+rect(5,10,6,1,'#5d4630')+rect(7,8,2,2,'#7a4a2a'), // 24 cold campfire
  tree('#2c4a30','#1f3524'),                                                                           // 25 dark wood
  rect(0,0,16,16,'#3a4a30')+rect(3,4,2,1,'#55603e')+rect(10,10,3,1,'#2c3824'),                          // 26 woodland floor
  rect(0,0,16,16,'#5f7442')+rect(1,3,14,11,'#7a7b6e')+rect(3,5,10,7,'#929385')+rect(7,7,2,2,'#55564d'), // 27 millstone
  water('#2f5560','#4a7682')+rect(3,3,4,3,'#5f8a4a')+rect(10,9,4,3,'#5f8a4a')+rect(4,4,1,1,'#e0d6c0'), // 28 lily pond
  rect(0,0,16,16,'#5f7442')+rect(1,4,14,11,'#3f5f36')+rect(3,5,4,4,'#4f7442')+rect(9,8,4,4,'#4f7442'),   // 29 bush
];
const svg = tiles.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
writeFileSync('public/assets/fields-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="64" shape-rendering="crispEdges">${svg}</svg>\n`);

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
// The high road south to Millbrook, and a cross track from the mill to the shrine.
fill(floor,30,3,33,h-1,ROAD);fill(floor,1,22,w-1,23,ROAD);fill(floor,46,24,47,41,ROAD);fill(floor,46,40,w-1,41,ROAD);
put(furniture,34,20,SIGN);
// The mill stream runs the whole length of the west, crossed by a bridge and, further south, a ford.
fill(furniture,10,0,11,h-1,RIVER);fill(furniture,12,0,12,h-1,REEDS);
fill(furniture,10,22,12,23,0);fill(floor,10,22,12,23,BRIDGE);
fill(furniture,10,39,12,41,0);fill(floor,10,39,12,41,FORD);
// The mill, where the bear is chained to the millstone.
fill(furniture,2,8,8,9,MILLROOF);fill(furniture,2,10,8,11,MILLWALL);fill(furniture,9,9,9,11,WHEEL);
fill(floor,4,12,6,21,ROAD);put(furniture,5,14,MILLSTONE);
for(const [x,y] of [[2,16],[8,17],[3,19]]) put(furniture,x,y,HAY);
// Southwest: dark woods with a winding path to an abandoned camp.
fill(furniture,1,26,9,46,DARK);fill(floor,1,26,9,46,WOODS);
fill(furniture,1,39,9,41,0);fill(furniture,3,34,8,38,0);fill(furniture,6,26,7,33,0);fill(floor,6,24,7,25,ROAD);
put(furniture,4,34,TENT);put(furniture,6,36,FIRE);
// The locust field, with a trampled clearing and a gap in the fence from the road.
fill(furniture,14,5,27,19,WHEAT);fill(furniture,28,5,28,19,FENCE);fill(furniture,14,4,28,4,RAIL);fill(furniture,14,20,28,20,RAIL);
fill(furniture,17,9,21,13,0);fill(floor,17,9,21,13,TRAMPLED);fill(furniture,22,11,28,12,0);fill(floor,22,11,28,12,TRAMPLED);
put(furniture,17,14,SCARECROW);
// A pond in the meadow below the track.
fill(furniture,16,30,23,35,POND);fill(furniture,17,29,22,29,REEDS);
for(const [x,y] of [[15,40],[25,33],[20,43],[27,27],[14,27],[24,44]]) put(furniture,x,y,BUSH);
// Groves break up the open meadows without closing them off.
for(const [x0,y0,pattern] of [[24,39,'xx.x|.xxx|xx..'],[37,39,'.xx.|xxxx|.x.x'],[49,24,'x.xx|xx.x'],[58,44,'xxx|.xx'],[14,44,'x.x|xxx'],[60,20,'xx|xx|x.']])
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
];
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
  layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
  tilesets:[{firstgid:1,name:'fields',image:'../assets/fields-tiles.svg',imagewidth:128,imageheight:64,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:32,
    tiles:[3,4,5,6,7,8,9,11,12,13,14,17,18,19,20,21,22,23,24,25,27,28,29].map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
writeFileSync('public/maps/farmland.json',JSON.stringify(map,null,2)+'\n');
