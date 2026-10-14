// Rebuild the placeholder city tileset and the capital's maps: the church square and the harbour below it.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
import { ellipse, rect as krect, rows, scatter, sheet, stairs, vary } from './tile-kit.mjs';
import { blocks, boulder, planks, shadow, water as seaWater } from './tile-art.mjs';
const rect = (x,y,w,h,c,o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o===undefined?'':` fill-opacity="${o}"`}/>`;
// The capital: old grey stone under a low sky, lit from the upper left; the harbour green-black below the quay.
const COURSES = [[0,0,7,5],[8,0,8,5],[0,6,5,5],[6,6,10,5],[0,12,9,4],[10,12,6,4]];
const cobbles = (a,b) => rect(0,0,16,16,'#36342e')+COURSES.map(([x,y,w,h])=>rect(x,y,w-1,h-1,a)+rect(x,y,w-1,1,b)+rect(x,y,1,h-1,b)+rect(x+w-2,y+1,1,h-2,'#403e38')).join('');
const wall = (a,b) => blocks(b, a, '#8a867a', '#5a564e');
const water = (a,b) => seaWater(a, b, '#6a8a94', '#16303a');
const flags = () => rect(0,0,16,16,'#46423c')+[[0,0,7,7],[8,0,8,7],[0,8,4,8],[5,8,11,8]].map(([x,y,w,h])=>rect(x,y,w-1,h-1,'#66625a')+rect(x,y,w-1,1,'#78746a')+rect(x,y,1,h-1,'#6e6a62')).join('');
const TILES = [
  cobbles('#4e4c46','#5c5a52'),                                                                            // 0 cobbles
  flags(), // 1 flagstones
  wall('#6a665c','#4e4a42'),                                                                               // 2 stone wall
  rect(0,0,16,16,'#2a201c')+[0,4,8,12].map((y,i)=>rect(0,y,16,3,'#3a2e2a')+rect(0,y,16,1,'#4e403a')+[3,7,11,15].map(x=>rect((x+(i%2)*2)%16,y,1,3,'#2a201c')).join('')).join(''), // 3 slate roof
  rect(0,0,16,16,'#2b2a22')+rect(1,0,14,16,'#5a4430')+[4,8,12].map(x=>rect(x,0,1,16,'#46352a')).join('')+rect(1,0,14,1,'#7a5e40')+rect(1,4,14,1,'#3a2c20')+rect(1,11,14,1,'#3a2c20')+[3,7,11].map(x=>rect(x,4,1,1,'#8a8a7a')+rect(x,11,1,1,'#8a8a7a')).join('')+rect(10,8,2,2,'#a89060')+rect(10,8,1,1,'#c8b080'), // 4 door
  wall('#6a665c','#4e4a42')+rect(3,2,10,10,'#4e4a42')+rect(4,3,8,8,'#2a3a40')+rect(4,3,8,3,'#3a5058')+rect(7,3,2,8,'#6a665c')+rect(4,6,8,1,'#6a665c')+rect(5,4,1,1,'#8aa8b0')+rect(2,12,12,1,'#8a867a')+rect(2,13,12,1,'#000000',0.25), // 5 window
  cobbles('#4e4c46','#5c5a52')+shadow(9,14,7,2)+ellipse(8,9,7,5.5,'#55554e')+ellipse(8,8.5,6.5,5,'#7a7a72')+ellipse(8,9,5,3.5,'#1e3a44')+ellipse(8,9,3.5,2.5,'#2e5460')+rect(7,2,2,6,'#8a8a80')+rect(7,2,1,6,'#a8a8a0')+rect(6,1,4,2,'#9a9a90')+rect(5,8,1,1,'#a8c8d0')+rect(10,10,1,1,'#a8c8d0'), // 6 fountain
  cobbles('#4e4c46','#5c5a52')+shadow(9,15,6,1)+rect(3,12,10,4,'#6a6a62')+rect(3,12,10,1,'#8a8a80')+rect(5,3,6,10,'#8a8a80')+rect(5,3,2,10,'#a4a49a')+rect(10,3,1,10,'#6a6a62')+rect(6,0,4,4,'#9a9a90')+rect(6,1,4,2,'#5a5a52')+rect(6,1,1,1,'#7a7a72'), // 7 statue
  rect(0,0,16,16,'#4e4c46')+rect(0,2,16,6,'#6a3a30')+[0,4,8,12].map(x=>rect(x,2,2,6,'#c8b878')+rect(x,8,2,1,'#c8b878')).join('')+rect(0,2,16,1,'#000000',0.15)+rect(1,9,2,7,'#4a3828')+rect(1,9,1,7,'#6a5036')+rect(13,9,2,7,'#4a3828')+rect(13,9,1,7,'#6a5036'), // 8 market awning
  cobbles('#4e4c46','#5c5a52')+ellipse(8,3,5,5,'#e8c870',0.13)+shadow(9,15,3,1)+rect(7,4,2,12,'#2a2a2a')+rect(7,4,1,12,'#4a4a48')+rect(5,1,6,4,'#3a3a36')+rect(6,2,4,2,'#e8c870')+rect(7,2,2,1,'#fff0b2')+rect(5,0,6,1,'#2a2a2a'), // 9 lamp post
  rect(0,0,16,16,'#5a564e')+[0,4,8,12].map((y,i)=>rect(0,y,16,4,['#6e6a62','#625e56','#56524a','#4a463e'][i])).join(''), // 10 steps
  rect(0,0,16,16,'#4e4c46')+rect(0,7,16,2,'#2a2a2e')+rect(0,7,16,1,'#4a4a4e')+[1,5,9,13].map(x=>rect(x,0,2,16,'#2a2a2e')+rect(x,0,1,16,'#4a4a4e')).join('')+rect(6,6,4,4,'#c8a858')+rect(6,6,4,1,'#e2c878')+rect(7,7,2,2,'#7a3a2a'), // 11 sealed gate
  water('#1e3a44','#2e5460'), // 12 harbour water
  flags()+rect(0,11,16,1,'#8a867a')+rect(0,12,16,4,'#3a3630')+rect(0,12,16,1,'#2a2622')+rect(3,14,3,1,'#2e5460',0.6), // 13 quay edge
  rect(0,0,16,16,'#1e3a44')+planks(0,2,16,12,'#5a4630','#76603e','#2e2418')+rect(0,2,16,1,'#8a7048')+rect(0,13,16,1,'#2e2418')+rect(0,14,16,2,'#000000',0.35), // 14 pier planks
  flags()+shadow(9,14,4,1.2)+rect(5,6,6,8,'#2a2a2a')+rect(5,6,2,8,'#4a4a48')+ellipse(8,5.5,4,1.5,'#3a3a3a')+ellipse(7.5,5,2.5,0.8,'#5a5a58'), // 15 bollard
  flags()+shadow(9,15,7,1)+rect(2,3,12,11,'#7a6040')+rect(2,3,12,1,'#9a7a50')+rect(2,3,1,11,'#9a7a50')+rect(13,4,1,10,'#5a4430')+rect(2,8,12,1,'#5a4430')+rect(7,3,1,11,'#5a4430'), // 16 crates
  flags()+rect(1,2,14,12,'#5a5a4a')+[3,7,11].map(x=>rect(x,2,1,12,'#3a3a2e')).join('')+[5,9].map(y=>rect(1,y,14,1,'#3a3a2e')).join('')+rect(1,2,14,1,'#7a7a68')+rect(4,6,2,2,'#c8b878')+rect(12,11,1,1,'#a8b0b0'), // 17 nets
  water('#1e3a44','#2e5460')+ellipse(8,8.5,7.5,4.5,'#2e2418')+ellipse(8,8,6.5,3.5,'#5a4630')+ellipse(8,8,5,2.5,'#2e2418')+rect(4,8,8,1,'#6a5236')+rect(7,0,2,6,'#8a7a5a')+rect(7,0,1,6,'#a8987a'), // 18 moored boat
  water('#1e3a44','#2e5460')+[[2,11,2,4],[3,8,2,3],[5,5,2,3],[7,3,3,2],[10,4,2,2],[12,6,2,3],[13,9,1,3]].map(([x,y,w,h])=>rect(x,y,w,h,'#c8c0a8')+rect(x,y,1,h,'#e0d8c0')).join('')+rect(1,15,4,1,'#000000',0.3), // 19 a kraken rib out of the water
  flags()+shadow(9,15,6,1)+rect(3,1,10,14,'#8a8b7d')+rect(3,1,10,1,'#a8a998')+rect(3,1,1,13,'#a8a998')+rect(12,2,1,12,'#6a6b5e')+rect(5,6,6,2,'#2e5460')+rect(5,6,6,1,'#4a7480')+rect(6,10,4,1,'#6a6b5e')+rect(2,14,12,2,'#6d6e63'), // 20 sea shrine
  flags()+rect(1,3,14,12,'#3a4a4a')+rect(2,4,12,10,'#1e3a44')+ellipse(8,9,4,3,'#2e5460')+rect(1,3,14,1,'#8aa0a8')+rect(3,5,2,1,'#6a8a94')+rect(14,4,1,11,'#2a3636'), // 21 market tank
  rect(0,0,16,16,'#3a3a36')+rect(0,0,16,3,'#4a4a46')+rect(0,0,16,1,'#5e5e58')+rect(0,3,16,1,'#000000',0.3), // 22 wall top
  flags()+shadow(8,14,7,1)+rect(2,4,12,10,'#5a4630')+rect(3,5,10,2,'#7a5e40')+rect(3,5,10,1,'#94784e')+rect(4,9,8,1,'#3a2e20')+rect(2,12,2,2,'#3a2e20')+rect(12,12,2,2,'#3a2e20'), // 23 bench
];
// The city's steps, down to the harbour: steps that read as steps.
TILES[10] = stairs({ tread: '#6e6a62', riser: '#3a3630', lip: '#8a867a', side: '#4e4a42', sideDark: '#36322c' });
// Variants of the cobbles and the flagstones: a stone gone, moss in the joints, a dropped scale from the fish market.
const COBBLE_VARIANTS = [TILES.length + 1, TILES.length + 2], FLAG_VARIANTS = [TILES.length + 3];
TILES.push(
  TILES[0] + krect(8,7,6,4,'#3a3832') + krect(2,1,3,1,'#4e5a3a'),
  TILES[0] + krect(1,6,4,1,'#4e5a3a') + krect(11,12,4,1,'#4e5a3a') + krect(6,3,1,1,'#a8b0b0'),
  TILES[1] + krect(10,2,1,3,'#57534b') + krect(11,4,1,1,'#57534b') + krect(3,11,2,1,'#5a6450'),
);
// The lanes and the cistern: a drain grate, washing strung over the cobbles, a pump, a broken stair down.
const LANE_TILES = TILES.length + 1;
TILES.push(
  cobbles('#4e4c46','#5c5a52')+krect(2,2,12,12,'#1e1e1c')+[3,6,9,12].map(x=>krect(x,2,1,12,'#5a5850')).join('')+krect(2,7,12,1,'#5a5850'), // drain grate
  cobbles('#4e4c46','#5c5a52')+krect(0,3,16,1,'#2a2a28')+krect(2,4,4,6,'#8a8070')+krect(8,4,3,5,'#6a5a6a')+krect(12,4,3,7,'#9a9488'),        // washing on a line
  cobbles('#4e4c46','#5c5a52')+krect(5,3,6,12,'#3a3a36')+krect(6,1,4,3,'#4a4a44')+krect(11,6,3,2,'#3a3a36')+krect(5,13,6,2,'#2a3a40'),     // pump
  krect(0,0,16,16,'#26241f')+krect(0,0,16,2,'#34312a')+krect(3,6,4,1,'#1c1a16')+krect(10,11,4,1,'#1c1a16')+krect(5,12,1,4,'#2e3a3a'),      // vault wall, wet
);
const svg = sheet(TILES);
writeFileSync('public/assets/city-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows(TILES)*16}" shape-rendering="crispEdges">${svg}</svg>\n`);
// TILES_ONLY=1 redraws the tiles and leaves the maps alone: they have been edited by hand since this script made them.
if (process.env.TILES_ONLY) process.exit(0);
const T = Object.fromEntries(['COBBLE','FLAG','WALL','ROOF','DOOR','WINDOW','FOUNTAIN','STATUE','AWNING','LAMP','STEPS','GATE','SEA','QUAY','PIER','BOLLARD','CRATES','NETS','BOAT','BONE','SHRINE','TANK','TOP','BENCH'].map((n,i)=>[n,i+1]));
const [GRATE,WASHING,PUMP,VAULT]=[0,1,2,3].map(i=>LANE_TILES+i);
const SOLID = [2,3,4,5,6,7,8,9,11,12,15,16,17,18,19,20,21,22,23,GRATE-1,PUMP-1,VAULT-1];

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
    tilesets:[{firstgid:1,name:'city',image:'../assets/city-tiles.svg',imagewidth:128,imageheight:rows(TILES)*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows(TILES)*8,
      tiles:SOLID.map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
  vary(floor,w,1,COBBLE_VARIANTS,name.length*7,0.3);vary(floor,w,2,FLAG_VARIANTS,name.length*11,0.2);
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
  fill(furniture,8,1,30,4,T.ROOF);fill(furniture,8,5,30,7,T.WALL);fill(floor,17,8,20,9,T.STEPS);put(furniture,18,7,T.DOOR);put(furniture,19,7,T.DOOR);
  for(const x of [10,13,24,27]) put(furniture,x,6,T.WINDOW);
  // The alchemists' wing on the west side, behind a gate sealed with the church's mark.
  fill(furniture,1,6,6,8,T.ROOF);fill(furniture,1,9,6,24,T.WALL);fill(furniture,6,14,6,16,T.GATE);put(furniture,6,11,T.WINDOW);put(furniture,6,20,T.WINDOW);
  // The square itself: flagstones, the fountain under the statue of the five, a few stalls, lamps, benches.
  fill(floor,10,11,32,24,T.FLAG);
  fill(furniture,19,15,22,18,T.FOUNTAIN);put(furniture,20,16,T.STATUE);put(furniture,21,16,T.STATUE);
  fill(furniture,12,21,14,21,T.AWNING);fill(furniture,28,12,30,12,T.AWNING);
  for(const [x,y] of [[10,11],[32,11],[10,24],[32,24],[21,9],[16,9]]) put(furniture,x,y,T.LAMP);
  for(const [x,y] of [[16,13],[25,19]]) put(furniture,x,y,T.BENCH);
  // Townhouses along the south side, with the road down to the harbour between them.
  fill(furniture,1,27,17,28,T.ROOF);fill(furniture,1,29,17,30,T.WALL);fill(furniture,24,27,42,28,T.ROOF);fill(furniture,24,29,42,30,T.WALL);
  for(const x of [4,9,14,27,32,38]) put(furniture,x,30,T.WINDOW);
  fill(furniture,19,31,22,31,0);fill(floor,19,25,22,31,T.STEPS);
  write('square',m,[
    ['east',568,256],['from-church',548,256],['south',328,504],['from-harbour',328,472],['hall-door',304,136],['from-hall',304,168],
    ['statue',...at(20,19)],['fountain',...at(22,19)],['alchemists-gate',...at(7,15)],
    ['crier',...at(17,17)],['broadsheets',...at(26,22)],['lamplighter',...at(11,12)],['guard-square',...at(33,15)],['apothecary',...at(29,13)],['citizen',...at(13,22)],['waystone',...at(30,22)],['from-waystone',...at(30,23)],
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
  // The tidal road west, up the estuary to Wickmere.
  fill(furniture,0,12,0,13,0);
  // The last shrine, where the fish come ashore, at the east end of the quay.
  put(furniture,44,19,T.SHRINE);
  // East, under the warehouses, into the lanes.
  fill(furniture,47,7,47,8,0);
  for(const [x,y] of [[22,8],[34,12],[10,16]]) put(furniture,x,y,T.LAMP);
  write('harbour',m,[
    ['north',344,8],['from-square',344,40],['west',8,208],['from-marsh',28,208],
    ['harbour-wall',...at(5,20)],['kraken-arm',176,316],['sea-shrine',...at(44,20)],['crab',328,232],
    ['fishwife',...at(17,15)],['harbourmaster',...at(31,18)],['steward',...at(37,9)],['dockhand',...at(27,19)],['harbour-spot',...at(31,29)],['east',760,128],['from-lanes',728,128],
  ]);
}

// The lanes behind the harbour: tenements leaning over alleys, the church's soup line, and a yard with a grate in it.
{
  const m=grid(40,30,T.COBBLE);const {floor,furniture,put,fill}=m;
  fill(furniture,0,0,39,0,T.TOP);fill(furniture,0,29,39,29,T.TOP);fill(furniture,0,0,0,29,T.TOP);fill(furniture,39,0,39,29,T.TOP);
  fill(furniture,0,14,0,15,0);
  // Tenements: roofs, then a storey of wall with windows and doors on the lane side.
  const block=(x0,y0,x1,y1,doors)=>{fill(furniture,x0,y0,x1,y1-2,T.ROOF);fill(furniture,x0,y1-1,x1,y1,T.WALL);for(let x=x0+1;x<x1;x+=3) put(furniture,x,y1,T.WINDOW);for(const x of doors) put(furniture,x,y1,T.DOOR);};
  block(1,1,10,5,[5]);block(14,1,25,5,[18]);block(29,1,38,5,[33]);
  block(3,8,10,11,[6]);block(15,8,24,11,[20]);block(30,8,36,11,[33]);
  block(1,18,12,22,[4,9]);block(16,18,24,22,[19]);block(28,18,38,22,[31,36]);
  // The yard behind the south tenements: washing over the cobbles, a pump, and the grate down to the cistern.
  fill(floor,2,24,37,24,WASHING);fill(floor,6,27,30,27,WASHING);
  put(furniture,10,25,PUMP);put(furniture,20,26,GRATE);
  for(const [x,y] of [[2,26],[3,26],[36,25],[37,25],[37,26]]) put(furniture,x,y,T.CRATES);
  // Lamps on the lane, few and far apart.
  for(const [x,y] of [[12,13],[27,16],[2,12]]) put(furniture,x,y,T.LAMP);
  put(furniture,13,12,T.BENCH);
  write('lanes',m,[
    ['west',8,240],['from-harbour',40,240],
    ['soup-sister',...at(20,12)],['queue-1',...at(22,13)],['queue-2',...at(24,13)],['rat-mother',...at(9,23)],['ratling-1',...at(26,25)],['stoat',...at(27,4)],
    ['notice',...at(11,13)],['soup',...at(19,12)],['grate',...at(20,25)],['from-cistern',...at(21,25)],['pump',...at(10,26)],['washing',...at(15,25)],
  ]);
}

// The cistern under the lanes: the city's water in the dark, behind the church's valve.
{
  const m=grid(32,24,T.FLAG);const {floor,furniture,put,fill}=m;
  fill(furniture,0,0,31,23,VAULT);
  // A broken stair down from the grate, and the walkways between the tanks.
  fill(furniture,15,19,16,23,0);fill(floor,15,19,16,23,T.STEPS);
  fill(furniture,3,2,28,18,0);
  fill(furniture,3,7,28,10,T.SEA);fill(furniture,15,7,16,10,0);
  fill(furniture,3,13,12,16,T.SEA);fill(furniture,19,13,28,16,T.SEA);
  fill(floor,3,11,28,12,T.QUAY);fill(floor,3,6,28,6,T.QUAY);
  // Pillars holding up the lanes.
  for(const [x,y] of [[6,3],[12,3],[19,3],[25,3],[8,17],[23,17]]) put(furniture,x,y,VAULT);
  // The church's valve on the north wall, with its chain and its lock.
  put(furniture,15,2,T.TANK);put(furniture,16,2,T.TANK);
  put(floor,26,4,T.BONE);
  write('cistern',m,[
    ['up',256,376],['spawn',256,328],
    ['valve',...at(16,3)],['drowned',...at(9,4)],['ratling',...at(26,3)],['leech-1',...at(14,17)],['wisp-1',...at(24,12)],['tithe',...at(4,12)],['bones',...at(26,5)],
  ]);
}
