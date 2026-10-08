// Rebuild the placeholder burned-farm tileset and Tiled JSON map.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const tiles = [
  rect(0,0,16,16,'#4b4a38')+rect(3,4,3,1,'#2c2b22')+rect(9,10,4,1,'#2c2b22')+rect(6,13,1,1,'#7a6f4a'),                          // 0 scorched grass
  rect(0,0,16,16,'#3a3833')+rect(2,3,2,2,'#56524a')+rect(10,8,3,2,'#2a2824')+rect(6,12,2,1,'#6a5a48')+rect(12,2,1,1,'#b0603a'),   // 1 ash
  rect(0,0,16,16,'#6f5c40')+rect(2,3,2,1,'#86704d')+rect(10,9,3,1,'#5a4a33'),                                                     // 2 road
  rect(0,0,16,16,'#3a3833')+rect(1,0,14,16,'#2a221c')+rect(2,2,12,3,'#3d3027')+rect(2,9,12,3,'#3d3027')+rect(4,6,2,2,'#7a3a22'), // 3 charred wall
  rect(0,0,16,16,'#3a3833')+rect(0,7,16,3,'#2a221c')+rect(3,8,4,1,'#5a3a2a')+rect(11,5,2,8,'#2a221c'),                            // 4 fallen beam
  rect(0,0,16,16,'#4b4a38')+rect(7,3,2,13,'#2e2620')+rect(3,4,5,1,'#2e2620')+rect(9,1,4,1,'#2e2620')+rect(4,2,1,3,'#2e2620'),    // 5 dead tree
  rect(0,0,16,16,'#4b4a38')+rect(7,6,2,10,'#4a3a28')+rect(2,1,12,7,'#5a4630')+rect(3,2,10,5,'#d8d0b4')+rect(4,3,6,1,'#5a5248')+rect(4,5,8,1,'#5a5248'), // 6 gatepost notice
  rect(0,0,16,16,'#4b4a38')+rect(0,6,16,2,'#2e2620')+rect(2,4,2,9,'#2e2620')+rect(12,4,2,9,'#2e2620'),                          // 7 burned fence
];
const svg = tiles.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
writeFileSync('public/assets/ash-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="16" shape-rendering="crispEdges">${svg}</svg>\n`);

const w=32,h=24, floor=Array(w*h).fill(0), furniture=Array(w*h).fill(0);
const put=(a,x,y,t)=>a[y*w+x]=t;
const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
const [SCORCH,ASH,ROAD,WALL,BEAM,DEAD,NOTICE,FENCE]=tiles.map((_,i)=>i+1);
fill(floor,0,0,w-1,h-1,SCORCH);
fill(floor,14,0,17,9,ROAD);
fill(floor,8,10,23,19,ASH);            // the farmyard, burned bare
fill(furniture,0,0,13,0,DEAD);fill(furniture,18,0,w-1,0,DEAD);
fill(furniture,0,1,0,h-1,DEAD);fill(furniture,w-1,1,w-1,h-1,DEAD);fill(furniture,1,h-1,w-2,h-1,DEAD);
// The shell of the farmhouse, west, and the barn, east. Doorways stand open.
const ruin=(x0,y0,x1,y1,doorX)=>{fill(furniture,x0,y0,x1,y0,WALL);fill(furniture,x0,y1,x1,y1,WALL);fill(furniture,x0,y0,x0,y1,WALL);fill(furniture,x1,y0,x1,y1,WALL);put(furniture,doorX,y1,0);fill(floor,x0+1,y0+1,x1-1,y1-1,ASH);};
ruin(3,3,11,8,7);ruin(20,3,28,8,24);
put(furniture,5,5,BEAM);put(furniture,9,6,BEAM);put(furniture,22,4,BEAM);put(furniture,26,6,BEAM);
fill(furniture,1,12,6,12,FENCE);fill(furniture,25,12,30,12,FENCE);
put(furniture,13,2,NOTICE);
for(const [x,y] of [[4,17],[27,18],[6,20],[24,21],[12,21],[19,21]]) put(furniture,x,y,DEAD);
const layer=(name,data,id)=>({id,name,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
const points=[['spawn',256,40],['north',256,20],['notice',216,56],['boar',256,232],['badger',216,240],['rat',296,240],['cup',256,236],['ruin-cache',104,88],['tusk-cache',56,216]];
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
  layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
  tilesets:[{firstgid:1,name:'ash',image:'../assets/ash-tiles.svg',imagewidth:128,imageheight:16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:8,
    tiles:[3,4,5,6,7].map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
writeFileSync('public/maps/boar-farm.json',JSON.stringify(map,null,2)+'\n');
