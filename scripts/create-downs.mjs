// Rebuild the placeholder downs tileset, the downs east of the fields, and the barrow under them.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
import { ellipse, handholds, rect as krect, rows, scatter, sheet, stairs, tileProps, vary } from './tile-kit.mjs';
import { blocks, boulder, shadow, tree as drawTree, tuft, turf as turfTile, water as waterTile } from './tile-art.mjs';
const rect = (x,y,w,h,c,o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o===undefined?'':` fill-opacity="${o}"`}/>`;
// The downs: short turf over chalk, lit from the upper left, the chalk showing white wherever the turf is worn.
const turf = (base='#66754a') => turfTile(base,'#7f8c5a','#56643e');
const tree = (leaf,dark,light) => drawTree({ ground:'#66754a', leaf, dark, light, trunk:'#3e3226', trunkDark:'#2a2018' });
const stone = (mortar,face,light,shade) => blocks(mortar,face,light,shade);
const chalk = '#dcd6c2', chalkEdge = '#c4bca2';
const tiles = [
  turf(),                                                                                               // 0 down turf
  turf('#62714a')+rect(5,8,2,1,'#d8d2bc')+rect(12,3,1,1,'#d8d2bc')+rect(6,9,1,1,'#b8b098'),              // 1 turf with chalk
  rect(0,0,16,16,'#c4bca2')+rect(2,4,3,1,'#a89e84')+rect(9,10,4,1,'#a89e84')+rect(6,13,1,1,'#ddd6c0')+rect(12,3,2,1,'#ddd6c0')+rect(3,11,1,1,'#8e8670'), // 2 chalk path
  turf()+shadow(9,14.5,7,1.5)+ellipse(8,9,7.5,6,'#2e4228')+ellipse(6,8,4.5,4.5,'#3e5232')+ellipse(11,9,4,4,'#3e5232')+ellipse(5,6.5,2,1.5,'#4e6440')
    +[[3,4],[9,7],[5,10],[12,5],[8,11]].map(([x,y])=>rect(x,y,2,2,'#c8a840')+rect(x,y,1,1,'#e2c860')).join(''), // 3 gorse
  turf()+shadow(8,14,8,1)+rect(0,4,16,10,'#5e5e54')+[[0,4,5,5],[6,4,4,5],[11,4,5,5],[0,9,3,5],[4,9,6,5],[11,9,5,5]].map(([x,y,w,h])=>rect(x,y,w-1,h-1,'#7a7a6e')+rect(x,y,w-1,1,'#929286')+rect(x+w-2,y+1,1,h-2,'#5e5e54')).join(''), // 4 drystone wall
  stone('#4e4c44','#6e6c62','#86847a','#56544c'),                                                        // 5 tower wall
  rect(0,0,16,16,'#5a584e')+boulder(4,4.5,2.5,2,'#6e6c62','#86847a','#44423a')+boulder(11.5,10.5,2.5,2,'#6e6c62','#86847a','#44423a')+rect(7,13,2,1,'#44423a')+rect(13,3,1,1,'#7a786e'), // 6 rubble floor
  rect(0,0,16,16,'#5c6c42')+rect(0,0,16,4,'#6a7a4c')+rect(0,0,16,1,'#7a8a5a')+rect(2,6,12,1,'#4e5c38')+rect(4,11,8,1,'#4e5c38')+tuft(3,8,'#7a8a5a','#4e5c38')+tuft(11,13,'#7a8a5a','#4e5c38'), // 7 barrow mound
  rect(0,0,16,16,'#5c6c42')+rect(2,2,12,14,'#2a2824')+rect(3,3,10,13,'#55534a')+rect(3,3,10,1,'#6e6c62')+rect(3,3,1,13,'#6e6c62')+rect(7,3,2,13,'#3a3832')+rect(12,4,1,12,'#44423a'), // 8 barrow slab
  waterTile('#3a5a5a','#5a7a76','#8aaaa4','#2e4a4a'),                                                    // 9 dew pond
  turf()+rect(0,6,16,4,chalk)+rect(0,6,16,1,'#ece6d4')+rect(0,9,16,1,chalkEdge),                         // 10 chalk figure, across
  rect(0,0,16,16,'#9a8a6a')+rect(0,0,2,16,'#5a4a36')+rect(14,0,2,16,'#5a4a36')+rect(2,0,12,1,'#b0a080')+rect(5,6,6,10,'#3a2e22')+rect(5,6,6,1,'#5a4a36')+rect(6,7,1,9,'#4a3c2c'), // 11 hut wall
  rect(0,0,16,16,'#8a7a4a')+[1,4,6,9,12,14].map((x,i)=>rect(x,0,1,16,i%2?'#6a5a34':'#a8986a')).join('')+[3,8,13].map(y=>rect(0,y,16,1,'#6a5a34',0.6)).join(''), // 12 thatch
  tree('#56683c','#3e4e2e','#6e8250'),                                                                   // 13 hawthorn
  tree('#3a4a30','#2a3822','#4a5e3e'),                                                                   // 14 border trees
  turf()+shadow(10,15,3,1)+rect(7,6,2,10,'#5d4630')+rect(8,6,1,10,'#3f2f20')+rect(2,2,12,5,'#8c7049')+rect(2,2,12,1,'#b49863')+rect(2,6,12,1,'#6a5236')+rect(4,4,6,1,'#5d4630'), // 15 signpost
  turf()+shadow(8,13,8,1)+rect(0,5,16,2,'#7a6040')+rect(0,5,16,1,'#94784e')+rect(0,10,16,2,'#7a6040')+rect(0,10,16,1,'#94784e')+[1,7,13].map(x=>rect(x,3,2,11,'#5d4630')+rect(x,3,1,11,'#7a6040')).join(''), // 16 hurdle
  rect(0,0,16,16,'#2a2a26')+[[0,0,7,7],[8,0,8,7],[0,8,4,8],[5,8,11,8]].map(([x,y,w,h])=>rect(x,y,w-1,h-1,'#3e3e37')+rect(x,y,w-1,1,'#4a4a42')).join(''), // 17 barrow floor
  stone('#141210','#2e2c28','#3a3833','#221f1c'),                                                        // 18 barrow wall
  rect(0,0,16,16,'#07090a'),                                                                              // 19 void
  rect(0,0,16,16,'#3a3a34')+shadow(9,14,7,1)+rect(1,2,14,12,'#5a5850')+rect(2,3,12,10,'#6a6860')+rect(2,3,12,1,'#7e7c72')+rect(4,6,8,1,'#4a4842')+rect(5,9,6,1,'#4a4842')+rect(13,3,1,10,'#4e4c44'), // 20 grave slab
  rect(0,0,16,16,'#3a3a34')+ellipse(8,9,7,5.5,'#5a4a2a')+ellipse(8,8.5,6,4.5,'#7a6a3a')+ellipse(8,8.5,3.5,2.5,'#5a4a28')+[[4,6],[11,8],[6,11],[10,5]].map(([x,y])=>rect(x,y,3,1,'#9a8a50')).join(''), // 21 straw nest
  rect(0,0,16,16,'#3a3a34')+rect(3,5,7,2,'#c8c0a8')+rect(3,5,7,1,'#ddd6c0')+rect(2,4,2,4,'#c8c0a8')+rect(9,4,2,4,'#c8c0a8')+rect(9,10,5,2,'#c8c0a8')+ellipse(6,12,2,1.5,'#b8b098')+rect(5,12,1,1,'#3a3a34'), // 22 bones
  turf()+shadow(9,15,6,1)+boulder(8,12,5,3,'#7a7a6e','#929286','#55554c')+boulder(8,7.5,3.5,2.5,'#7a7a6e','#929286','#55554c')+boulder(8,3.5,2,2,'#7a7a6e','#929286','#55554c'), // 23 cairn
  turf()+rect(6,0,4,16,chalk)+rect(6,0,1,16,'#ece6d4')+rect(9,0,1,16,chalkEdge),                         // 24 chalk figure, down
  turf()+rect(0,6,10,4,chalk)+rect(6,0,4,10,chalk)+rect(0,6,6,1,'#ece6d4')+rect(6,0,1,6,'#ece6d4')+rect(0,9,10,1,chalkEdge)+rect(9,0,1,10,chalkEdge), // 25 chalk figure, corner
];
// Variants of the turf, so the downs roll instead of tiling: tufts, chalk showing through, a few wild flowers.
const TURF_VARIANTS = [tiles.length + 1, tiles.length + 2];
tiles.push(
  scatter(turf('#66754a'), 5, [['#7f8c5a',1,2],['#5c6a44',2,1],['#c8b8d8',1,1],['#d8d2bc',1,1]], 8),
  scatter(turf('#66754a'), 6, [['#5a6842',3,2],['#d8d2bc',2,1],['#7f8c5a',1,2]], 6),
);
// The orchard: apple trees heavy and unpicked, windfalls rotting in the grass, the press, and the stakes.
const ORCHARD_TILES = tiles.length + 1;
tiles.push(
  drawTree({ ground:'#66754a', leaf:'#4e6638', dark:'#3e5230', light:'#66804a', trunk:'#4a3a2a', fruit:'#a8402e' })+rect(3,13,2,1,'#7a3022')+rect(11,14,2,1,'#6a4a2a'), // apple tree
  scatter(turf(), 41, [['#8a3424',2,1],['#a8402e',1,1],['#6a4a2a',2,1],['#5c6a44',1,2]], 7),                                   // windfalls
  turf()+shadow(9,15,7,1)+rect(1,3,14,12,'#5a4430')+rect(1,3,14,1,'#7a5e40')+rect(2,4,12,3,'#7a5e40')+rect(6,1,4,4,'#3e3226')+rect(6,1,4,1,'#5a4a3a')+rect(3,9,10,5,'#4a3622')+rect(4,10,8,1,'#8a3424')+rect(14,4,1,11,'#3e3226'), // cider press
  turf()+shadow(10,15,3,1)+rect(7,3,2,13,'#7a5e40')+rect(7,3,1,13,'#9a7a50')+rect(6,2,4,2,'#9a7a50')+rect(4,13,8,2,'#55603c')+rect(9,5,4,2,'#c8c0a8')+rect(9,5,4,1,'#ddd6c0'),        // grafting stake with a tag
);
// The watchtower's face, grown over with ivy thick enough to climb.
const IVY = tiles.length + 1;
tiles.push(handholds({ face: '#6e6c62', light: '#8a887c', hold: '#3e3c34', accent: rect(0,0,3,16,'#3e5a32')+rect(1,3,4,3,'#4e6a3a')+rect(11,1,5,5,'#3e5a32')+rect(9,9,4,3,'#4e6a3a')+rect(13,12,3,4,'#3e5a32') }));
const svg = sheet(tiles);
writeFileSync('public/assets/downs-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows(tiles)*16}" shape-rendering="crispEdges">${svg}</svg>\n`);
// TILES_ONLY=1 redraws the tiles and leaves the maps alone: they have been edited by hand since this script made them.
if (process.env.TILES_ONLY) process.exit(0);
const [TURF,CHALKY,PATH,GORSE,WALL,TOWER,RUBBLE,MOUND,SLAB,POND,FIG_A,HUT,THATCH,THORN,BORDER,SIGN,HURDLE,BFLOOR,BWALL,VOID,GRAVE,NEST,BONES,CAIRN,FIG_D,FIG_C]=tiles.map((_,i)=>i+1);
const [APPLE,WINDFALL,PRESS,STAKE]=[0,1,2,3].map(i=>ORCHARD_TILES+i);
const solid=[3,4,5,7,8,9,11,12,13,14,15,16,18,19,20,23,APPLE-1,PRESS-1,STAKE-1];

function write(name,{w,h,floor,furniture},points){
  const layer=(n,data,id)=>({id,name:n,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
  const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
    layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([n,x,y],i)=>({id:i+1,name:n,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
    tilesets:[{firstgid:1,name:'downs',image:'../assets/downs-tiles.svg',imagewidth:128,imageheight:rows(tiles)*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows(tiles)*8,
      tiles:tileProps([...solid,IVY-1])}]};
  vary(floor,w,1,TURF_VARIANTS,7);
  writeFileSync(`public/maps/${name}.json`,JSON.stringify(map,null,2)+'\n');
}
const grid=(w,h,base)=>{
  const floor=Array(w*h).fill(base), furniture=Array(w*h).fill(0);
  const put=(a,x,y,t)=>a[y*w+x]=t;
  const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
  return {w,h,floor,furniture,put,fill};
};
const at=(x,y)=>[x*16+8,y*16+8];

// The downs: open chalk pasture, a broken watchtower to the north, the ram's hut to the east, and a barrow to the south.
{
  const m=grid(60,40,TURF);const {floor,furniture,put,fill}=m;
  for(let i=0;i<70;i++) put(floor,(i*41+7)%60,(i*29+3)%40,CHALKY);
  fill(furniture,0,0,59,0,BORDER);fill(furniture,0,39,59,39,BORDER);fill(furniture,0,0,0,39,BORDER);fill(furniture,59,0,59,39,BORDER);
  // In from the fields on the west, the chalk path forks for the tower, the hut, and the barrow.
  fill(furniture,0,19,0,20,0);fill(floor,0,19,47,20,PATH);
  fill(floor,30,9,31,18,PATH);
  // East up the slope to the drove road.
  fill(floor,48,19,55,20,PATH);fill(floor,54,9,55,20,PATH);fill(floor,54,9,59,10,PATH);fill(furniture,59,9,59,10,0);fill(floor,22,21,23,29,PATH);fill(floor,46,21,47,24,PATH);
  put(furniture,3,17,SIGN);
  // The watchtower: a broken ring of wall with the doorway on the south side.
  fill(furniture,25,2,36,2,TOWER);fill(furniture,25,2,25,8,TOWER);fill(furniture,36,2,36,8,TOWER);fill(furniture,25,8,36,8,TOWER);
  fill(furniture,30,8,31,8,0);fill(furniture,33,2,34,2,0);fill(floor,26,3,35,7,RUBBLE);
  put(furniture,27,6,TOWER);put(furniture,34,4,TOWER);
  // The ram's hut, his lambing fold, and the hurdles of the pen.
  fill(furniture,47,14,52,15,THATCH);fill(furniture,47,16,52,17,HUT);
  fill(furniture,52,22,57,22,HURDLE);fill(furniture,52,28,57,28,HURDLE);fill(furniture,52,23,52,27,HURDLE);fill(furniture,57,23,57,27,HURDLE);fill(furniture,52,25,52,26,0);
  // The dew pond, lined with clay, that the sheep drink from.
  fill(furniture,38,26,43,29,POND);fill(furniture,39,25,42,25,POND);
  // The barrow: a long grassed mound with a stone slab for a door.
  fill(furniture,15,30,30,35,MOUND);put(furniture,22,30,SLAB);put(furniture,23,30,SLAB);
  // A running wolf cut into the chalk of the south slope, half grassed over.
  fill(floor,36,34,48,34,FIG_A);fill(floor,48,31,48,33,FIG_D);put(floor,48,30,FIG_C);fill(floor,49,30,51,30,FIG_A);
  fill(floor,37,35,37,37,FIG_D);fill(floor,41,35,41,37,FIG_D);fill(floor,44,35,44,37,FIG_D);fill(floor,47,35,47,37,FIG_D);fill(floor,33,33,35,33,FIG_A);
  // Gorse and hawthorn break up the open ground. A cairn on the western slope.
  for(const [x,y] of [[6,6],[7,6],[12,4],[14,11],[15,11],[8,26],[9,26],[19,14],[40,12],[41,12],[44,6],[53,6],[54,6],[10,34],[33,24],[50,36],[51,36],[27,24],[56,12]]) put(furniture,x,y,GORSE);
  for(const [x,y] of [[4,10],[18,5],[21,24],[38,17],[55,33],[13,36],[5,30],[45,10]]) put(furniture,x,y,THORN);
  put(furniture,8,30,CAIRN);
  // South, down a sunken lane to the orchard nobody picks.
  fill(floor,6,21,7,38,PATH);fill(furniture,6,39,7,39,0);fill(floor,6,39,7,39,PATH);
  write('downs',m,[
    ['west',8,328],['from-fields',28,328],['downs-sign',...at(3,18)],
    ['tower',...at(30,9)],['pack',...at(30,5)],['tower-cache',...at(34,6)],
    ['ram',...at(49,19)],['kid',...at(53,19)],['hut',...at(50,18)],['camp-downs',...at(44,22)],['fold',...at(54,25)],['sheep-1',...at(55,24)],['sheep-2',...at(54,26)],
    ['dewpond-spot',...at(40,24)],
    ['barrow-door',368,472],['from-barrow',368,456],
    ['figure',...at(42,33)],['east',952,160],['from-drove',932,160],['cairn',...at(8,31)],['bard',136,468],['waystone',...at(27,22)],['from-waystone',...at(27,23)],['forage-1',...at(20,12)],['forage-2',...at(40,8)],['forage-3',...at(39,18)],['forage-4',...at(26,26)],
    ['hound-west',...at(12,13)],['hound-east',...at(46,33)],
    ['south',112,632],['from-orchard',112,600],['climb-tower',...at(27,4)],['from-tower',...at(28,5)],
  ]);
}

// The barrow: a passage grave of old stones, where a hound has made her nest among the bones.
{
  const m=grid(32,24,VOID);const {floor,furniture,put,fill}=m;
  fill(furniture,0,0,31,23,VOID);
  fill(floor,10,6,21,16,BFLOOR);fill(furniture,10,6,21,16,0);
  fill(furniture,9,4,22,5,BWALL);fill(furniture,9,4,9,17,BWALL);fill(furniture,22,4,22,17,BWALL);fill(furniture,9,17,22,17,BWALL);
  fill(furniture,15,17,16,17,0);fill(floor,15,17,16,17,BFLOOR);
  // A narrower passage at the south end, then the chamber.
  fill(furniture,10,13,13,16,BWALL);fill(furniture,18,13,21,16,BWALL);
  put(furniture,11,7,GRAVE);put(furniture,20,7,GRAVE);put(furniture,20,10,GRAVE);
  put(floor,15,8,NEST);put(floor,16,8,NEST);
  for(const [x,y] of [[12,10],[18,9],[14,11]]) put(floor,x,y,BONES);
  write('barrow',m,[['spawn',...at(15,15)],['out',...at(15,17)],['hound-mother',...at(16,8)],['nest',...at(15,9)],['grave',...at(11,8)],['grave-goods',...at(20,11)]]);
}

// The orchard below the downs: rows of apple trees nobody picks, the press, a hare's hut, and five grafting stakes.
{
  const m=grid(40,28,TURF);const {floor,furniture,put,fill}=m;
  fill(furniture,0,0,39,0,BORDER);fill(furniture,0,27,39,27,BORDER);fill(furniture,0,0,0,27,BORDER);fill(furniture,39,0,39,27,BORDER);
  fill(furniture,19,0,20,0,0);fill(floor,19,0,20,14,PATH);fill(floor,4,14,35,15,PATH);
  // The trees, in rows the way they were planted, with the windfalls under them.
  for(let y=4;y<=24;y+=4) for(let x=3;x<=36;x+=4){ if(x===19||y===16&&x>=27) continue; put(furniture,x,y,APPLE);put(floor,x,y+1,WINDFALL);put(floor,x+1,y,WINDFALL); }
  for(let i=0;i<40;i++) put(floor,(i*17+3)%38+1,(i*11+5)%26+1,WINDFALL);
  fill(floor,19,0,20,14,PATH);fill(floor,4,14,35,15,PATH);
  // The hare's hut in the north-east corner, and the press beside it.
  fill(furniture,30,2,35,3,THATCH);fill(furniture,30,4,35,5,HUT);put(furniture,26,10,PRESS);put(furniture,27,10,PRESS);
  // A clearing in the south-west: five stakes in a row, each tagged, each with a young tree grafted to it.
  fill(furniture,3,20,11,20,0);fill(furniture,3,24,11,24,0);for(const x of [3,5,7,9,11]) put(furniture,x,22,STAKE);
  fill(floor,3,21,11,23,TURF);
  // The well, and the camp.
  fill(furniture,15,22,16,22,POND);
  write('orchard',m,[
    ['north',320,8],['from-downs',320,40],
    ['grafter',...at(32,7)],['hut',...at(33,6)],['press',...at(26,11)],['stakes',...at(7,23)],['well',...at(15,23)],
    ['weevil-1',...at(9,10)],['weevil-2',...at(29,18)],['locust-1',...at(14,19)],['blight',...at(33,22)],
    ['camp-orchard',...at(22,9)],['forage-1',...at(6,16)],['forage-2',...at(34,13)],
  ]);
}

// The old watchtower on the downs, climbed from the inside: ivy up the broken walls, ledges where floors used to be,
// and the top, where the watch kept its fire, open to the sky.
{
  const m=grid(16,40,RUBBLE);const {floor,furniture,put,fill}=m;
  fill(furniture,0,0,15,39,TOWER);
  const ledge=(x0,y0,x1,y1)=>{fill(furniture,x0,y0,x1,y1,0);fill(floor,x0,y0,x1,y1,RUBBLE);};
  const ivy=(x0,y0,x1,y1)=>{fill(furniture,x0,y0,x1,y1,IVY);};
  // The bottom of the tower, where the stair has fallen in.
  ledge(3,34,12,38);fill(furniture,7,39,8,39,0);fill(floor,7,39,8,39,RUBBLE);
  // Up the ivy, ledge to ledge: each face a climb of its own, from a point at its foot to one on the ledge above.
  ivy(5,27,10,33);ledge(3,25,9,26);
  ivy(3,19,7,24);ledge(2,17,12,18);
  ivy(9,11,13,16);ledge(7,9,13,10);
  ivy(7,5,10,8);
  // The top: the watch-fire's hearth, open to the sky.
  ledge(2,1,13,4);put(furniture,7,2,CAIRN);put(floor,10,3,BONES);
  for(const [x,y] of [[3,36],[11,35]]) put(floor,x,y,BONES);
  // Narrower than the view: stand it in the middle of a wider map of wall, so it doesn't sit against one side.
  const ox=Math.floor((30-m.w)/2), wide={...m,w:30,floor:Array(30*m.h).fill(m.floor[0]),furniture:Array(30*m.h).fill(TOWER)};
  for(let y=0;y<m.h;y++) for(let x=0;x<m.w;x++){wide.floor[y*30+x+ox]=m.floor[y*m.w+x];wide.furniture[y*30+x+ox]=m.furniture[y*m.w+x];}
  write('watchtower',wide,[
    ['down',128,632],['spawn',128,600],
    ['hearth',...at(7,3)],['cache',...at(11,2)],['view',...at(4,2)],['ledge-bones',...at(11,36)],
    ['climb-1',...at(7,34)],['top-1',...at(7,26)],['climb-2',...at(4,25)],['top-2',...at(5,18)],['climb-3',...at(11,17)],['top-3',...at(11,10)],['climb-4',...at(8,9)],['top-4',...at(8,4)],
  ].map(([n,x,y])=>[n,x+ox*16,y]));
}
