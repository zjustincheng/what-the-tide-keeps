// Rebuild the placeholder highland and fort tilesets, and the highland maps: the pass, the fort town,
// the battlefield, the ruined abbey, and the ossuary under it.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const sheet = (name, tiles) => {
  const rows = Math.ceil(tiles.length / 8);
  const svg = tiles.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
  writeFileSync(`public/assets/${name}-tiles.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows*16}" shape-rendering="crispEdges">${svg}</svg>\n`);
  return rows;
};
const heather = (base) => rect(0,0,16,16,base)+rect(3,4,1,2,'#7a5a6a')+rect(11,10,2,1,'#6a6a48')+rect(7,13,1,2,'#5a4a52');
const stone = (a,b) => rect(0,0,16,16,a)+rect(0,5,16,1,b)+rect(0,11,16,1,b)+rect(5,0,1,5,b)+rect(11,6,1,5,b)+rect(3,12,1,4,b);
const pine = (ground) => rect(0,0,16,16,ground)+rect(6,1,4,3,'#2a3a30')+rect(4,4,8,4,'#24342a')+rect(2,8,12,5,'#1e2e24')+rect(7,13,2,3,'#3a2e22');

// The highland tileset: the pass, the battlefield, the abbey, and the ossuary.
const HIGHLAND = [
  heather('#55573e'),                                                                                     // 0 heather
  heather('#525540')+rect(4,6,3,2,'#7a7a6e')+rect(10,11,2,2,'#6e6e64'),                                   // 1 heather with stones
  rect(0,0,16,16,'#6a5a44')+rect(2,4,3,1,'#7e6c52')+rect(9,10,4,1,'#544634')+rect(6,13,1,1,'#7e6c52'),    // 2 road
  rect(0,0,16,16,'#4a4a46')+rect(1,1,7,6,'#5a5a54')+rect(8,8,7,7,'#56564e')+rect(0,7,16,1,'#36362f')+rect(7,0,1,16,'#3e3e38'), // 3 rock face
  rect(0,0,16,16,'#6a6a62')+rect(2,3,2,2,'#86867c')+rect(9,6,3,2,'#56564e')+rect(5,11,2,2,'#86867c')+rect(12,12,2,2,'#4e4e48'), // 4 scree
  pine('#55573e'),                                                                                        // 5 pine
  rect(0,0,16,16,'#c4cacb')+rect(0,0,16,3,'#ccd2d3')+rect(2,6,5,1,'#b4bcbe')+rect(9,11,4,1,'#b4bcbe')+rect(12,4,1,1,'#e4eaea')+rect(5,13,1,1,'#e4eaea'), // 6 deep snow
  rect(0,0,16,16,'#55573e')+rect(2,4,12,11,'#6a6a62')+rect(4,3,7,4,'#7e7e74')+rect(2,13,12,2,'#4a4a44'),   // 7 boulder
  rect(0,0,16,16,'#55573e')+rect(3,8,10,7,'#6e6e64')+rect(5,4,6,5,'#828276')+rect(7,1,3,4,'#6e6e64'),      // 8 cairn
  rect(0,0,16,16,'#55573e')+rect(7,6,2,10,'#5d4630')+rect(2,2,12,5,'#8c7049')+rect(3,3,10,1,'#b49863'),    // 9 signpost
  rect(0,0,16,16,'#55573e')+rect(7,4,2,12,'#3a3228')+rect(3,3,5,1,'#3a3228')+rect(9,6,5,1,'#3a3228')+rect(4,1,1,3,'#3a3228'), // 10 dead tree
  rect(0,0,16,16,'#55573e')+rect(1,5,14,10,'#5a4a36')+rect(2,4,12,3,'#6a5a42')+rect(7,0,2,6,'#8a7a5a')+rect(5,2,6,1,'#8a7a5a'), // 11 grave mound
  rect(0,0,16,16,'#55573e')+rect(3,5,7,2,'#c8c0a8')+rect(9,10,5,2,'#c8c0a8')+rect(4,11,3,1,'#7a7a6e')+rect(11,3,1,5,'#6a6a62'), // 12 bones and blades
  rect(0,0,16,16,'#2a2420')+rect(1,1,14,14,'#3a3028')+rect(3,4,5,2,'#c8c0a8')+rect(8,9,4,2,'#a8a088'),     // 13 grave pit
  rect(0,0,16,16,'#08090a')+rect(0,0,16,2,'#1a1a18'),                                                     // 14 chasm
  rect(0,0,16,16,'#08090a')+rect(0,2,16,12,'#5a4630')+[1,5,9,13].map(x=>rect(x,2,1,12,'#3e3022')).join(''), // 15 bridge
  stone('#6a665c','#4e4a42'),                                                                             // 16 abbey wall
  rect(0,0,16,16,'#5a564e')+rect(0,0,7,7,'#625e56')+rect(8,8,8,8,'#625e56')+rect(0,15,16,1,'#46423c'),     // 17 flagstones
  rect(0,0,16,16,'#5a564e')+rect(4,0,8,16,'#7a766c')+rect(5,0,2,16,'#8a867a')+rect(3,13,10,3,'#6a665c'),   // 18 broken pillar
  rect(0,0,16,16,'#3a342c')+[2,6,10].map(y=>rect(1,y,14,3,'#c8bea4')).join('')+[3,8,12].map(x=>rect(x,3,2,2,'#2a241e')).join(''), // 19 bone wall
  rect(0,0,16,16,'#4a443a')+rect(3,4,2,1,'#6a6252')+rect(10,10,3,1,'#6a6252')+rect(6,13,1,1,'#8a8270'),    // 20 ossuary floor
  rect(0,0,16,16,'#07090a'),                                                                               // 21 void
  rect(0,0,16,16,'#3a342c')+rect(1,2,14,12,'#2a241e')+rect(3,4,4,4,'#c8bea4')+rect(9,4,4,4,'#c8bea4')+rect(4,5,1,1,'#2a241e')+rect(10,5,1,1,'#2a241e'), // 22 skull niche
  rect(0,0,16,16,'#5a564e')+[0,4,8,12].map((y,i)=>rect(0,y,16,4,['#4a463e','#3e3a34','#322e2a','#26231f'][i])).join(''), // 23 stair down
  rect(0,0,16,16,'#55573e')+rect(7,0,2,16,'#5d4630')+rect(2,1,10,8,'#6a3a30')+rect(3,2,8,6,'#7a4a3a'),     // 24 torn banner
  rect(0,0,16,16,'#4a3e2c')+rect(0,0,16,2,'#3a3022')+rect(0,14,16,2,'#3a3022')+rect(4,6,4,1,'#5a4c36'),    // 25 trench
  rect(0,0,16,16,'#3a5058')+rect(2,4,5,1,'#5a7078')+rect(9,10,5,1,'#5a7078'),                              // 26 icy stream
  rect(0,0,16,16,'#55573e')+rect(1,6,14,9,'#7a7058')+rect(3,3,10,4,'#8a8068')+rect(6,1,4,3,'#9a9078')+rect(7,9,2,6,'#3a2e22'), // 27 tent
  rect(0,0,16,16,'#9aaab0')+rect(2,4,6,1,'#b8c6ca')+rect(9,10,5,1,'#b8c6ca')+rect(4,12,3,1,'#7a8a90'),     // 28 ice
  rect(0,0,16,16,'#9aaab0')+rect(3,3,10,10,'#2a3a40')+rect(4,4,8,8,'#1a2a30')+rect(3,3,10,1,'#c8d6da'),    // 29 hole in the ice
  rect(0,0,16,16,'#4a3a2c')+[1,5,9,13].map(y=>rect(0,y,16,3,'#5d4630')).join('')+rect(0,0,16,1,'#c8ccc8'), // 30 log hut
  rect(0,0,16,16,'#9aaab0')+rect(3,5,10,6,'#7a8288')+rect(4,6,4,3,'#a89878')+rect(10,7,2,2,'#6a5a48')+rect(2,4,1,1,'#b8c6ca'), // 31 a body under the ice
  heather('#55573e')+rect(0,0,16,6,'#c4cacb')+rect(0,6,11,2,'#c4cacb')+rect(0,8,7,2,'#c4cacb')+rect(0,10,4,2,'#c4cacb')+rect(0,12,2,2,'#c4cacb')+rect(12,6,2,1,'#bcc2c3')+rect(8,9,2,1,'#bcc2c3')+rect(5,11,1,1,'#bcc2c3')+rect(3,2,1,2,'#7a5a6a')+rect(10,3,1,2,'#6a6a48'), // 32 drift edge
];
sheet('highland', HIGHLAND);
const H = Object.fromEntries(['HEATHER','STONES','ROAD','ROCK','SCREE','PINE','SNOW','BOULDER','CAIRN','SIGN','DEAD','MOUND','BONES','PIT','CHASM','BRIDGE','AWALL','FLAG','PILLAR','BONEWALL','OFLOOR','VOID','NICHE','STAIR','BANNER','TRENCH','STREAM','TENT','ICE','HOLE','HUT','FROZEN','DUST'].map((n,i)=>[n,i+1]));
const HIGHLAND_SOLID = [3,5,7,8,9,10,11,13,14,16,18,19,21,22,24,26,27,29,30];

// The fort town: a carnivore garrison behind stone walls.
const FORT = [
  rect(0,0,16,16,'#6a6258')+rect(2,4,3,1,'#7e766a')+rect(9,10,4,1,'#544e46')+rect(6,13,2,1,'#d8dcd8'),     // 0 street
  rect(0,0,16,16,'#5e5a52')+rect(0,0,7,7,'#68645a')+rect(8,8,8,8,'#68645a')+rect(0,15,16,1,'#46423c'),     // 1 flagstones
  stone('#4e4c48','#36342f'),                                                                              // 2 fort wall
  rect(0,0,16,16,'#36342f')+[0,6,12].map(x=>rect(x,0,4,5,'#4e4c48')).join('')+rect(0,5,16,11,'#3e3c38'),   // 3 battlement
  rect(0,0,16,16,'#6a6258')+rect(0,0,2,16,'#4e4c48')+rect(14,0,2,16,'#4e4c48'),                            // 4 gateway
  rect(0,0,16,16,'#4a3a2c')+[2,6,10,14].map(y=>rect(0,y,16,1,'#3a2c20')).join(''),                         // 5 timber roof
  stone('#7a7468','#5a564c'),                                                                              // 6 house wall
  rect(0,0,16,16,'#2b2a22')+rect(1,0,14,16,'#5a4430')+rect(3,0,1,16,'#7a5e40')+rect(12,0,1,16,'#7a5e40')+rect(10,8,2,2,'#a89060'), // 7 door
  rect(0,0,16,16,'#5a5248')+rect(0,13,16,3,'#3a342e')+rect(0,4,16,1,'#4a443c')+rect(0,9,16,1,'#4a443c'),   // 8 barracks wall
  rect(0,0,16,16,'#6a6258')+rect(0,4,16,8,'#6a5036')+rect(0,4,16,2,'#8a6a46')+rect(3,6,3,2,'#9ab0b8')+rect(9,6,4,2,'#9ab0b8'), // 9 ration table
  rect(0,0,16,16,'#6a6258')+rect(3,2,10,13,'#6a5236')+rect(3,4,10,1,'#3c3326')+rect(3,11,10,1,'#3c3326'),  // 10 barrel
  rect(0,0,16,16,'#6a6258')+rect(2,3,12,11,'#7a6040')+rect(2,3,12,1,'#9a7a50')+rect(2,8,12,1,'#5a4430')+rect(7,3,1,11,'#5a4430'), // 11 crate
  rect(0,0,16,16,'#6a6258')+rect(4,8,8,7,'#3a3632')+rect(5,4,6,5,'#d8743a')+rect(6,2,4,4,'#f0b34a'),       // 12 brazier
  rect(0,0,16,16,'#6a6258')+rect(7,0,2,16,'#3a2e22')+rect(2,1,10,9,'#5a2a26')+rect(4,3,6,5,'#8a3a30'),     // 13 banner
  stone('#a8a090','#888070'),                                                                              // 14 compound wall
  rect(0,0,16,16,'#6a6258')+[1,5,9,13].map(x=>rect(x,0,2,16,'#3a3632')).join('')+rect(0,7,16,2,'#3a3632'),  // 15 gate bars
  rect(0,0,16,16,'#6a6258')+rect(0,2,16,6,'#7a5a3a')+[0,4,8,12].map(x=>rect(x,2,2,6,'#a8a088')).join('')+rect(1,8,2,8,'#4a3828')+rect(13,8,2,8,'#4a3828'), // 16 awning
  rect(0,0,16,16,'#6a6258')+rect(2,3,12,11,'#4e4c48')+rect(4,5,8,7,'#1e2a2e')+rect(3,1,10,3,'#5a4630'),    // 17 well
  rect(0,0,16,16,'#6a6258')+rect(2,3,12,9,'#6a5036')+rect(3,4,10,7,'#c8c0a8')+rect(4,6,7,1,'#6a6258')+rect(4,8,5,1,'#6a6258')+rect(7,12,2,4,'#4a3828'), // 18 notice board
  rect(0,0,16,16,'#5a5c48')+rect(3,4,1,2,'#7a7a5a')+rect(11,10,1,2,'#c8ccc8'),                             // 19 frozen grass
  pine('#5a5c48'),                                                                                         // 20 pine
  rect(0,0,16,16,'#4a4034')+rect(2,4,4,1,'#5a4e40')+rect(9,11,5,1,'#3a3228'),                               // 21 alley mud
  rect(0,0,16,16,'#7a7468')+rect(0,13,16,3,'#5a564c')+rect(4,3,8,8,'#2a3a40')+rect(7,3,2,8,'#7a7468'),     // 22 window
  rect(0,0,16,16,'#4a4034')+rect(0,1,16,2,'#3a3632')+[3,8,13].map(x=>rect(x,3,1,4,'#8a8a8a')+rect(x-1,7,3,6,'#7a3a34')).join(''), // 23 meat hooks
];
sheet('fort', FORT);
const F = Object.fromEntries(['STREET','FLAG','WALL','TOP','GATE','ROOF','HOUSE','DOOR','BARRACKS','TABLE','BARREL','CRATE','BRAZIER','BANNER','COMPOUND','BARS','AWNING','WELL','BOARD','GRASS','PINE','ALLEY','WINDOW','HOOKS'].map((n,i)=>[n,i+1]));
const FORT_SOLID = [2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,20,22,23];

function grid(w,h,base){
  const floor=Array(w*h).fill(base), furniture=Array(w*h).fill(0);
  const put=(a,x,y,t)=>{ if(x>=0&&y>=0&&x<w&&y<h) a[y*w+x]=t; };
  const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
  return {w,h,floor,furniture,put,fill};
}
function write(name,tileset,rows,solid,{w,h,floor,furniture},points){
  const layer=(n,data,id)=>({id,name:n,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
  const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
    layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([n,x,y],i)=>({id:i+1,name:n,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
    tilesets:[{firstgid:1,name:tileset,image:`../assets/${tileset}-tiles.svg`,imagewidth:128,imageheight:rows*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows*8,
      tiles:solid.map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
  writeFileSync(`public/maps/${name}.json`,JSON.stringify(map,null,2)+'\n');
}
const at=(x,y)=>[x*16+8,y*16+8];
// Drifts rather than tiles: a smooth wave pattern picks where snow lies; deep snow in the middle of a drift, a dusting at its edges.
function snowfield(m, keep, threshold = 0.6, seed = 0) {
  const level = (x, y) => Math.sin(x * 0.31 + seed) + Math.sin(y * 0.37 + seed * 2) + Math.sin((x + y) * 0.19 + seed * 3) + 0.6 * Math.sin((x - y) * 0.53 + seed);
  const snowy = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && keep(x, y) && level(x, y) > threshold;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (!snowy(x, y)) continue;
    const deep = snowy(x - 1, y) && snowy(x + 1, y) && snowy(x, y - 1) && snowy(x, y + 1);
    // Tiled keeps flips in the top bits of a tile number: horizontal, vertical, and diagonal (a quarter turn).
    // The edge tile's drift lies along its top; turn it to face the deeper snow beside it, mirrored now and then for variety.
    const H_FLIP = 0x80000000, V_FLIP = 0x40000000, D_FLIP = 0x20000000;
    const vary = (x * 7 + y * 13) % 2 === 1;
    const turn = snowy(x, y - 1) ? (vary ? H_FLIP : 0)
      : snowy(x, y + 1) ? V_FLIP + (vary ? H_FLIP : 0)
      : snowy(x - 1, y) ? D_FLIP + (vary ? V_FLIP : 0)
      : snowy(x + 1, y) ? D_FLIP + H_FLIP + (vary ? V_FLIP : 0)
      : [0, H_FLIP, V_FLIP, D_FLIP][(x + y) % 4];
    m.put(m.floor, x, y, deep ? H.SNOW : (H.DUST + turn) >>> 0);
  }
}
const scatter=(m,count,tile,seedA,seedB,keep)=>{for(let i=0;i<count;i++){const x=(i*seedA+5)%m.w,y=(i*seedB+3)%m.h;if(keep(x,y)) m.put(m.floor,x,y,tile);}};
const HROWS=Math.ceil(HIGHLAND.length/8), FROWS=Math.ceil(FORT.length/8);

// The pass: the garrison road switchbacks up from the border road to the fort gate.
{
  const m=grid(40,64,H.HEATHER);const {floor,furniture,put,fill}=m;
  scatter(m,90,H.STONES,37,23,()=>true);
  fill(furniture,0,0,0,63,H.ROCK);fill(furniture,39,0,39,63,H.ROCK);fill(furniture,0,0,39,0,H.ROCK);fill(furniture,0,63,39,63,H.ROCK);
  fill(furniture,19,0,20,0,0);fill(furniture,19,63,20,63,0);
  // The road, one switchback at a time, from the bottom.
  fill(floor,19,52,20,63,H.ROAD);fill(floor,10,51,20,52,H.ROAD);fill(floor,10,39,11,52,H.ROAD);fill(floor,10,39,28,40,H.ROAD);fill(floor,27,26,28,40,H.ROAD);fill(floor,19,26,28,27,H.ROAD);fill(floor,19,0,20,27,H.ROAD);
  // Rock bands between the switchbacks, crossed only by the road.
  fill(furniture,1,45,38,46,H.ROCK);fill(furniture,10,45,11,46,0);
  fill(furniture,1,33,38,33,H.ROCK);fill(furniture,27,33,28,33,0);
  fill(furniture,1,21,38,21,H.ROCK);fill(furniture,19,21,20,21,0);
  // Snow lies higher up.
  snowfield(m,(x,y)=>y>=1&&y<21&&floor[y*40+x]!==H.ROAD,0.4,1.3);
  // A thinner dusting lower down.
  snowfield(m,(x,y)=>y>=22&&y<33&&floor[y*40+x]!==H.ROAD,1.6,4.1);
  for(const [x,y] of [[4,58],[30,56],[34,49],[3,48],[16,42],[33,36],[6,30],[14,24],[33,24],[5,16],[30,12],[35,4],[9,6],[24,9],[3,37],[36,60]]) put(furniture,x,y,H.PINE);
  for(const [x,y] of [[25,57],[6,54],[22,48],[31,43],[17,36],[5,26],[24,30],[30,17],[11,12],[27,4]]) put(furniture,x,y,H.BOULDER);
  fill(floor,6,42,9,44,H.SCREE);fill(floor,30,28,35,31,H.SCREE);
  // A spur west to the cliff edge, where a rope ladder drops to the tarn.
  fill(floor,1,39,10,40,H.ROAD);fill(furniture,0,39,0,40,0);
  put(furniture,22,61,H.SIGN);put(furniture,23,28,H.CAIRN);
  write('pass','highland',HROWS,HIGHLAND_SOLID,m,[
    ['south',...at(19,63).map((v,i)=>i===0?v+8:v)],['from-border',320,1000],['north',320,8],['from-fort',320,36],
    ['pass-sign',...at(22,62)],['cairn',...at(23,29)],
    ['raider-1',...at(20,56)],['raider-2',...at(10,44)],['raider-3',...at(28,30)],
    ['courier',...at(7,43)],['camp-pass',...at(33,38)],
    ['inquisitor',...at(22,10)],
    ['west',8,640],['from-tarn',28,640],['ladder-top',...at(3,38)],['forage-1',...at(30,24)],
  ]);
}

// The fort town: the south gate from the pass, the east gate down to the battlefield.
{
  const m=grid(48,36,F.STREET);const {floor,furniture,put,fill}=m;
  fill(furniture,0,0,47,1,F.TOP);fill(furniture,0,34,47,35,F.TOP);fill(furniture,0,0,1,35,F.TOP);fill(furniture,46,0,47,35,F.TOP);
  fill(furniture,23,34,24,35,0);fill(floor,23,34,24,35,F.GATE);
  fill(furniture,46,17,47,18,0);fill(floor,46,17,47,18,F.GATE);
  // The north gate, up to the old border fort.
  fill(furniture,23,0,24,1,0);fill(floor,23,0,24,1,F.GATE);
  fill(floor,16,12,32,22,F.FLAG);
  // The barracks, north-west.
  fill(furniture,3,3,14,5,F.ROOF);fill(furniture,3,6,14,8,F.BARRACKS);put(furniture,9,8,F.DOOR);put(furniture,5,7,F.WINDOW);put(furniture,12,7,F.WINDOW);
  // The ration hall, north-east, and the line in front of it.
  fill(furniture,30,3,43,5,F.ROOF);fill(furniture,30,6,43,8,F.HOUSE);put(furniture,36,8,F.DOOR);put(furniture,32,7,F.WINDOW);put(furniture,40,7,F.WINDOW);
  fill(furniture,32,10,38,10,F.TABLE);for(const [x,y] of [[39,10],[40,10],[31,10]]) put(furniture,x,y,F.BARREL);
  // The herbivore merchants, south-west, behind their own wall.
  fill(furniture,2,22,14,22,F.COMPOUND);fill(furniture,14,22,14,33,F.COMPOUND);fill(furniture,14,26,14,28,F.BARS);
  fill(floor,2,23,13,33,F.FLAG);fill(furniture,3,24,8,25,F.ROOF);fill(furniture,3,26,8,27,F.HOUSE);put(furniture,10,25,F.CRATE);put(furniture,11,30,F.CRATE);put(furniture,4,31,F.BARREL);
  // The alley, south-east, where the black market keeps its hooks.
  fill(floor,34,24,44,32,F.ALLEY);fill(furniture,34,23,45,23,F.HOUSE);fill(furniture,34,24,34,29,F.HOUSE);
  fill(furniture,38,24,43,24,F.HOOKS);put(furniture,44,28,F.CRATE);put(furniture,36,31,F.BARREL);
  // The square: a well, the notice board, the garrison fire, banners.
  put(furniture,24,15,F.WELL);put(furniture,19,12,F.BOARD);put(furniture,16,12,F.BANNER);put(furniture,32,12,F.BANNER);
  fill(furniture,16,25,30,27,F.ROOF);fill(furniture,16,28,30,29,F.HOUSE);put(furniture,20,29,F.WINDOW);put(furniture,27,29,F.WINDOW);
  for(const [x,y] of [[3,12],[3,16],[44,12],[44,22],[18,32],[29,32]]) put(furniture,x,y,F.PINE);
  for(let i=0;i<30;i++){const x=(i*17+3)%44+2,y=(i*11+5)%30+2; if(floor[y*48+x]===F.STREET && !furniture[y*48+x]) put(floor,x,y,F.GRASS);}
  write('fort','fort',FROWS,FORT_SOLID,m,[
    ['south',...at(23,35).map((v,i)=>i===0?v+8:v)],['from-pass',384,536],['east',760,288],['from-battlefield',736,288],
    ['barracks-door',...at(9,9)],['from-barracks',...at(9,10)],
    ['sergeant',...at(21,31)],['quartermaster',...at(35,9)],['lynx',...at(34,12)],['veteran',...at(37,12)],
    ['merchant',218,440],['fence',...at(40,27)],
    ['board',...at(19,13)],['waystone',...at(30,14)],['from-waystone',...at(30,15)],['north',384,8],['from-keep',384,40],['smith',...at(42,20)],['chaplain',...at(11,10)],['altar',...at(12,10)],['raven',...at(21,13)],['teacher',...at(21,20)],['cub-1',...at(20,22)],['cub-2',...at(22,22)],['hooks',...at(40,25)],['camp-fort',...at(28,18)],
  ]);
}

// The battlefield below the fort: graves, the vulture's dead tree, and the ravine with its raised bridge.
{
  const m=grid(56,40,H.HEATHER);const {floor,furniture,put,fill}=m;
  scatter(m,110,H.BONES,31,17,(x,y)=>x<43);
  fill(furniture,0,0,55,0,H.ROCK);fill(furniture,0,39,55,39,H.ROCK);fill(furniture,0,0,0,39,H.ROCK);fill(furniture,55,0,55,39,H.ROCK);
  fill(furniture,0,19,0,20,0);fill(floor,0,19,43,20,H.ROAD);
  // The drove road comes up from the downs to a gate in the south.
  fill(furniture,20,39,21,39,0);fill(floor,20,32,21,39,H.ROAD);
  // Old trenches across the field.
  fill(floor,6,8,30,9,H.TRENCH);fill(floor,10,30,38,31,H.TRENCH);fill(floor,22,24,23,34,H.TRENCH);
  // Grave mounds in rows, and the open pits.
  for(let x=6;x<=18;x+=3) for(const y of [13,15]) put(furniture,x,y,H.MOUND);
  for(let x=26;x<=38;x+=3) for(const y of [24,26]) put(furniture,x,y,H.MOUND);
  fill(furniture,30,13,33,15,H.PIT);fill(furniture,8,24,11,26,H.PIT);
  put(furniture,32,9,H.DEAD);put(furniture,20,5,H.TENT);put(furniture,21,5,H.TENT);put(furniture,14,34,H.BANNER);put(furniture,38,36,H.BANNER);
  for(const [x,y] of [[4,4],[40,4],[3,35],[41,34],[26,36]]) put(furniture,x,y,H.BOULDER);
  // The ravine, with the bridge raised on the far side.
  fill(furniture,44,1,47,38,H.CHASM);fill(furniture,44,19,47,20,0);fill(floor,44,19,47,20,H.BRIDGE);
  fill(floor,48,1,54,38,H.STONES);fill(floor,48,19,55,20,H.ROAD);fill(furniture,55,19,55,20,0);
  for(const [x,y] of [[50,6],[52,13],[51,28],[53,34]]) put(furniture,x,y,H.PINE);
  write('battlefield','highland',HROWS,HIGHLAND_SOLID,m,[
    ['west',8,320],['from-fort',28,320],['east',888,320],['from-abbey',868,320],
    ['vulture',...at(32,11)],['ghoul-1',...at(16,28)],['ghoul-2',...at(36,21)],
    ['tent',...at(20,6)],['graves',...at(12,14)],['pit',...at(31,16)],['tracks',...at(41,18)],['ravine',...at(43,19)],
    ...[44,45,46,47].flatMap((x,i)=>[[`gap-${i*2+1}`,...at(x,19)],[`gap-${i*2+2}`,...at(x,20)]]),
    ['south',336,632],['from-drove',336,600],['drove-gate',336,616],
  ]);
}

// The ruined abbey: two deserters hold the gate; the stair down to the ossuary is inside.
{
  const m=grid(40,30,H.HEATHER);const {floor,furniture,put,fill}=m;
  scatter(m,50,H.STONES,29,13,()=>true);
  fill(furniture,0,0,39,0,H.ROCK);fill(furniture,0,29,39,29,H.ROCK);fill(furniture,0,0,0,29,H.ROCK);fill(furniture,39,0,39,29,H.ROCK);
  fill(furniture,0,14,0,15,0);fill(floor,0,14,19,15,H.ROAD);
  // The abbey's walls, broken, with the gate on the west side.
  fill(furniture,18,3,36,3,H.AWALL);fill(furniture,18,26,36,26,H.AWALL);fill(furniture,18,3,18,26,H.AWALL);fill(furniture,36,3,36,26,H.AWALL);
  fill(furniture,18,14,18,15,0);fill(floor,19,4,35,25,H.FLAG);
  // Cloister pillars, some fallen; the stair down in the north-east corner.
  for(const [x,y] of [[22,7],[26,7],[30,7],[22,21],[26,21],[30,21],[22,11],[22,18]]) put(furniture,x,y,H.PILLAR);
  put(floor,33,6,H.STAIR);put(floor,34,6,H.STAIR);
  put(furniture,34,23,H.BOULDER);put(furniture,20,24,H.BOULDER);
  for(const [x,y] of [[6,5],[10,23],[4,20],[13,8],[30,28]]) put(furniture,x,y,H.PINE);
  put(furniture,10,13,H.CAIRN);
  write('abbey','highland',HROWS,HIGHLAND_SOLID,m,[
    ['west',8,232],['from-battlefield',28,232],['stair',536,104],['from-ossuary',536,128],
    ['pair',296,240],['memorial',...at(10,14)],['monk',...at(34,12)],['dead-1',...at(24,17)],['dead-2',...at(28,10)],['dead-3',...at(31,22)],['abbey-cache',...at(35,24)],['nave',...at(28,15)],
  ]);
}

// The ossuary: the hyena's den among the stacked dead.
{
  const m=grid(32,24,H.VOID);const {floor,furniture,put,fill}=m;
  fill(furniture,0,0,31,23,H.VOID);
  fill(floor,7,4,24,18,H.OFLOOR);fill(furniture,7,4,24,18,0);
  fill(furniture,6,3,25,3,H.BONEWALL);fill(furniture,6,3,6,19,H.BONEWALL);fill(furniture,25,3,25,19,H.BONEWALL);fill(furniture,6,19,25,19,H.BONEWALL);
  for(const x of [9,12,19,22]) put(furniture,x,3,H.NICHE);
  for(const y of [7,11,15]) {put(furniture,6,y,H.NICHE);put(furniture,25,y,H.NICHE);}
  fill(furniture,15,19,16,19,0);put(floor,15,19,H.STAIR);put(floor,16,19,H.STAIR);
  for(const [x,y] of [[10,8],[20,13],[13,15],[18,6]]) put(floor,x,y,H.BONES);
  write('ossuary','highland',HROWS,HIGHLAND_SOLID,m,[
    ['up',...at(15,19).map((v,i)=>i===0?v+8:v)],['spawn',256,288],
    ['hyena',...at(15,8)],['den',...at(15,9)],['ledger',...at(20,6)],['shelves',...at(8,11)],
  ]);
}

// The high tarn: a frozen lake under the pass, reached up the smugglers' stair from the weir.
{
  const m=grid(44,32,H.HEATHER);const {floor,furniture,put,fill}=m;
  snowfield(m,(x,y)=>(x<12||x>34||y<8||y>24),0.5,2.7);
  fill(furniture,0,0,43,0,H.ROCK);fill(furniture,0,31,43,31,H.ROCK);fill(furniture,0,0,0,31,H.ROCK);fill(furniture,43,0,43,31,H.ROCK);
  // Up the stair from the weir in the south-west; the rope ladder up to the pass on the east cliff.
  fill(furniture,4,31,5,31,0);fill(floor,4,26,5,31,H.SCREE);
  fill(furniture,43,14,43,15,0);fill(floor,38,14,42,15,H.SCREE);
  fill(furniture,40,1,42,13,H.ROCK);fill(furniture,40,16,42,30,H.ROCK);
  // The lake, frozen hard; a hole cut for fishing; a body under the ice.
  fill(floor,12,8,34,24,H.ICE);put(furniture,22,16,H.HOLE);put(floor,28,12,H.FROZEN);put(floor,29,12,H.FROZEN);
  // The trapper's hut on the north-east shore.
  fill(furniture,34,3,38,6,H.HUT);
  for(const [x,y] of [[3,4],[8,3],[6,12],[3,18],[9,27],[15,4],[31,28],[37,24],[24,28],[2,9]]) put(furniture,x,y,H.PINE);
  for(const [x,y] of [[10,21],[36,18],[19,5]]) put(furniture,x,y,H.BOULDER);
  put(furniture,7,24,H.CAIRN);
  write('tarn','highland',HROWS,HIGHLAND_SOLID,m,[
    ['stair',80,504],['from-weir',80,472],['ladder',696,240],['from-pass',660,240],
    ['tarn-spot',...at(22,17)],['ice-body',...at(28,13)],['trapper',...at(36,8)],['camp-tarn',...at(33,9)],['tarn-cairn',...at(7,25)],['forage-1',...at(6,20)],
    ['hound-1',...at(18,11)],['hound-2',...at(30,20)],['raider-1',...at(10,16)],
  ]);
}

// The drove road: up from the downs to the battlefield's south gate, past the drovers' shelter and a raider camp.
{
  const m=grid(56,24,H.HEATHER);const {floor,furniture,put,fill}=m;
  scatter(m,70,H.STONES,29,13,()=>true);
  fill(furniture,0,0,55,0,H.ROCK);fill(furniture,0,23,55,23,H.ROCK);fill(furniture,0,0,0,23,H.ROCK);fill(furniture,55,0,55,23,H.ROCK);
  fill(furniture,0,10,0,11,0);fill(furniture,44,0,45,0,0);
  // The road: east from the downs, then north up to the gate.
  fill(floor,0,10,45,11,H.ROAD);fill(floor,44,0,45,11,H.ROAD);
  // The drovers' shelter, by the road.
  put(furniture,14,7,H.TENT);put(furniture,15,7,H.TENT);put(furniture,17,8,H.CAIRN);
  // The raider camp in the south-east hollow, behind a ring of boulders.
  for(const [x,y] of [[38,14],[39,14],[44,14],[45,14],[37,15],[37,16],[46,15],[46,17],[37,19],[46,19],[38,20],[45,20]]) put(furniture,x,y,H.BOULDER);
  put(furniture,41,17,H.TENT);put(furniture,43,18,H.BANNER);
  for(const [x,y] of [[5,4],[9,17],[22,3],[27,19],[33,5],[50,6],[52,17],[24,14],[6,20]]) put(furniture,x,y,H.PINE);
  put(furniture,30,9,H.SIGN);
  write('drove','highland',HROWS,HIGHLAND_SOLID,m,[
    ['west',8,168],['from-downs',28,168],['north',712,8],['from-battlefield',712,40],
    ['drover',...at(16,9)],['sheep-a',...at(12,8)],['sheep-b',...at(19,6)],['sheep-c',...at(20,8)],['drove-cairn',...at(17,9)],['drove-sign',...at(30,10)],
    ['raider-1',...at(40,16)],['raider-2',...at(43,16)],['hound-1',...at(28,14)],['raider-stash',...at(42,19)],['forage-1',...at(24,18)],
    ['gate-1',712,24],['gate-2',728,24],
  ]);
}

// The old border fort: a ruined keep above the fort town, held by deserters, with the border war's archive and the signal lantern.
{
  const m=grid(40,34,H.HEATHER);const {floor,furniture,put,fill}=m;
  snowfield(m,()=>true,0.2,5.1);
  fill(furniture,0,0,39,0,H.ROCK);fill(furniture,0,33,39,33,H.ROCK);fill(furniture,0,0,0,33,H.ROCK);fill(furniture,39,0,39,33,H.ROCK);
  // Up from the fort town in the south.
  fill(furniture,19,33,20,33,0);fill(floor,19,22,20,33,H.ROAD);
  // The keep: outer walls, broken in places; the gate on the south side.
  fill(furniture,8,4,31,4,H.AWALL);fill(furniture,8,21,31,21,H.AWALL);fill(furniture,8,4,8,21,H.AWALL);fill(furniture,31,4,31,21,H.AWALL);
  fill(furniture,19,21,20,21,0);fill(furniture,8,12,8,13,0);
  fill(floor,9,5,30,20,H.FLAG);
  // The archive in the west wing, walled off with a door; the inner yard and the tower in the north-east.
  fill(furniture,9,10,16,10,H.AWALL);fill(furniture,16,5,16,10,H.AWALL);fill(furniture,16,8,16,9,0);
  fill(furniture,22,5,22,12,H.AWALL);fill(furniture,22,12,30,12,H.AWALL);fill(furniture,26,12,27,12,0);
  put(floor,28,6,H.STAIR);put(floor,29,6,H.STAIR);
  for(const [x,y] of [[12,15],[17,17],[25,16],[14,19],[28,18]]) put(furniture,x,y,H.PILLAR);
  for(const [x,y] of [[11,7],[13,7],[10,8]]) put(furniture,x,y,H.NICHE);
  put(furniture,18,14,H.BANNER);put(furniture,24,18,H.TENT);
  for(const [x,y] of [[3,6],[5,26],[35,8],[34,27],[2,16],[36,18],[13,28],[27,29]]) put(furniture,x,y,H.PINE);
  for(const [x,y] of [[6,30],[31,25],[16,25]]) put(furniture,x,y,H.BOULDER);
  write('border-keep','highland',HROWS,HIGHLAND_SOLID,m,[
    ['south',328,536],['from-fort',328,512],
    ['hound-1',...at(6,24)],['hound-2',...at(33,22)],
    ['captain',...at(26,10)],['lantern',...at(29,8)],
    ['archive',...at(12,8)],['roll',...at(14,6)],['camp',...at(24,19)],['banner',...at(18,15)],['keep-gate',...at(19,22)],
  ]);
}
