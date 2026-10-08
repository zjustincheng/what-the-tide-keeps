// Rebuild the placeholder farm-road tileset and Tiled JSON map.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const grass = (base) => rect(0,0,16,16,base)+rect(3,4,1,2,'#7d8f55')+rect(11,10,1,2,'#7d8f55')+rect(7,13,2,1,'#55693f');
const tiles = [
  grass('#5f7442'),                                                                                   // 0 grass
  grass('#5a6f40')+rect(5,8,1,1,'#c9bb6e'),                                                           // 1 grass with a flower
  rect(0,0,16,16,'#8a7350')+rect(2,3,2,1,'#a48a60')+rect(10,9,3,1,'#6f5c40')+rect(6,13,1,1,'#a48a60'), // 2 road
  rect(0,0,16,16,'#6a6a38')+[1,5,9,13].map(x=>rect(x,2,2,12,'#b9a352')+rect(x,0,2,3,'#d8c46f')).join(''), // 3 wheat
  rect(0,0,16,16,'#5f7442')+rect(6,0,4,16,'#6a5236')+rect(7,0,1,16,'#8c7049'),                         // 4 fence, vertical
  rect(0,0,16,16,'#5f7442')+rect(1,1,14,11,'#2f4a2c')+rect(3,2,9,6,'#3f5f36')+rect(7,11,3,5,'#4a3a28'), // 5 tree
  rect(0,0,16,16,'#535a4b')+rect(0,5,16,1,'#3b4237')+rect(0,11,16,1,'#3b4237')+rect(6,0,1,5,'#3b4237')+rect(11,6,1,5,'#3b4237'), // 6 church wall
  rect(0,0,16,16,'#2b2a22')+rect(1,0,14,16,'#6c5336')+rect(3,0,1,16,'#8f714a')+rect(12,0,1,16,'#8f714a')+rect(10,8,2,2,'#c5b275'), // 7 church door
  rect(0,0,16,16,'#5f7442')+rect(7,6,2,10,'#5d4630')+rect(2,2,12,5,'#8c7049')+rect(3,3,10,1,'#b49863'), // 8 signpost
  rect(0,0,16,16,'#5f7442')+rect(1,4,14,11,'#a58c48')+rect(1,4,14,2,'#cdb465')+rect(1,9,14,1,'#7d6a35'), // 9 hay bale
  rect(0,0,16,16,'#7a7444')+rect(2,5,4,1,'#a99a55')+rect(9,11,5,1,'#a99a55'),                          // 10 trampled wheat
  rect(0,0,16,16,'#5f7442')+rect(0,6,16,3,'#6a5236')+rect(0,6,16,1,'#8c7049')+rect(2,4,2,9,'#5d4630')+rect(12,4,2,9,'#5d4630'), // 11 fence, horizontal
  rect(0,0,16,16,'#6a6a38')+rect(7,4,2,12,'#5d4630')+rect(3,6,10,2,'#5d4630')+rect(5,1,6,5,'#c2a868')+rect(4,0,8,2,'#5b4a35')+rect(5,8,6,5,'#7d5b44'), // 12 scarecrow
];
const svg = tiles.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
writeFileSync('public/assets/farm-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="32" shape-rendering="crispEdges">${svg}</svg>\n`);

const w=32,h=24, floor=Array(w*h).fill(0), furniture=Array(w*h).fill(0);
const put=(a,x,y,t)=>a[y*w+x]=t;
const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
for(let y=0;y<h;y++)for(let x=0;x<w;x++)put(floor,x,y,(x*7+y*3)%11===0?2:1);
// Tiles are 1-based in Tiled data; 0 means empty.
const G=1,FLOWER=2,ROAD=3,WHEAT=4,FENCE=5,TREE=6,WALL=7,DOOR=8,SIGN=9,HAY=10,TRAMPLED=11,RAIL=12,SCARECROW=13;
fill(floor,0,0,w-1,h-1,G);
for(const [x,y] of [[3,22],[9,3],[22,21],[27,3],[13,19],[19,6]]) put(floor,x,y,FLOWER);
fill(floor,14,3,17,h-1,ROAD);         // the road south from the church door
fill(floor,18,12,26,13,ROAD);         // a track east to the hay yard
fill(furniture,0,0,w-1,2,WALL);       // the church's south wall
put(furniture,15,2,DOOR);put(furniture,16,2,DOOR);
fill(furniture,0,3,0,h-1,TREE);fill(furniture,w-1,3,w-1,h-1,TREE);
fill(furniture,1,h-1,13,h-1,TREE);fill(furniture,18,h-1,w-2,h-1,TREE);
// West field, with a trampled path to a clearing where something has been feeding.
fill(furniture,2,5,11,20,WHEAT);fill(furniture,12,5,12,20,FENCE);fill(furniture,2,4,12,4,RAIL);
fill(furniture,5,9,9,12,0);fill(floor,5,9,9,12,TRAMPLED);
fill(furniture,10,10,12,11,0);fill(floor,10,10,12,11,TRAMPLED);
put(furniture,6,13,SCARECROW);
// East field above the track, hay yard below it.
fill(furniture,20,4,29,10,WHEAT);fill(furniture,19,4,19,10,FENCE);fill(furniture,19,3,30,3,RAIL);
fill(furniture,19,15,30,15,RAIL);fill(furniture,19,15,19,21,FENCE);fill(furniture,19,17,19,18,0);
for(const [x,y] of [[22,17],[23,17],[28,17],[21,20],[27,20],[28,20]]) put(furniture,x,y,HAY);
fill(furniture,27,12,30,13,TREE);
put(furniture,18,20,SIGN);
const layer=(name,data,id)=>({id,name,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
const points=[['spawn',256,64],['door',256,44],['locust',120,168],['locust-road',232,232],['weevil',392,296],['sign',296,328],['scarecrow',104,216],['south',256,372],['from-town',256,344]];
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
  layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
  tilesets:[{firstgid:1,name:'farm',image:'../assets/farm-tiles.svg',imagewidth:128,imageheight:32,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:16,
    tiles:[3,4,5,6,7,8,9,11,12].map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
writeFileSync('public/maps/farm-road.json',JSON.stringify(map,null,2)+'\n');
