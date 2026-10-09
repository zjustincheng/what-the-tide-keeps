// Rebuild the placeholder city tileset and the capital's maps: the church square and the harbour below it.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const cobbles = (a,b) => rect(0,0,16,16,a)+[[0,0,7,5],[8,0,8,5],[0,6,5,5],[6,6,10,5],[0,12,9,4],[10,12,6,4]].map(([x,y,w,h])=>rect(x+1,y+1,w-2,h-2,b)).join('');
const wall = (a,b) => rect(0,0,16,16,a)+rect(0,5,16,1,b)+rect(0,11,16,1,b)+rect(5,0,1,5,b)+rect(11,6,1,5,b)+rect(3,12,1,4,b);
const water = (a,b) => rect(0,0,16,16,a)+rect(2,4,5,1,b)+rect(9,10,5,1,b)+rect(5,13,3,1,b);
const TILES = [
  cobbles('#4e4c46','#5c5a52'),                                                                            // 0 cobbles
  rect(0,0,16,16,'#5e5a52')+rect(0,0,7,7,'#68645a')+rect(8,8,8,8,'#68645a')+rect(0,15,16,1,'#46423c'),     // 1 flagstones
  wall('#6a665c','#4e4a42'),                                                                               // 2 stone wall
  rect(0,0,16,16,'#3a2e2a')+[2,6,10,14].map(y=>rect(0,y,16,1,'#2a201c')).join('')+rect(0,0,16,1,'#5a4a40'), // 3 slate roof
  rect(0,0,16,16,'#2b2a22')+rect(1,0,14,16,'#5a4430')+rect(3,0,1,16,'#7a5e40')+rect(12,0,1,16,'#7a5e40')+rect(10,8,2,2,'#a89060'), // 4 door
  rect(0,0,16,16,'#6a665c')+rect(0,13,16,3,'#4e4a42')+rect(4,3,8,8,'#2a3a40')+rect(7,3,2,8,'#6a665c')+rect(4,6,8,1,'#6a665c'), // 5 window
  rect(0,0,16,16,'#4e4c46')+rect(1,1,14,14,'#6a6a62')+rect(3,3,10,10,'#2e4a50')+rect(5,5,6,6,'#3e6068')+rect(7,2,2,4,'#8a8a80'), // 6 fountain
  rect(0,0,16,16,'#4e4c46')+rect(3,12,10,4,'#6a6a62')+rect(5,2,6,11,'#8a8a80')+rect(6,1,4,3,'#9a9a90')+rect(6,4,2,2,'#5a5a52'), // 7 statue
  rect(0,0,16,16,'#4e4c46')+rect(0,2,16,6,'#6a3a30')+[0,4,8,12].map(x=>rect(x,2,2,6,'#c8b878')).join('')+rect(1,8,2,8,'#4a3828')+rect(13,8,2,8,'#4a3828'), // 8 market awning
  rect(0,0,16,16,'#4e4c46')+rect(7,4,2,12,'#2a2a2a')+rect(5,1,6,4,'#3a3a36')+rect(6,2,4,2,'#e8c870'),       // 9 lamp post
  rect(0,0,16,16,'#5a564e')+[0,4,8,12].map((y,i)=>rect(0,y,16,4,['#6e6a62','#625e56','#56524a','#4a463e'][i])).join(''), // 10 steps
  rect(0,0,16,16,'#4e4c46')+[1,5,9,13].map(x=>rect(x,0,2,16,'#2a2a2e')).join('')+rect(0,7,16,2,'#2a2a2e')+rect(6,6,4,4,'#c8a858'), // 11 sealed gate
  water('#1e3a44','#2e5460'),                                                                              // 12 harbour water
  rect(0,0,16,16,'#5e5a52')+rect(0,12,16,4,'#3a3630')+rect(0,11,16,1,'#7a766c'),                            // 13 quay edge
  rect(0,0,16,16,'#1e3a44')+rect(0,2,16,12,'#5a4630')+[1,5,9,13].map(x=>rect(x,2,1,12,'#3e3022')).join(''), // 14 pier planks
  rect(0,0,16,16,'#5e5a52')+rect(5,6,6,8,'#2a2a2a')+rect(4,5,8,2,'#3a3a3a'),                                 // 15 bollard
  rect(0,0,16,16,'#5e5a52')+rect(2,3,12,11,'#7a6040')+rect(2,3,12,1,'#9a7a50')+rect(7,3,1,11,'#5a4430'),      // 16 crates
  rect(0,0,16,16,'#5e5a52')+rect(1,2,14,12,'#6a6a5a')+[3,7,11].map(x=>rect(x,2,1,12,'#4a4a3a')).join('')+[5,9].map(y=>rect(1,y,14,1,'#4a4a3a')).join(''), // 17 nets
  rect(0,0,16,16,'#1e3a44')+rect(1,4,14,9,'#4a3a28')+rect(2,5,12,6,'#6a5236')+rect(7,0,2,6,'#8a7a5a'),        // 18 moored boat
  water('#1e3a44','#2e5460')+rect(2,11,2,4,'#c8c0a8')+rect(3,8,2,3,'#d8d0b8')+rect(5,5,2,3,'#d8d0b8')+rect(7,3,3,2,'#e0d8c0')+rect(10,4,2,2,'#d8d0b8')+rect(12,6,2,3,'#c8c0a8')+rect(13,9,1,3,'#b8b098'), // 19 a kraken rib out of the water
  rect(0,0,16,16,'#5e5a52')+rect(3,1,10,14,'#8a8b7d')+rect(4,2,8,2,'#a8a998')+rect(5,6,6,2,'#2e5460')+rect(2,14,12,2,'#6d6e63'), // 20 sea shrine
  rect(0,0,16,16,'#5e5a52')+rect(1,3,14,12,'#4a5a5a')+rect(2,4,12,10,'#2e5460')+rect(1,3,14,1,'#8aa0a8'),      // 21 market tank
  rect(0,0,16,16,'#3a3a36')+rect(0,0,16,3,'#4a4a46'),                                                        // 22 wall top
  rect(0,0,16,16,'#5e5a52')+rect(2,4,12,10,'#5a4630')+rect(3,5,10,2,'#7a5e40')+rect(4,9,8,1,'#3a2e20'),        // 23 bench
];
const svg = TILES.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
writeFileSync('public/assets/city-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="48" shape-rendering="crispEdges">${svg}</svg>\n`);
const T = Object.fromEntries(['COBBLE','FLAG','WALL','ROOF','DOOR','WINDOW','FOUNTAIN','STATUE','AWNING','LAMP','STEPS','GATE','SEA','QUAY','PIER','BOLLARD','CRATES','NETS','BOAT','BONE','SHRINE','TANK','TOP','BENCH'].map((n,i)=>[n,i+1]));
const SOLID = [2,3,4,5,6,7,8,9,11,12,15,16,17,18,19,20,21,22,23];

function grid(w,h,base){
  const floor=Array(w*h).fill(base), furniture=Array(w*h).fill(0);
  const put=(a,x,y,t)=>{ if(x>=0&&y>=0&&x<w&&y<h) a[y*w+x]=t; };
  const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
  return {w,h,floor,furniture,put,fill};
}
function write(name,{w,h,floor,furniture},points){
  const layer=(n,data,id)=>({id,name:n,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
  const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
    layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([n,x,y],i)=>({id:i+1,name:n,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
    tilesets:[{firstgid:1,name:'city',image:'../assets/city-tiles.svg',imagewidth:128,imageheight:48,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:24,
      tiles:SOLID.map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
  writeFileSync(`public/maps/${name}.json`,JSON.stringify(map,null,2)+'\n');
}
const at=(x,y)=>[x*16+8,y*16+8];

// The church square: the church to the east, the feast hall to the north, the alchemists' wing to the west, and the road down to the harbour.
{
  const m=grid(44,32,T.COBBLE);const {floor,furniture,put,fill}=m;
  fill(furniture,0,0,43,0,T.TOP);fill(furniture,0,31,43,31,T.TOP);fill(furniture,0,0,0,31,T.TOP);fill(furniture,43,0,43,31,T.TOP);
  // The church's flank on the east side, with its side door.
  fill(furniture,36,4,42,6,T.ROOF);fill(furniture,36,7,42,26,T.WALL);put(furniture,36,10,T.WINDOW);put(furniture,36,20,T.WINDOW);put(furniture,36,15,T.DOOR);put(furniture,36,16,T.DOOR);
  // The hall of the Long Table, across the north side, its great doors shut.
  fill(furniture,8,1,30,4,T.ROOF);fill(furniture,8,5,30,7,T.WALL);fill(floor,16,8,22,9,T.STEPS);put(furniture,18,7,T.DOOR);put(furniture,19,7,T.DOOR);
  for(const x of [10,13,24,27]) put(furniture,x,6,T.WINDOW);
  // The alchemists' wing on the west side, behind a gate sealed with the church's mark.
  fill(furniture,1,6,6,8,T.ROOF);fill(furniture,1,9,6,24,T.WALL);fill(furniture,6,14,6,16,T.GATE);put(furniture,6,11,T.WINDOW);put(furniture,6,20,T.WINDOW);
  // The square itself: flagstones, the fountain under the statue of the five, a few stalls, lamps, benches.
  fill(floor,10,11,32,24,T.FLAG);
  fill(furniture,19,15,22,18,T.FOUNTAIN);put(furniture,20,16,T.STATUE);put(furniture,21,16,T.STATUE);
  fill(furniture,12,21,14,21,T.AWNING);fill(furniture,28,12,30,12,T.AWNING);
  for(const [x,y] of [[10,11],[32,11],[10,24],[32,24],[24,9],[14,9]]) put(furniture,x,y,T.LAMP);
  for(const [x,y] of [[16,13],[25,19]]) put(furniture,x,y,T.BENCH);
  // Townhouses along the south side, with the road down to the harbour between them.
  fill(furniture,1,27,17,28,T.ROOF);fill(furniture,1,29,17,30,T.WALL);fill(furniture,24,27,42,28,T.ROOF);fill(furniture,24,29,42,30,T.WALL);
  for(const x of [4,9,14,27,32,38]) put(furniture,x,30,T.WINDOW);
  fill(furniture,19,31,22,31,0);fill(floor,19,25,22,31,T.STEPS);
  write('square',m,[
    ['east',568,256],['from-church',548,256],['south',328,504],['from-harbour',328,472],['hall-door',312,152],['from-hall',312,168],
    ['statue',...at(20,19)],['fountain',...at(22,19)],['alchemists-gate',...at(7,15)],
    ['crier',...at(17,17)],['broadsheets',...at(26,22)],['lamplighter',...at(11,12)],['guard-square',...at(33,15)],['apothecary',...at(29,13)],['citizen',...at(13,22)],
  ]);
}

// The harbour: the quay, the fish market, the pier, the last shrine, and what is left of the kraken.
{
  const m=grid(48,32,T.FLAG);const {floor,furniture,put,fill}=m;
  fill(furniture,0,0,47,0,T.TOP);fill(furniture,0,0,0,31,T.TOP);fill(furniture,47,0,47,31,T.TOP);
  // Up the steps to the square in the north.
  fill(furniture,20,0,23,0,0);fill(floor,20,0,23,3,T.STEPS);
  // Warehouses along the north side.
  fill(furniture,1,1,18,3,T.ROOF);fill(furniture,1,4,18,5,T.WALL);fill(furniture,25,1,46,3,T.ROOF);fill(furniture,25,4,46,5,T.WALL);
  for(const x of [4,10,15,29,36,42]) put(furniture,x,5,T.WINDOW);put(furniture,8,5,T.DOOR);put(furniture,39,5,T.DOOR);
  // The sea fills the south; the quay runs along it.
  fill(furniture,0,22,47,31,T.SEA);fill(floor,1,21,46,21,T.QUAY);
  // The pier runs out into the harbour, with boats moored along it.
  fill(furniture,30,22,32,29,0);fill(floor,30,22,32,29,T.PIER);for(const y of [23,26,29]) put(furniture,33,y,T.BOAT);put(furniture,29,24,T.BOAT);
  // The kraken's bones in the water off the west quay, too big to move.
  for(const [x,y] of [[4,24],[6,25],[8,24],[10,26],[12,25],[14,27],[7,28],[11,29]]) put(furniture,x,y,T.BONE);
  // The fish market under awnings, and the tank where the caught are kept.
  fill(furniture,12,10,22,10,T.AWNING);fill(furniture,12,14,15,14,T.AWNING);put(furniture,19,14,T.TANK);put(furniture,20,14,T.TANK);
  for(const [x,y] of [[24,12],[25,12],[26,16],[3,9],[4,9],[44,10],[44,11]]) put(furniture,x,y,T.CRATES);
  for(const [x,y] of [[6,18],[7,18],[40,16],[41,16]]) put(furniture,x,y,T.NETS);
  for(const x of [3,9,15,25,36,43]) put(furniture,x,20,T.BOLLARD);
  // The last shrine, where the fish come ashore, at the east end of the quay.
  put(furniture,44,19,T.SHRINE);
  for(const [x,y] of [[22,8],[34,12],[10,16]]) put(furniture,x,y,T.LAMP);
  write('harbour',m,[
    ['north',344,8],['from-square',344,40],
    ['harbour-wall',...at(5,20)],['kraken-arm',176,316],['sea-shrine',...at(44,20)],['crab',328,232],
    ['fishwife',...at(17,15)],['harbourmaster',...at(31,18)],['steward',...at(37,9)],['dockhand',...at(27,19)],['harbour-spot',...at(31,29)],
  ]);
}
