// Rebuild the original placeholder tileset and Tiled JSON map.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
import { ellipse, sheet } from './tile-kit.mjs';
const rect = (x,y,w,h,c,o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o===undefined?'':` fill-opacity="${o}"`}/>`;
// The church: cold green stone, lit from the upper left by the windows, warmed only by its candles.
const FLOOR = '#3b5045', FLOOR_LIGHT = '#566455', FLOOR_DARK = '#293e35';
const flag = (base) => rect(0,0,16,16,FLOOR_DARK)+rect(0,0,15,15,base)+rect(0,0,15,1,FLOOR_LIGHT)+rect(0,0,1,15,'#4a5e50')+rect(3,4,2,1,'#52604e')+rect(10,11,3,1,'#30473c')+rect(6,7,4,2,'#ffffff',0.03);
const shadow = (cx,cy,rx,ry) => ellipse(cx,cy,rx,ry,'#000000',0.3);
const tiles = [
  flag(FLOOR),                                                                                                   // 0 floor
  flag('#384b40')+rect(8,3,1,4,FLOOR_DARK)+rect(9,6,2,1,FLOOR_DARK),                                              // 1 floor, cracked
  rect(0,0,16,16,'#1e302b')+[[0,0,7,5],[8,0,8,5],[0,6,4,4],[5,6,7,4],[13,6,3,4],[0,11,9,5],[10,11,6,5]].map(([x,y,w,h]) =>
    rect(x,y,w,h,'#4b5a49')+rect(x,y,w,1,'#63715a')+rect(x+w-1,y+1,1,h-1,'#3a4a3c')).join(''),                  // 2 wall
  rect(0,0,16,16,'#73583c')+rect(0,0,2,16,'#a58b56')+rect(14,0,2,16,'#a58b56')+rect(2,0,1,16,'#c2a868')+rect(4,0,8,16,'#604c36')
    +rect(7,4,2,7,'#8f754c')+rect(5,6,6,2,'#8f754c')+rect(7,4,1,7,'#a88c58'),                                   // 3 aisle runner
  shadow(9,15,7,1)+rect(1,1,14,4,'#89704b')+rect(1,1,14,1,'#b39a65')+rect(1,5,14,1,'#5e4a32')+rect(2,6,12,6,'#6e5539')+rect(2,6,12,1,'#927648')
    +[5,9].map(x=>rect(x,7,1,5,'#5a4430')).join('')+rect(2,12,2,3,'#483b29')+rect(12,12,2,3,'#483b29')+rect(13,6,1,6,'#4a3a28'), // 4 pew
  shadow(9,15,6,1)+rect(3,0,10,3,'#92957b')+rect(3,0,10,1,'#b4b69a')+rect(4,3,8,10,'#788573')+[5,8,10].map(x=>rect(x,3,1,10,'#a2a386')).join('')
    +rect(11,3,1,10,'#5a6656')+rect(3,13,10,3,'#92957b')+rect(3,13,10,1,'#b4b69a')+rect(12,13,1,3,'#5a6656'),   // 5 pillar
  rect(0,0,16,16,'#1e302b')+rect(2,1,12,14,'#4b5a49')+rect(3,2,10,12,'#22332f')+ellipse(8,4,5,3,'#22332f')
    +rect(4,4,3,4,'#5d8f86')+rect(9,4,3,4,'#b8a868')+rect(4,9,3,4,'#8a5a5a')+rect(9,9,3,4,'#6d8fa0')+rect(4,4,1,1,'#a8d0c4')+rect(9,4,1,1,'#e8d898')
    +rect(7,3,2,11,'#2a3f38')+rect(3,8,10,1,'#2a3f38')+rect(1,14,14,2,'#818575')+rect(1,14,14,1,'#a0a492'),       // 6 stained window
  shadow(8,15,8,1)+rect(0,2,16,11,'#a09a77')+rect(0,2,16,1,'#d1c29a')+rect(0,3,16,1,'#c8a85a')+rect(0,11,16,2,'#c8a85a')+rect(6,4,4,6,'#bdaf84')+rect(7,5,2,4,'#e2d29a')
    +rect(0,13,16,3,'#60634c')+rect(15,3,1,10,'#7a7458'),                                                       // 7 altar
  shadow(9,15,6,1)+rect(2,2,12,12,'#657762')+rect(2,2,12,1,'#8a9a84')+rect(3,3,10,10,'#81907a')+ellipse(8,8,4,3.5,'#1a3a38')+ellipse(8,8,3,2.5,'#4a7a70')
    +rect(6,6,2,1,'#a8c8bc')+rect(9,9,1,1,'#7aa89a')+rect(2,13,12,2,'#445943')+rect(13,3,1,11,'#4a5a46'),       // 8 basin of salt water
  rect(0,0,16,16,FLOOR)+shadow(9,15,6,1)+rect(3,1,10,14,'#493e30')+rect(3,1,10,1,'#6a5a46')+rect(4,2,8,4,'#b1b69a')+rect(5,3,3,2,'#c8ccb2')
    +rect(4,6,8,8,'#6f7d68')+rect(4,6,8,1,'#89967b')+rect(4,10,8,1,'#5f6c58')+rect(3,14,2,2,'#2e3026')+rect(11,14,2,2,'#2e3026'), // 9 cot
  rect(0,0,16,16,FLOOR)+shadow(9,15,7,1)+rect(2,2,12,12,'#5a4833')+rect(2,2,12,1,'#7a6448')+rect(3,3,10,10,'#816a44')+rect(4,4,8,7,'#c5b989')+rect(8,4,1,7,'#73694c')
    +[5,6,7].map(y=>rect(5,y,2,1,'#857955')).join('')+[6,8,9].map(y=>rect(10,y,2,1,'#857955')).join('')+rect(4,11,8,1,'#6a5a3a'), // 10 ledger
  rect(0,0,16,16,'#202e29')+rect(2,0,12,16,'#735939')+[3,7,12].map(x=>rect(x,0,1,16,'#a3854e')).join('')+[5,10].map(x=>rect(x,0,1,16,'#5a4430')).join('')
    +rect(3,4,10,2,'#302e26')+rect(3,12,10,2,'#302e26')+[4,8,11].map(x=>rect(x,4,1,1,'#8a8a7a')+rect(x,12,1,1,'#8a8a7a')).join('')+rect(10,8,2,2,'#c5b275')+rect(10,8,1,1,'#e2d29a'), // 11 door
  rect(0,0,16,16,FLOOR)+ellipse(8,4,6,6,'#e1a558',0.12)+ellipse(8,4,3.5,3.5,'#f0c070',0.15)+rect(6,9,4,4,'#806d41')+rect(6,9,4,1,'#a18d55')+rect(4,13,8,2,'#a18d55')+rect(4,13,8,1,'#c2ae70')
    +rect(7,4,2,5,'#e2d3a2')+rect(8,4,1,5,'#c8b888')+rect(7,1,2,3,'#e1a558')+rect(7,2,1,2,'#fff0b2'),           // 12 candle
  rect(0,0,16,16,FLOOR)+shadow(9,15,6,1)+rect(2,12,12,3,'#8c9476')+rect(2,12,12,1,'#a8b090')+rect(4,2,8,10,'#65765f')+rect(5,1,6,2,'#94a087')+rect(6,0,4,2,'#94a087')
    +rect(7,4,2,7,'#b1b395')+rect(5,6,6,2,'#b1b395')+rect(11,3,1,9,'#4a5a46'),                                  // 13 statue
  rect(0,0,16,16,'#142722')+rect(0,0,16,3,'#344e3f')+rect(0,3,16,1,'#000000',0.3),                                // 14 the dark beyond the walls
  rect(0,0,16,16,FLOOR)+shadow(8,14,7,1)+rect(1,6,14,7,'#53614e')+rect(1,6,14,1,'#6a7862')+rect(2,5,12,2,'#9b9c78')+rect(4,2,8,4,'#748365')+rect(4,2,8,1,'#94a283')
    +rect(7,0,2,6,'#b7b58c')+rect(6,1,4,1,'#b7b58c')+rect(14,6,1,7,'#3e4a3a'),                                  // 15 reliquary
];
writeFileSync('public/assets/church-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="32" shape-rendering="crispEdges">${sheet(tiles)}</svg>\n`);
// TILES_ONLY=1 redraws the tiles and leaves the map alone: it has been edited by hand since this script made it.
if (process.env.TILES_ONLY) process.exit(0);
const w=32,h=24, floor=Array(w*h).fill(0),furniture=Array(w*h).fill(0);
const put=(a,x,y,t)=>a[y*w+x]=t;
for(let y=0;y<h;y++)for(let x=0;x<w;x++)put(floor,x,y,(x+y)%3===0?2:1);
for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<2||x>29||y<3||y>21)put(furniture,x,y,3);
for(let y=5;y<22;y++)for(let x=14;x<=17;x++)put(floor,x,y,4);
for(const x of [5,10,21,26])put(furniture,x,2,7);
for(const y of [6,10,14,18])for(const x of [3,28])put(furniture,x,y,6);
for(const y of [10,13,16])for(const start of [7,21])for(let x=start;x<start+4;x++)put(furniture,x,y,5);
for(let x=13;x<=18;x++)put(furniture,x,5,8);
put(furniture,15,4,16);put(furniture,16,4,16);
for(const [x,y] of [[12,5],[19,5],[5,4],[26,4],[12,18],[19,18]])put(furniture,x,y,13);
put(furniture,5,6,10);put(furniture,6,6,10);put(furniture,25,6,11);put(furniture,25,18,9);
for(const x of [15,16])put(furniture,x,22,12);
// A side door in the west wall, out into the city.
put(furniture,1,11,12);put(furniture,1,12,12);
const layer=(name,data,id)=>({id,name,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
const points=[['spawn',88,124],['priest',248,124],['ledger',408,104],['basin',408,296],['door',256,350],['encounter',360,320],['exile',360,120],['from-road',256,326],['novice',376,280],['west-door',36,192],['from-square',56,192]];
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],tilesets:[{firstgid:1,name:'church',image:'../assets/church-tiles.svg',imagewidth:128,imageheight:32,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:16,tiles:[2,4,5,6,7,8,9,10,11,12,13,14,15].map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
writeFileSync('public/maps/church.json',JSON.stringify(map,null,2)+'\n');
