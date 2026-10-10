// Rebuild the placeholder downs tileset, the downs east of the fields, and the barrow under them.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
import { handholds, rect as krect, rows, scatter, sheet, stairs, tileProps, vary } from './tile-kit.mjs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const turf = (base) => rect(0,0,16,16,base)+rect(3,5,1,2,'#7f8c5a')+rect(11,11,1,2,'#7f8c5a')+rect(8,2,2,1,'#5c6a44');
const tree = (leaf,dark) => rect(0,0,16,16,'#66754a')+rect(1,1,14,11,dark)+rect(3,2,9,6,leaf)+rect(7,11,3,5,'#3e3226');
const stone = (a,b) => rect(0,0,16,16,a)+rect(0,5,16,1,b)+rect(0,11,16,1,b)+rect(5,0,1,5,b)+rect(11,6,1,5,b)+rect(3,12,1,4,b);
const tiles = [
  turf('#66754a'),                                                                                      // 0 down turf
  turf('#62714a')+rect(5,8,2,1,'#d8d2bc')+rect(12,3,1,1,'#d8d2bc'),                                      // 1 turf with chalk
  rect(0,0,16,16,'#c4bca2')+rect(2,4,3,1,'#a89e84')+rect(9,10,4,1,'#a89e84')+rect(6,13,1,1,'#ddd6c0'),    // 2 chalk path
  rect(0,0,16,16,'#66754a')+rect(1,3,14,12,'#3e5232')+rect(3,4,3,2,'#c8a840')+rect(9,7,2,2,'#c8a840')+rect(5,10,2,2,'#c8a840'), // 3 gorse
  rect(0,0,16,16,'#66754a')+rect(0,4,16,10,'#7a7a6e')+rect(1,5,5,4,'#8e8e82')+rect(7,9,6,4,'#8e8e82')+rect(0,13,16,1,'#55554c'), // 4 drystone wall
  stone('#6e6c62','#4e4c44'),                                                                            // 5 tower wall
  rect(0,0,16,16,'#5a584e')+rect(2,3,4,3,'#6e6c62')+rect(10,9,3,3,'#6e6c62')+rect(7,13,2,1,'#44423a'),   // 6 rubble floor
  rect(0,0,16,16,'#5c6c42')+rect(0,0,16,4,'#6a7a4c')+rect(2,6,12,1,'#4e5c38')+rect(4,11,8,1,'#4e5c38'),  // 7 barrow mound
  rect(0,0,16,16,'#5c6c42')+rect(2,2,12,14,'#3a3832')+rect(3,3,10,13,'#55534a')+rect(7,3,2,13,'#3a3832'), // 8 barrow slab
  rect(0,0,16,16,'#3a5a5a')+rect(2,4,5,1,'#5a7a76')+rect(9,10,5,1,'#5a7a76'),                             // 9 dew pond
  rect(0,0,16,16,'#66754a')+rect(0,6,16,4,'#dcd6c2'),                                                     // 10 chalk figure, across
  rect(0,0,16,16,'#9a8a6a')+rect(0,0,1,16,'#6a5a44')+rect(15,0,1,16,'#6a5a44')+rect(5,6,6,10,'#4a3a2a'), // 11 hut wall
  rect(0,0,16,16,'#8a7a4a')+[2,6,10,14].map(y=>rect(0,y,16,1,'#6a5a34')).join(''),                       // 12 thatch
  tree('#56683c','#3e4e2e'),                                                                              // 13 hawthorn
  tree('#3a4a30','#2a3822'),                                                                              // 14 border trees
  rect(0,0,16,16,'#66754a')+rect(7,6,2,10,'#5d4630')+rect(2,2,12,5,'#8c7049')+rect(3,3,10,1,'#b49863'),   // 15 signpost
  rect(0,0,16,16,'#66754a')+rect(0,5,16,2,'#7a6040')+rect(0,10,16,2,'#7a6040')+[1,7,13].map(x=>rect(x,3,2,11,'#5d4630')).join(''), // 16 hurdle
  rect(0,0,16,16,'#3a3a34')+rect(0,0,7,7,'#44443c')+rect(8,8,8,8,'#44443c')+rect(0,15,16,1,'#2a2a26'),   // 17 barrow floor
  stone('#2e2c28','#1e1c1a'),                                                                            // 18 barrow wall
  rect(0,0,16,16,'#07090a'),                                                                              // 19 void
  rect(0,0,16,16,'#3a3a34')+rect(1,2,14,12,'#5a5850')+rect(2,3,12,10,'#6a6860')+rect(4,6,8,1,'#4a4842'), // 20 grave slab
  rect(0,0,16,16,'#3a3a34')+rect(1,3,14,11,'#7a6a3a')+rect(3,5,10,7,'#8a7a46')+rect(5,7,6,3,'#6a5a30'),   // 21 straw nest
  rect(0,0,16,16,'#3a3a34')+rect(3,5,7,2,'#c8c0a8')+rect(9,10,5,2,'#c8c0a8')+rect(5,11,2,2,'#a8a088'),   // 22 bones
  rect(0,0,16,16,'#66754a')+rect(3,8,10,7,'#7a7a6e')+rect(5,4,6,5,'#8e8e82')+rect(7,1,3,4,'#7a7a6e'),     // 23 cairn
  rect(0,0,16,16,'#66754a')+rect(6,0,4,16,'#dcd6c2'),                                                     // 24 chalk figure, down
  rect(0,0,16,16,'#66754a')+rect(0,6,10,4,'#dcd6c2')+rect(6,0,4,10,'#dcd6c2'),                             // 25 chalk figure, corner
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
  rect(0,0,16,16,'#66754a')+rect(1,1,14,10,'#3e5230')+rect(2,1,11,6,'#4e6638')+rect(4,3,2,2,'#a8402e')+rect(10,5,2,2,'#a8402e')+rect(6,8,2,2,'#8a3424')+rect(7,10,3,6,'#4a3a2a')+rect(3,13,2,1,'#7a3022')+rect(11,14,2,1,'#6a4a2a'), // apple tree
  scatter(turf('#66754a'), 41, [['#8a3424',2,1],['#a8402e',1,1],['#6a4a2a',2,1],['#5c6a44',1,2]], 7),                                   // windfalls
  rect(0,0,16,16,'#66754a')+rect(1,3,14,12,'#5a4430')+rect(2,4,12,3,'#7a5e40')+rect(6,1,4,4,'#3e3226')+rect(3,9,10,5,'#4a3622')+rect(4,10,8,1,'#8a3424'), // cider press
  rect(0,0,16,16,'#66754a')+rect(7,3,2,13,'#7a5e40')+rect(6,2,4,2,'#9a7a50')+rect(4,13,8,2,'#55603c')+rect(9,5,4,1,'#c8c0a8'),        // grafting stake with a tag
);
// The watchtower's face, grown over with ivy thick enough to climb.
const IVY = tiles.length + 1;
tiles.push(handholds({ face: '#6e6c62', light: '#8a887c', hold: '#3e3c34', accent: rect(0,0,3,16,'#3e5a32')+rect(1,3,4,3,'#4e6a3a')+rect(11,1,5,5,'#3e5a32')+rect(9,9,4,3,'#4e6a3a')+rect(13,12,3,4,'#3e5a32') }));
const svg = sheet(tiles);
writeFileSync('public/assets/downs-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows(tiles)*16}" shape-rendering="crispEdges">${svg}</svg>\n`);
const [TURF,CHALKY,PATH,GORSE,WALL,TOWER,RUBBLE,MOUND,SLAB,POND,FIG_A,HUT,THATCH,THORN,BORDER,SIGN,HURDLE,BFLOOR,BWALL,VOID,GRAVE,NEST,BONES,CAIRN,FIG_D,FIG_C]=tiles.map((_,i)=>i+1);
const [APPLE,WINDFALL,PRESS,STAKE]=[0,1,2,3].map(i=>ORCHARD_TILES+i);
const solid=[3,4,5,7,8,9,11,12,13,14,15,16,18,19,20,23,APPLE-1,PRESS-1,STAKE-1];

function write(name,{w,h,floor,furniture},points){
  const layer=(n,data,id)=>({id,name:n,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
  const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
    layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([n,x,y],i)=>({id:i+1,name:n,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
    tilesets:[{firstgid:1,name:'downs',image:'../assets/downs-tiles.svg',imagewidth:128,imageheight:rows(tiles)*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows(tiles)*8,
      tiles:tileProps(solid,[],[],[IVY-1])}]};
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
  const ivy=(x0,y0,x1,y1)=>{fill(furniture,x0,y0,x1,y1,0);fill(floor,x0,y0,x1,y1,IVY);};
  // The bottom of the tower, where the stair has fallen in.
  ledge(3,34,12,38);fill(furniture,7,39,8,39,0);fill(floor,7,39,8,39,RUBBLE);
  // Up the ivy, ledge to ledge: each run short enough to climb on one grip.
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
  ].map(([n,x,y])=>[n,x+ox*16,y]));
}
