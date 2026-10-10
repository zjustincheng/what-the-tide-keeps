// Rebuild the placeholder island tileset and its maps: the landing under the lighthouse, the works, the white house,
// the lighthouse tower, and the lamp room at the top.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
import { rect, rows, scatter, sheet, stairs, tileProps, vary } from './tile-kit.mjs';

const stone = (a, b) => rect(0,0,16,16,a)+rect(0,5,16,1,b)+rect(0,11,16,1,b)+rect(5,0,1,5,b)+rect(11,6,1,5,b)+rect(3,12,1,4,b);
const tiles = [
  rect(0,0,16,16,'#4a4a44')+rect(2,3,5,3,'#56564e')+rect(9,8,6,4,'#525248')+rect(4,12,3,2,'#3e3e38')+rect(11,2,2,1,'#62625a'),       // 0 wet rock
  rect(0,0,16,16,'#8a8270')+rect(2,4,2,1,'#a49a84')+rect(9,10,3,1,'#6e6656')+rect(6,13,1,1,'#b4aa94')+rect(12,3,1,1,'#6e6656'),       // 1 shingle
  rect(0,0,16,16,'#16303a')+rect(2,4,5,1,'#24485a')+rect(9,10,5,1,'#24485a')+rect(5,13,3,1,'#1e3c48'),                                 // 2 sea
  rect(0,0,16,16,'#2a2a26')+rect(1,1,7,6,'#363630')+rect(8,8,7,7,'#32322c')+rect(0,7,16,1,'#1a1a18')+rect(1,1,7,1,'#44443c'),            // 3 cliff
  rect(0,0,16,16,'#16303a')+rect(0,2,16,12,'#5a4632')+[1,5,9,13].map(x=>rect(x,2,1,12,'#3e3022')).join('')+rect(0,2,16,1,'#7a6448'), // 4 jetty
  stone('#d8d4c8','#b4b0a4')+rect(0,0,16,1,'#ecE8dc'),                                                                                 // 5 whitewashed wall
  rect(0,0,16,16,'#c8c4b8')+rect(0,0,8,8,'#d4d0c4')+rect(8,8,8,8,'#d4d0c4')+rect(0,15,16,1,'#a8a498')+rect(15,0,1,16,'#a8a498'),       // 6 white tiles
  rect(0,0,16,16,'#2b2a22')+rect(1,0,14,16,'#4a4e56')+rect(3,0,1,16,'#62666e')+rect(12,0,1,16,'#62666e')+rect(10,8,2,2,'#c8a848'),     // 7 iron door
  rect(0,0,16,16,'#c8c4b8')+[1,5,9,13].map(x=>rect(x,0,2,16,'#3a3c40')).join('')+rect(0,7,16,2,'#3a3c40')+rect(0,0,16,1,'#5a5c62'),    // 8 cage bars
  rect(0,0,16,16,'#c8c4b8')+rect(1,2,14,13,'#5a5650')+rect(2,3,12,10,'#e8e4dc')+rect(3,5,10,6,'#d8d0c0')+rect(5,7,4,1,'#c8bea8'),      // 9 salt vat
  rect(0,0,16,16,'#c8c4b8')+rect(3,2,10,13,'#6a5032')+rect(3,5,10,1,'#3a2c20')+rect(3,11,10,1,'#3a2c20')+rect(5,7,6,3,'#d8d0b8'),      // 10 stamped barrel
  rect(0,0,16,16,'#c8c4b8')+rect(0,1,16,2,'#3a3c40')+[3,8,13].map(x=>rect(x,3,1,4,'#8a8a8a')+rect(x-1,7,3,2,'#6a6a6a')).join(''),   // 11 hook rail
  stone('#8a867a','#5a564e')+rect(0,0,16,1,'#a8a498'),                                                                                 // 12 tower stone
  stairs({ tread: '#8a867a', riser: '#3a3630', lip: '#a8a498' }),                                                                     // 13 stairs
  rect(0,0,16,16,'#3a3830')+rect(2,2,12,12,'#e8d8a0')+rect(4,4,8,8,'#fff4c8')+rect(6,6,4,4,'#ffffff')+rect(2,2,12,1,'#c8a848'),       // 14 the lens
  rect(0,0,16,16,'#1e2a30')+rect(1,1,14,14,'#3a5868')+rect(2,2,5,12,'#5a7a8a')+rect(0,7,16,1,'#2a2c30')+rect(7,0,1,16,'#2a2c30'),      // 15 lamp glass
  rect(0,0,16,16,'#4a4a44')+rect(2,1,12,14,'#3a3c40')+rect(3,2,10,2,'#5a5c62')+rect(4,6,8,6,'#2a2c30')+rect(6,8,4,2,'#c8a848'),       // 16 oil tank
  rect(0,0,16,16,'#d8d4cc')+rect(2,3,3,1,'#f0ece4')+rect(9,9,4,1,'#f0ece4')+rect(6,12,2,1,'#b8b4ac')+rect(12,4,1,1,'#b8b4ac'),         // 17 salt floor
  rect(0,0,16,16,'#c8c4b8')+rect(1,1,14,14,'#6a6a62')+rect(2,2,12,3,'#8a8a82')+rect(2,6,12,3,'#8a8a82')+rect(2,10,12,3,'#8a8a82')+rect(7,3,2,1,'#c8a848')+rect(7,7,2,1,'#c8a848')+rect(7,11,2,1,'#c8a848'), // 18 file cabinet
  rect(0,0,16,16,'#c8c4b8')+rect(0,3,16,9,'#8a8e94')+rect(0,3,16,1,'#b4b8be')+rect(2,12,2,4,'#5a5e64')+rect(12,12,2,4,'#5a5e64'),      // 19 steel table
  rect(0,0,16,16,'#4a4a44')+rect(2,8,1,5,'#6a7a4a')+rect(4,6,1,7,'#7a8a52')+rect(7,9,1,4,'#6a7a4a')+rect(11,5,1,8,'#7a8a52')+rect(13,9,1,4,'#6a7a4a'), // 20 sea grass
  rect(0,0,16,16,'#8a8270')+rect(2,3,12,11,'#7a6040')+rect(2,3,12,1,'#9a7a50')+rect(7,3,1,11,'#5a4430')+rect(3,7,10,2,'#2a2018'),      // 21 crates for the light
  rect(0,0,16,16,'#c8c4b8')+rect(4,4,8,8,'#3a3c40')+[5,8,11].map(x=>rect(x,4,1,8,'#6a6c72')).join('')+rect(6,10,4,2,'#5a2a26'),       // 22 floor drain
  rect(0,0,16,16,'#3a3830')+rect(0,0,16,2,'#4a4840')+rect(2,6,12,1,'#2a2824')+rect(4,10,8,1,'#2a2824'),                                 // 23 tower floor
];
// Variants of the rock and the white tiles: weed and pools on the rock; a stain, a chipped tile.
const ROCK_VARIANTS = [tiles.length + 1, tiles.length + 2], TILE_VARIANTS = [tiles.length + 3];
tiles.push(
  scatter(tiles[0], 61, [['#3a4a3a',2,1],['#24485a',3,2],['#62625a',1,1]], 6),
  scatter(tiles[0], 62, [['#5a6a3a',1,2],['#3e3e38',2,2],['#8a8a80',1,1]], 6),
  tiles[6] + rect(4,5,5,4,'#a89880') + rect(5,6,3,2,'#8a7a62'),
);
// Climbable: the tower's inner wall.
const WALLFACE = tiles.length + 1;
tiles.push(stone('#7a766a','#4a463e')+[[2,2],[10,4],[5,7],[12,10],[3,12],[8,14]].map(([x,y])=>rect(x,y,3,2,'#2a2824')+rect(x,y,3,1,'#a8a498')).join(''));
writeFileSync('public/assets/island-tiles.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows(tiles)*16}" shape-rendering="crispEdges">${sheet(tiles)}</svg>\n`);
const [ROCK,SHINGLE,SEA,CLIFF,JETTY,WHITE,TILES,DOOR,BARS,VAT,BARREL,HOOKS,TOWER,STAIR,LENS,GLASS,TANK,SALT,FILES,TABLE,GRASS,CRATES,DRAIN,TFLOOR]=tiles.map((_,i)=>i+1);
// Collides lists 0-based tile ids.
const solid=[2,3,5,7,8,9,10,11,12,14,15,16,18,19,21,WALLFACE-1];

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
  vary(floor,W,ROCK,ROCK_VARIANTS,name.length*7,0.3);vary(floor,W,TILES,TILE_VARIANTS,name.length*5,0.12);
  const layer=(lname,data,id)=>({id,name:lname,type:'tilelayer',width:W,height:H,x:0,y:0,opacity:1,visible:true,data});
  const map={compressionlevel:-1,width:W,height:H,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
    layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([pname,x,y],i)=>({id:i+1,name:pname,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
    tilesets:[{firstgid:1,name:'island',image:'../assets/island-tiles.svg',imagewidth:128,imageheight:rows(tiles)*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows(tiles)*8,
      tiles:tileProps(solid)}]};
  writeFileSync(`public/maps/${name}.json`,JSON.stringify(map,null,2)+'\n');
}

// The landing: a church jetty on a rock past the charts, the lighthouse above it, the works to the west and the white house to the east.
{
  const m=grid(44,34,ROCK);const {floor,furniture,put,fill,frame,walk}=m;
  fill(furniture,0,0,43,33,SEA);
  // The rock itself, and the jetty out into the sea at the south.
  walk(3,4,40,27,ROCK);walk(6,2,37,4,ROCK);fill(floor,8,22,35,27,SHINGLE);
  walk(20,28,23,33,JETTY);fill(furniture,20,33,23,33,0);
  for(const [x,y] of [[19,29],[24,31],[19,32]]) put(furniture,x,y,CRATES);
  for(const [x,y] of [[10,26],[11,26],[30,25],[31,25],[32,25]]) put(furniture,x,y,CRATES);
  // The road up the middle, to the lighthouse.
  fill(floor,20,8,23,27,SHINGLE);
  // The lighthouse: a round tower at the top of the rock, its door on the south side.
  fill(furniture,16,1,27,7,TOWER);fill(furniture,16,1,17,2,SEA);fill(furniture,26,1,27,2,SEA);
  put(furniture,21,7,DOOR);put(furniture,22,7,DOOR);
  // The works, long and low, to the west.
  fill(furniture,4,9,15,16,WHITE);put(furniture,9,16,DOOR);put(furniture,10,16,DOOR);
  for(const x of [5,7,13]) put(furniture,x,16,HOOKS);
  // The white house, to the east, whitewashed, its door on the west.
  fill(furniture,29,10,39,18,WHITE);put(furniture,29,14,DOOR);put(furniture,29,15,DOOR);
  // Rocks and weed and the edge of the cliff.
  for(const [x,y] of [[3,4],[4,5],[40,6],[39,4],[3,20],[40,22],[5,27],[38,27]]) put(furniture,x,y,CLIFF);
  for(const [x,y] of [[7,19],[14,24],[26,20],[34,21],[18,12],[25,13]]) put(floor,x,y,GRASS);
  write('landing',m,[
    ['out',352,536],['from-sea',...at(21,30)],
    ['tower-door',352,136],['from-tower',...at(21,8)],['works-door',160,280],['from-works',...at(9,17)],['house-door',456,240],['from-house',...at(28,14)],
    ['marine-1',...at(14,20)],['marine-2',...at(28,21)],['marine-3',...at(21,11)],['crates',...at(10,25)],['notice',...at(24,9)],
  ]);
}

// The works: the long white room where the church's caught are brought. Salt vats, hooks, and barrels stamped as fish.
{
  const m=grid(36,22,TILES);const {floor,furniture,put,fill,frame}=m;
  frame(WHITE);fill(furniture,0,0,35,1,WHITE);
  fill(furniture,17,21,18,21,0);
  // Cages along the north wall, full.
  for(const x of [2,7,12,22,27,32]) { fill(furniture,x,2,x+2,4,BARS); }
  // The vats down the middle, the hook rail over the floor, the drains under it.
  for(const x of [5,10,25,30]) fill(furniture,x,8,x+1,9,VAT);
  fill(furniture,4,13,15,13,HOOKS);fill(furniture,20,13,31,13,HOOKS);
  for(const x of [6,9,12,23,26,29]) put(floor,x,15,DRAIN);
  fill(floor,4,8,31,10,SALT);for(const x of [5,10,25,30]) fill(furniture,x,8,x+1,9,VAT);
  // Barrels stacked by the door, stamped and ready.
  for(const [x,y] of [[2,17],[3,17],[2,18],[3,18],[2,19],[32,17],[33,17],[33,18],[32,19],[33,19]]) put(furniture,x,y,BARREL);
  put(furniture,17,6,TABLE);put(furniture,18,6,TABLE);
  write('works',m,[
    ['out',288,344],['spawn',...at(17,19)],
    ['foreman',...at(17,11)],['ledger',...at(17,7)],['cages',...at(13,5)],['caged-1',...at(8,3)],['caged-2',...at(23,3)],['caged-3',...at(28,3)],
    ['vats',...at(11,10)],['barrels',...at(4,18)],['hooks',...at(26,14)],
  ]);
}

// The white house: the old laboratory. The long white room, the cages, the files. You were a guard here.
{
  const m=grid(32,20,TILES);const {floor,furniture,put,fill,frame}=m;
  frame(WHITE);
  fill(furniture,0,9,0,10,0);
  // The long white room: cages along the south wall, steel tables down the middle.
  for(const x of [4,8,12,16,20,24]) fill(furniture,x,15,x+2,17,BARS);
  fill(furniture,6,15,6,15,0);
  for(const x of [7,8,13,14,19,20]) put(furniture,x,9,TABLE);
  // The files along the north wall.
  for(let x=3;x<=28;x+=3) put(furniture,x,1,FILES);
  put(floor,11,12,DRAIN);put(floor,22,12,DRAIN);
  write('whitehouse',m,[
    ['out',8,160],['spawn',...at(2,9)],
    ['file',...at(18,2)],['records',...at(9,2)],['basin-records',...at(27,2)],['cage',...at(6,14)],['tables',...at(14,10)],['ghoul-1',...at(25,12)],
  ]);
}

// The lighthouse: up the inside of the tower. The stair has gone; the wall is climbed, landing to landing, to the lamp.
{
  const m=grid(30,40,TFLOOR);const {floor,furniture,put,fill}=m;
  fill(furniture,0,0,29,39,TOWER);
  const landing=(x0,y0,x1,y1)=>{fill(furniture,x0,y0,x1,y1,0);fill(floor,x0,y0,x1,y1,TFLOOR);};
  // The foot of the tower, with the oil tanks and the crates the boats bring.
  landing(8,31,21,38);fill(furniture,14,39,15,39,0);fill(floor,14,39,15,39,TFLOOR);
  for(const [x,y] of [[8,31],[9,31],[20,31],[21,31]]) put(furniture,x,y,TANK);
  put(furniture,8,37,CRATES);put(furniture,21,37,CRATES);
  // The wall to climb, then the first landing; the wall again, then the stair to the lamp.
  fill(furniture,11,21,18,30,WALLFACE);landing(9,17,20,20);
  fill(furniture,11,7,18,16,WALLFACE);landing(10,3,19,6);fill(floor,14,2,15,2,STAIR);fill(furniture,14,2,15,2,0);
  for(const [x,y] of [[9,18],[20,19]]) put(furniture,x,y,TANK);
  write('lighthouse',m,[
    ['out',240,632],['spawn',...at(14,36)],['tanks',...at(10,32)],['crates-in',...at(19,36)],
    ['climb-1',...at(14,31)],['top-1',...at(14,20)],['climb-2',...at(15,17)],['top-2',...at(15,6)],['landing-view',...at(19,18)],
    ['up',240,40],['from-lamp',...at(14,4)],
  ]);
}

// The lamp room at the top of the tower: the lens, the glass all round, and the sea dark in every direction.
{
  const m=grid(24,20,TFLOOR);const {floor,furniture,put,fill,frame}=m;
  frame(GLASS);fill(furniture,0,0,23,1,TOWER);
  fill(furniture,11,19,12,19,0);fill(floor,11,18,12,19,STAIR);
  fill(furniture,10,6,13,9,LENS);
  for(const [x,y] of [[3,3],[20,3],[3,16],[20,16]]) put(furniture,x,y,TANK);
  write('lamp',m,[
    ['down',192,312],['spawn',...at(12,16)],['keeper',...at(12,11)],['stranger',...at(16,7)],['lens',...at(12,10)],['sea-view',...at(3,9)],
  ]);
}
