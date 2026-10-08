// Rebuild the placeholder border-road tileset and Tiled JSON map.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const tiles = [
  rect(0,0,16,16,'#5f7442')+rect(3,4,1,2,'#7d8f55')+rect(11,10,1,2,'#7d8f55'),                                 // 0 grass
  rect(0,0,16,16,'#8a7350')+rect(2,3,2,1,'#a48a60')+rect(10,9,3,1,'#6f5c40')+rect(6,13,1,1,'#a48a60'),          // 1 road
  rect(0,0,16,16,'#2f4429')+rect(1,1,6,6,'#3e5a33')+rect(8,4,7,7,'#3a5530')+rect(3,9,6,6,'#456438')+rect(5,3,1,1,'#7a4a5a')+rect(11,12,1,1,'#7a4a5a'), // 2 hedgerow
  rect(0,0,16,16,'#8c8450')+[2,6,10,14].map(x=>rect(x,0,1,16,'#a69c5e')).join(''),                              // 3 stubble field
  rect(0,0,16,16,'#5f7442')+rect(1,3,15,9,'#6a5236')+rect(2,1,13,4,'#c9b36a')+rect(1,12,1,3,'#3a2e22')+rect(4,10,5,5,'#3a2e22')+rect(5,11,3,3,'#6a5236'), // 4 cart, rear
  rect(0,0,16,16,'#5f7442')+rect(0,3,12,9,'#6a5236')+rect(0,1,11,4,'#c9b36a')+rect(7,10,5,5,'#3a2e22')+rect(8,11,3,3,'#6a5236')+rect(12,7,4,1,'#5d4630'), // 5 cart, front
  rect(0,0,16,16,'#5f7442')+rect(3,4,10,11,'#b7a273')+rect(4,2,8,3,'#c9b685')+rect(6,1,4,2,'#8c7049')+rect(5,8,6,2,'#8d7a52'), // 6 grain sack
  rect(0,0,16,16,'#5f7442')+rect(1,1,14,11,'#2f4a2c')+rect(3,2,9,6,'#3f5f36')+rect(7,11,3,5,'#4a3a28'),         // 7 tree
  rect(0,0,16,16,'#5f7442')+rect(7,4,2,12,'#5d4630')+rect(2,1,12,5,'#7b3a2e')+rect(3,2,10,3,'#c5b275'),           // 8 border marker
  rect(0,0,16,16,'#4b4a38')+rect(3,4,3,1,'#2c2b22')+rect(9,10,4,1,'#2c2b22')+rect(6,13,1,1,'#7a6f4a'),          // 9 scorched grass
];
const svg = tiles.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
writeFileSync('public/assets/border-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="32" shape-rendering="crispEdges">${svg}</svg>\n`);

const w=32,h=24, floor=Array(w*h).fill(0), furniture=Array(w*h).fill(0);
const put=(a,x,y,t)=>a[y*w+x]=t;
const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
const [GRASS,ROAD,HEDGE,STUBBLE,CART_REAR,CART_FRONT,SACK,TREE,MARKER,SCORCH]=tiles.map((_,i)=>i+1);
fill(floor,0,0,w-1,h-1,GRASS);
fill(floor,0,0,w-1,10,STUBBLE);
fill(floor,14,0,17,h-1,ROAD);
// Hedgerows close the road in until it opens onto the cart stand.
fill(furniture,0,0,13,10,HEDGE);fill(furniture,18,0,w-1,10,HEDGE);
// A field track joins from the east, north of the brambles.
fill(furniture,18,4,w-1,5,0);fill(floor,18,4,w-1,5,ROAD);
fill(furniture,0,11,2,h-1,HEDGE);fill(furniture,w-3,11,w-1,h-1,HEDGE);
fill(furniture,3,h-1,13,h-1,TREE);fill(furniture,18,h-1,w-4,h-1,TREE);
// Grain carts turned back toward the farmland, still loaded.
for(const [x,y] of [[6,13],[6,16],[23,13]]){put(furniture,x,y,CART_FRONT);put(furniture,x+1,y,CART_REAR);}
for(const [x,y] of [[9,13],[9,14],[26,13],[25,17]]) put(furniture,x,y,SACK);
put(furniture,19,19,MARKER);
// The south is burned; the boar's farm lies that way.
for(const [x,y] of [[13,21],[18,22],[12,22],[19,20],[20,22],[11,21]]) put(floor,x,y,SCORCH);
fill(floor,14,22,17,23,SCORCH);
const layer=(name,data,id)=>({id,name,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
const points=[
  ['spawn',256,40],['north',256,20],['hedge',256,128],['bramble-1',232,152],['bramble-2',248,152],['bramble-3',264,152],['bramble-4',280,152],['bramble-5',232,168],['bramble-6',248,168],['bramble-7',264,168],['bramble-8',280,168],
  ['driver',152,264],['guard',344,248],['carts',136,232],['marker',312,328],['south',256,372],['from-farm',256,344],['east',504,80],['from-fields',480,80],['follower',256,296],
];
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
  layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
  tilesets:[{firstgid:1,name:'border',image:'../assets/border-tiles.svg',imagewidth:128,imageheight:32,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:16,
    tiles:[2,4,5,6,7,8].map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
writeFileSync('public/maps/border-road.json',JSON.stringify(map,null,2)+'\n');
