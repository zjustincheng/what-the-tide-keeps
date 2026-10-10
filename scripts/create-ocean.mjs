// Rebuild the placeholder sea tileset and the ocean: Wrecktown, the outlaw port lashed together from wrecks;
// the open water beyond it; the land's fishing pens; the kraken's grave; and the cuttlefish's reef.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
import { rect, rows, scatter, sheet, vary } from './tile-kit.mjs';
const SEA = '#16303a';
const tiles = [
  rect(0,0,16,16,'#1e3c48')+rect(2,4,6,1,'#2c5260')+rect(9,10,5,1,'#2c5260')+rect(5,13,3,1,'#284a56'),          // 0 swell, walkable on the currents
  rect(0,0,16,16,'#3a6a6e')+rect(2,3,5,1,'#4e8084')+rect(9,9,4,1,'#4e8084')+rect(4,12,6,1,'#5a8c8a'),             // 1 shallows
  rect(0,0,16,16,'#b8a880')+rect(3,4,2,1,'#a8986e')+rect(10,10,3,1,'#c8b890')+rect(6,13,1,1,'#8a7a5a'),          // 2 sand
  rect(0,0,16,16,'#5a4632')+[0,4,8,12].map(y=>rect(0,y,16,1,'#40321f')).join('')+rect(6,1,1,2,'#6a5640')+rect(12,9,1,2,'#6a5640'), // 3 wreck deck
  rect(0,0,16,16,'#3a2c20')+rect(0,0,16,3,'#4a3828')+[3,9,14].map(x=>rect(x,3,1,13,'#2a2018')).join('')+rect(5,8,2,2,'#1a1410'), // 4 hull
  rect(0,0,16,16,SEA)+rect(7,0,2,16,'#4a3a28')+rect(0,7,16,1,'#8a7a5a')+rect(3,3,10,1,'#8a7a5a')+rect(5,11,6,1,'#8a7a5a'), // 5 rigging
  rect(0,0,16,16,'#5a4632')+rect(6,0,4,16,'#4a3828')+rect(7,0,1,16,'#6a5640')+rect(3,4,10,2,'#3a2c20'),         // 6 mast
  rect(0,0,16,16,SEA)+rect(2,3,6,6,'#8a5a5a')+rect(8,7,6,6,'#a87060')+rect(3,10,4,4,'#c88a70')+rect(10,2,3,3,'#6a4a5a'), // 7 coral reef
  rect(0,0,16,16,SEA)+[2,6,10,13].map((x,i)=>rect(x,1+i%3,2,14-i%3,'#2e5a3a')).join('')+[3,11].map(x=>rect(x,4,1,6,'#4a7a4a')).join(''), // 8 kelp
  rect(0,0,16,16,SEA)+rect(1,3,14,11,'#4a5054')+rect(2,3,9,4,'#5e6468')+rect(2,3,9,1,'#70767a')+rect(10,9,4,4,'#3e4448'), // 9 sea rock
  rect(0,0,16,16,'#5a4632')+rect(7,4,2,12,'#3a2c20')+rect(5,1,6,4,'#2a2420')+rect(6,2,4,2,'#e0a850'),            // 10 lantern
  rect(0,0,16,16,'#5a4632')+rect(1,3,14,11,'#6a5636')+rect(1,8,14,1,'#4a3c26')+rect(7,3,1,11,'#4a3c26')+rect(3,5,3,2,'#8a3a30'), // 11 crates
  rect(0,0,16,16,'#a89a80')+[3,8,13].map(y=>rect(0,y,16,1,'#8a7c64')).join('')+rect(0,15,16,1,'#5a4e3e'),         // 12 sailcloth roof
  rect(0,0,16,16,SEA)+[2,6,10,14].map(x=>rect(x,0,1,16,'#6a6a5a')).join('')+[2,6,10,14].map(y=>rect(0,y,16,1,'#6a6a5a')).join(''), // 13 net
  rect(0,0,16,16,SEA)+[1,5,9,13].map(x=>rect(x,0,2,16,'#5a4a34')).join('')+rect(0,7,16,2,'#7a7a6a')+rect(4,10,2,2,'#a8b0a8'), // 14 pen netting
  rect(0,0,16,16,'#b8a880')+rect(2,1,4,15,'#d8d0b8')+rect(3,1,2,15,'#e8e0c8')+rect(10,3,4,13,'#c8c0a8')+rect(11,3,2,13,'#d8d0b8'), // 15 kraken rib
  rect(0,0,16,16,'#b8a880')+rect(3,6,7,2,'#d8d0b8')+rect(9,10,4,2,'#c8c0a8')+rect(4,12,2,1,'#8a7a5a'),          // 16 small bones
  rect(0,0,16,16,'#1e3c48')+[3,8,13].map(y=>rect(2,y,9,1,'#3a6a78')+rect(11,y-1,2,3,'#3a6a78')).join(''),       // 17 current
  rect(0,0,16,16,'#5a4632')+rect(3,2,10,12,'#2a2018')+rect(4,3,8,10,'#3a2c20')+rect(4,7,8,1,'#5a4632'),          // 18 hatch
  rect(0,0,16,16,'#5a4632')+rect(0,2,16,6,'#2a5a6a')+[0,4,8,12].map(x=>rect(x,2,2,6,'#d8c8a0')).join('')+rect(1,8,2,8,'#3a2c20')+rect(13,8,2,8,'#3a2c20'), // 19 awning
  rect(0,0,16,16,'#5a4632')+rect(3,2,10,13,'#6a5032')+rect(3,5,10,1,'#3a2c20')+rect(3,11,10,1,'#3a2c20')+rect(5,2,6,1,'#8a6a42'), // 20 barrel
  rect(0,0,16,16,'#0c1c24')+rect(3,5,4,1,'#142a34')+rect(10,11,3,1,'#142a34'),                                 // 21 deep water
  rect(0,0,16,16,'#b8a880')+rect(4,2,8,13,'#8a8a80')+rect(5,1,6,3,'#a8a898')+rect(6,6,4,1,'#2a5460')+rect(3,13,10,2,'#6a6a62'), // 22 the sea's shrine
  rect(0,0,16,16,'#2a3a40')+rect(3,4,2,1,'#3a4e56')+rect(10,10,3,1,'#1e2a30')+rect(6,12,2,1,'#5a3a4a'),         // 23 reef floor
];
const [SWELL,SHALLOWS,SAND,DECK,HULL,RIGGING,MAST,REEF,KELP,ROCK,LANTERN,CRATES,SAIL,NET,PEN,RIB,BONES,CURRENT,HATCH,AWNING,BARREL,DEEP,SHRINE,REEFFLOOR]=tiles.map((_,i)=>i+1);
// Swell and sand vary: whitecaps and weed; shells and drift.
const SWELL_VARIANTS = [tiles.length + 1, tiles.length + 2], SAND_VARIANTS = [tiles.length + 3];
tiles.push(
  scatter(tiles[0], 31, [['#2c5260',3,1],['#3a6070',2,1],['#c8d8d8',1,1]], 6),
  scatter(tiles[0], 32, [['#24485a',4,1],['#2e5a3a',1,2],['#2c5260',2,1]], 5),
  scatter(tiles[2], 33, [['#d8d0c0',1,1],['#e8c8b8',2,1],['#8a7a5a',1,1],['#5a6a4a',2,1]], 7),
);
writeFileSync('public/assets/sea-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows(tiles)*16}" shape-rendering="crispEdges">${sheet(tiles)}</svg>\n`);
// Collides lists 0-based tile ids.
const solid=[4,5,6,7,8,9,10,11,12,13,14,15,19,20,21,22];

function grid(W,H,ground){
  const floor=Array(W*H).fill(ground), furniture=Array(W*H).fill(0);
  const put=(a,x,y,t)=>{if(x>=0&&y>=0&&x<W&&y<H)a[y*W+x]=t;};
  const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
  const frame=t=>{fill(furniture,0,0,W-1,0,t);fill(furniture,0,H-1,W-1,H-1,t);fill(furniture,0,0,0,H-1,t);fill(furniture,W-1,0,W-1,H-1,t);};
  const walk=(x0,y0,x1,y1,t)=>{fill(furniture,x0,y0,x1,y1,0);fill(floor,x0,y0,x1,y1,t);};
  return {W,H,floor,furniture,put,fill,frame,walk};
}
const at=(x,y)=>[x*16+8,y*16+8];
function write(name,{W,H,floor,furniture},points){
  vary(floor,W,SWELL,SWELL_VARIANTS,name.length*7,0.3);vary(floor,W,SAND,SAND_VARIANTS,name.length*5,0.3);
  const layer=(lname,data,id)=>({id,name:lname,type:'tilelayer',width:W,height:H,x:0,y:0,opacity:1,visible:true,data});
  const map={compressionlevel:-1,width:W,height:H,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
    layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([pname,x,y],i)=>({id:i+1,name:pname,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
    tilesets:[{firstgid:1,name:'sea',image:'../assets/sea-tiles.svg',imagewidth:128,imageheight:rows(tiles)*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows(tiles)*8,
      tiles:solid.map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
  writeFileSync(`public/maps/${name}.json`,JSON.stringify(map,null,2)+'\n');
}

// Wrecktown: hulks run aground and lashed together, plank walks between them, a market under sailcloth.
{
  const m=grid(40,30,SWELL);const {floor,furniture,put,fill,frame,walk}=m;
  fill(furniture,1,1,38,28,DEEP);frame(DEEP);
  // The ferry tie-up in the south-west, and the walk in.
  walk(2,24,8,27,DECK);fill(furniture,0,25,1,26,0);fill(floor,0,25,1,26,DECK);put(furniture,4,27,LANTERN);
  // The hulks: each a deck with its hull showing at the waterline and a mast or two.
  const hulk=(x0,y0,x1,y1)=>{walk(x0,y0,x1,y1,DECK);fill(furniture,x0,y1+1,x1,y1+1,HULL);};
  hulk(6,14,16,21);hulk(19,15,30,22);hulk(5,3,15,10);hulk(19,3,33,11);hulk(33,15,37,24);
  // Plank walks between them, and up from the ferry landing (laid after the hulls, so no hull cuts them).
  walk(8,21,10,25,DECK);
  walk(16,17,19,18,DECK);walk(10,11,11,14,DECK);walk(15,6,19,7,DECK);walk(25,12,26,15,DECK);walk(30,18,33,19,DECK);
  // The market under sailcloth, the tavern hold, the chandler's.
  fill(furniture,21,4,26,5,SAIL);put(furniture,21,6,AWNING);put(furniture,26,6,AWNING);
  fill(furniture,7,4,11,6,SAIL);fill(furniture,7,7,11,7,HULL);put(furniture,9,7,0);put(floor,9,7,HATCH);
  for(const [x,y] of [[8,16],[14,20],[22,16],[28,21],[31,4],[6,9],[35,16]]) put(furniture,x,y,MAST);
  for(const [x,y] of [[13,15],[13,16],[24,20],[29,8],[30,8],[34,22],[36,22]]) put(furniture,x,y,CRATES);
  for(const [x,y] of [[7,20],[20,21],[18,10],[32,10]]) put(furniture,x,y,BARREL);
  for(const [x,y] of [[11,18],[27,17],[12,4],[29,4],[35,20]]) put(furniture,x,y,LANTERN);
  // Out to the open water, east, past the last hulk.
  walk(38,19,39,20,DECK);
  write('outlaw-port',m,[
    ['ferry',8,408],['from-creek',...at(3,25)],['currents',632,312],['from-sea',...at(36,19)],
    ['portmaster',...at(9,19)],['stranger',...at(28,19)],['shark',...at(24,18)],['chandler',...at(23,7)],['books',...at(25,7)],
    ['tavern',...at(9,8)],['fisher',...at(13,9)],['pirate',...at(31,6)],['child',...at(35,23)],['camp-port',...at(4,25)],['shrine',...at(17,19)],
  ]);
}

// The open water: the currents run between reefs and wrecks; under the swell, things wait.
{
  const m=grid(48,40,SWELL);const {floor,furniture,put,fill,frame,walk}=m;
  frame(DEEP);
  fill(furniture,0,19,0,20,0);
  // Currents running the long way round.
  for(let x=4;x<44;x++) put(floor,x,20,CURRENT);for(let y=5;y<36;y++) put(floor,24,y,CURRENT);
  // Reefs, rocks, and kelp, breaking the water up.
  const reef=(x0,y0,x1,y1)=>fill(furniture,x0,y0,x1,y1,REEF);
  reef(6,6,10,9);reef(30,5,35,8);reef(8,28,13,31);reef(33,27,38,32);reef(16,13,18,15);reef(29,14,31,16);
  for(const [x,y] of [[14,4],[40,12],[5,15],[19,33],[42,24],[28,36],[3,33],[44,6]]) fill(furniture,x,y,x+1,y+1,ROCK);
  for(const [x,y] of [[12,22],[13,23],[36,18],[37,17],[20,8],[27,29],[28,28],[6,24]]) put(furniture,x,y,KELP);
  // A wreck in the north-east, where the eel waits; sandbars at the edges.
  walk(38,3,45,9,DECK);fill(furniture,38,10,45,10,HULL);put(furniture,41,5,MAST);
  fill(floor,2,36,8,38,SAND);fill(floor,40,34,46,38,SAND);
  // South, past the charts, a current the octopus knows: to the island.
  fill(furniture,23,39,24,39,0);for(let y=36;y<40;y++){put(floor,23,y,CURRENT);put(floor,24,y,CURRENT);}
  // East, a current running out to where the church's boats went down.
  fill(furniture,47,14,47,15,0);for(let x=44;x<48;x++){put(floor,x,14,CURRENT);put(floor,x,15,CURRENT);}
  write('open-water',m,[
    ['port',8,312],['from-port',...at(2,19)],['pens',...at(4,37)],['from-pens',...at(5,36)],['grave',...at(44,37)],['from-grave',...at(43,36)],
    ['reef',...at(24,1)],['from-reef',...at(24,3)],
    ['barracuda-1',...at(15,19)],['barracuda-2',...at(33,22)],['jelly-1',...at(20,27)],['jelly-2',...at(27,11)],['eel',...at(42,6)],['wreck',...at(39,7)],['fleet',760,240],['from-fleet',728,240],['island',384,632],['from-island',384,600],
  ]);
}

// The pens: the land's fishing fleet keeps its catch alive in nets moored offshore, until the boats take it in to be salted.
{
  const m=grid(30,24,SWELL);const {floor,furniture,put,fill,frame,walk}=m;
  frame(DEEP);
  walk(2,1,6,4,SAND);fill(furniture,4,0,5,0,0);fill(floor,4,0,5,0,SAND);
  // Walkways between the pens.
  walk(3,4,4,20,DECK);walk(3,11,26,12,DECK);walk(14,4,15,20,DECK);walk(25,4,26,20,DECK);walk(3,20,26,21,DECK);
  // The pens: nets full of what the fleet caught, fish and not.
  for(const [x0,y0] of [[6,5],[17,5],[6,14],[17,14]]) {fill(furniture,x0,y0,x0+6,y0+4,PEN);}
  for(const [x,y] of [[10,12],[22,12],[14,21],[3,16]]) put(furniture,x,y,LANTERN);
  for(const [x,y] of [[24,21],[26,19],[2,19]]) put(furniture,x,y,BARREL);
  write('sea-pens',m,[
    ['out',72,8],['from-sea',...at(4,2)],['elder',...at(5,2)],['nets',...at(9,12)],['barrels',...at(24,20)],['ledger',...at(15,8)],['caught',...at(20,13)],
  ]);
}

// The kraken's grave: its bones on a sandbar at low tide, too big to move, and a shrine the sea built over it.
{
  const m=grid(32,24,SWELL);const {floor,furniture,put,fill,frame,walk}=m;
  frame(DEEP);
  walk(3,4,28,19,SAND);fill(furniture,0,11,2,12,0);fill(floor,0,11,2,12,SAND);
  // Ribs, in two long rows, arching over the sand.
  for(const x of [8,11,14,17,20,23]) {fill(furniture,x,6,x,9,RIB);fill(furniture,x,14,x,17,RIB);}
  for(const [x,y] of [[6,12],[26,10],[15,12],[10,18],[22,5]]) put(floor,x,y,BONES);
  put(furniture,27,11,SHRINE);
  for(const [x,y] of [[4,5],[27,18],[5,17]]) put(furniture,x,y,KELP);
  write('kraken-grave',m,[
    ['out',8,184],['from-sea',...at(3,11)],['skull',...at(26,12)],['ribs',...at(15,11)],['nets',...at(7,16)],['tooth',...at(24,7)],
  ]);
}

// The cuttlefish's reef: a ring of coral in deep water, lit from below.
{
  const m=grid(26,20,REEFFLOOR);const {floor,furniture,put,fill,frame}=m;
  frame(DEEP);fill(furniture,1,1,24,2,REEF);fill(furniture,1,1,2,18,REEF);fill(furniture,23,1,24,18,REEF);
  fill(furniture,12,19,13,19,0);fill(floor,12,18,13,19,CURRENT);
  for(const [x,y] of [[6,6],[18,6],[6,13],[18,13],[12,4]]) put(furniture,x,y,KELP);
  for(const [x,y] of [[9,9],[16,10]]) put(furniture,x,y,ROCK);
  write('reef',m,[
    ['out',200,312],['from-sea',...at(12,16)],['cuttlefish',...at(12,7)],['den',...at(12,7)],['shells',...at(5,16)],
  ]);
}

// The drowned fleet: church boats sunk together in the shallows east of the currents, still loaded.
{
  const m=grid(40,28,SWELL);const {floor,furniture,put,fill,frame,walk}=m;
  frame(DEEP);
  fill(furniture,0,13,0,14,0);
  const hull=(x0,y0,x1,y1)=>{walk(x0,y0,x1,y1,DECK);fill(furniture,x0-1,y0-1,x1+1,y0-1,HULL);fill(furniture,x0-1,y1+1,x1+1,y1+1,HULL);fill(furniture,x0-1,y0-1,x0-1,y1+1,HULL);fill(furniture,x1+1,y0-1,x1+1,y1+1,HULL);};
  // A cutter on its side, the flagship broken open on the west, and a lugger sunk to the rail.
  hull(6,3,14,7);fill(furniture,9,8,10,8,0);put(furniture,12,4,MAST);
  hull(20,8,34,18);fill(furniture,19,12,19,13,0);put(furniture,27,10,MAST);put(furniture,27,16,MAST);put(furniture,31,16,HATCH);
  for(const [x,y] of [[21,9],[22,9],[33,9],[33,10],[21,18],[33,17]]) put(furniture,x,y,CRATES);
  hull(6,19,13,23);fill(furniture,9,18,10,18,0);put(furniture,12,21,BARREL);
  // Weed and rock between them, and the sand the wrecks are settling into.
  for(const [x,y] of [[16,4],[17,5],[4,12],[17,22],[36,4],[37,22],[25,24],[15,15]]) put(furniture,x,y,KELP);
  for(const [x,y] of [[30,2],[2,24],[36,12]]) fill(furniture,x,y,x+1,y+1,ROCK);
  fill(floor,22,22,32,26,SAND);put(floor,26,24,BONES);put(floor,29,23,BONES);
  write('fleet',m,[
    ['out',8,224],['from-sea',...at(2,13)],
    ['hermit',...at(10,5)],['manifest',...at(24,11)],['hold',...at(31,17)],['bell',...at(22,16)],['bones',...at(27,24)],
    ['barracuda-1',...at(16,13)],['barracuda-2',...at(30,21)],['jelly-1',...at(10,21)],
  ]);
}
