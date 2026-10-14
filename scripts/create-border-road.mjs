// Rebuild the placeholder border-road tileset and Tiled JSON map.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
import { ellipse, rect as krect, rows, scatter, sheet, stairs, vary } from './tile-kit.mjs';
import { shadow, tree, turf } from './tile-art.mjs';
const rect = (x,y,w,h,c,o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o===undefined?'':` fill-opacity="${o}"`}/>`;
const verge = () => turf('#5f7442','#7d8f55','#4f6338');
const tiles = [
  verge(),                                                                                                  // 0 grass
  rect(0,0,16,16,'#8a7350')+rect(2,3,2,1,'#a48a60')+rect(10,9,3,1,'#6f5c40')+rect(6,13,1,1,'#a48a60')+rect(12,4,1,1,'#b49a6c')+rect(13,5,1,1,'#5f4d36')+rect(4,10,2,1,'#5f4d36',0.6), // 1 road
  rect(0,0,16,16,'#2a3e26')+ellipse(4,4,4.5,4,'#3a5530')+ellipse(12,5,4.5,4.5,'#3e5a33')+ellipse(6,11.5,5,4.5,'#3a5530')+ellipse(13,13,3.5,3.5,'#3a5530')
    +ellipse(3,3,2,1.5,'#4e6e40')+ellipse(11,4,2,1.5,'#4e6e40')+ellipse(5,10,2,1.5,'#4e6e40')+rect(5,3,1,1,'#8a4a5a')+rect(11,12,1,1,'#8a4a5a')+rect(14,7,1,1,'#d8d0b8'), // 2 hedgerow
  rect(0,0,16,16,'#7a7444')+[1,5,9,13].map(x=>rect(x,0,1,16,'#a69c5e')+rect(x+1,0,1,16,'#6a6438')+rect(x,[3,9,5,12][(x-1)/4],1,2,'#c2b878')).join(''), // 3 stubble field
  verge()+shadow(8,14.5,8,1.5)+rect(1,4,15,8,'#6a5236')+rect(1,4,15,1,'#8c7049')+rect(2,1,13,4,'#c9b36a')+rect(3,1,4,2,'#e2cf86')+rect(1,11,15,1,'#4a3826')
    +ellipse(6.5,12.5,3,3,'#2a2018')+ellipse(6.5,12.5,2,2,'#6a5236')+rect(6,12,1,1,'#3a2e22')+rect(1,12,1,3,'#3a2e22'), // 4 cart, rear
  verge()+shadow(7,14.5,7,1.5)+rect(0,4,12,8,'#6a5236')+rect(0,4,12,1,'#8c7049')+rect(0,1,11,4,'#c9b36a')+rect(1,1,4,2,'#e2cf86')+rect(0,11,12,1,'#4a3826')
    +ellipse(9.5,12.5,3,3,'#2a2018')+ellipse(9.5,12.5,2,2,'#6a5236')+rect(9,12,1,1,'#3a2e22')+rect(12,7,4,1,'#5d4630')+rect(12,6,4,1,'#8c7049'), // 5 cart, front
  verge()+shadow(9,14.5,6,1.5)+ellipse(8,9,5.5,6,'#9a8862')+ellipse(7.5,8.5,4.5,5,'#b7a273')+rect(6,1,4,3,'#8c7049')+rect(6,1,4,1,'#a88a5a')+rect(5,9,6,2,'#8d7a52')+ellipse(6,6,1.5,2,'#c9b685'), // 6 grain sack
  tree({ ground:'#5f7442', leaf:'#3f5f36', dark:'#2f4a2c', light:'#56794a' }),                              // 7 tree
  verge()+shadow(10,15,3,1)+rect(7,5,2,11,'#5d4630')+rect(8,5,1,11,'#3f2f20')+rect(2,1,12,5,'#7b3a2e')+rect(2,1,12,1,'#9a5040')+rect(3,2,10,3,'#c5b275')+rect(3,2,10,1,'#e2d29a')+rect(5,3,6,1,'#7b3a2e'), // 8 border marker
  rect(0,0,16,16,'#4b4a38')+rect(3,4,3,1,'#2c2b22')+rect(9,10,4,1,'#2c2b22')+rect(6,13,1,1,'#7a6f4a')+rect(12,3,2,2,'#3a3a2e')+rect(1,11,1,2,'#5a5a42'), // 9 scorched grass
];
// Variants of the verge grass: tufts and clover, and a bare patch where the carts pulled over.
const GRASS_VARIANTS = [tiles.length + 1, tiles.length + 2];
tiles.push(
  scatter(tiles[0], 7, [['#7d8f55',1,2],['#6f8a4a',1,3],['#55693f',2,1],['#c9bb6e',1,1],['#d8d0b8',1,1]], 8),
  scatter(tiles[0], 8, [['#53663c',3,2],['#6a5a3c',2,1],['#7d8f55',1,2],['#4c5e36',2,2]], 6),
);
const svg = sheet(tiles);
writeFileSync('public/assets/border-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows(tiles)*16}" shape-rendering="crispEdges">${svg}</svg>\n`);
// TILES_ONLY=1 redraws the tiles and leaves the maps alone: they have been edited by hand since this script made them.
if (process.env.TILES_ONLY) process.exit(0);

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
// East, past the guard, the track to the highland pass.
fill(furniture,w-3,15,w-1,16,0);fill(floor,18,15,w-1,16,ROAD);
// The south is burned; the boar's farm lies that way.
for(const [x,y] of [[13,21],[18,22],[12,22],[19,20],[20,22],[11,21]]) put(floor,x,y,SCORCH);
fill(floor,14,22,17,23,SCORCH);
// West, a cart track worn white with stone dust, out to the church's quarry.
fill(furniture,0,20,2,21,0);fill(floor,0,20,13,21,ROAD);
const layer=(name,data,id)=>({id,name,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
const points=[
  ['spawn',256,40],['north',256,20],['hedge',256,128],['bramble-1',232,152],['bramble-2',248,152],['bramble-3',264,152],['bramble-4',280,152],['bramble-5',232,168],['bramble-6',248,168],['bramble-7',264,168],['bramble-8',280,168],
  ['driver',152,264],['guard',344,226],['carts',136,232],['marker',312,328],['south',256,372],['from-farm',256,344],['east',504,80],['from-fields',480,80],['camp-border',184,312],['follower',256,296],['pass',504,256],['from-pass',480,256],
  // The boar's sister keeps a barricade of charred beams across the lane to his farm.
  ['west',8,336],['from-quarry',40,336],
  ['sister',212,338],['barricade-1',232,358],['barricade-2',248,358],['barricade-3',264,358],['barricade-4',280,358],
];
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
  layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
  tilesets:[{firstgid:1,name:'border',image:'../assets/border-tiles.svg',imagewidth:128,imageheight:rows(tiles)*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows(tiles)*8,
    tiles:[2,4,5,6,7,8].map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
vary(floor,w,1,GRASS_VARIANTS,9);
writeFileSync('public/maps/border-road.json',JSON.stringify(map,null,2)+'\n');
