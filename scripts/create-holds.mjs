// Rebuild the placeholder mountain-holds tileset and the region: the climb above the holds' gate, the hold itself
// (a city up a cliff face, ranked by height), the noble house's upper tiers, the rookeries' archive, and the lord's hall.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const tiles = [
  rect(0,0,16,16,'#3a3a3e')+rect(1,1,7,6,'#46464a')+rect(8,8,7,7,'#424246')+rect(0,7,16,1,'#2a2a2e')+rect(3,12,4,1,'#2e2e32'), // 0 cliff
  rect(0,0,16,16,'#6a665c')+rect(2,3,5,1,'#5a564c')+rect(9,10,5,1,'#5a564c')+rect(5,13,3,1,'#7a766a'),                     // 1 ledge
  rect(0,0,16,16,'#b8bcc0')+rect(3,4,6,1,'#a8acb2')+rect(8,11,5,1,'#c8ccd0'),                                                 // 2 scoured snow
  rect(0,0,16,16,'#5e5a54')+rect(0,0,8,8,'#66625a')+rect(8,8,8,8,'#66625a')+rect(0,7,16,1,'#4a4640')+rect(7,0,1,16,'#4a4640'),  // 3 terrace flags
  rect(0,0,16,16,'#7a7468')+rect(0,5,16,1,'#5e5850')+rect(0,11,16,1,'#5e5850')+rect(6,0,1,5,'#5e5850')+rect(11,6,1,5,'#5e5850'), // 4 tier wall
  rect(0,0,16,16,'#3a4250')+[2,6,10,14].map(y=>rect(0,y,16,2,'#2e3440')).join(''),                                           // 5 slate roof
  rect(0,0,16,16,'#6a665c')+[0,4,8,12].map((y,i)=>rect(0,y,16,4,['#8a8678','#7a766a','#6a665c','#5a564c'][i])).join(''),       // 6 stair
  rect(0,0,16,16,'#0e1218')+rect(3,5,2,1,'#1a2028')+rect(10,11,3,1,'#1a2028'),                                               // 7 the drop
  rect(0,0,16,16,'#7a7468')+rect(4,0,8,14,'#6a2a2a')+rect(5,2,6,4,'#c8a848')+rect(6,9,4,3,'#c8a848'),                          // 8 house banner
  rect(0,0,16,16,'#7a7468')+rect(1,1,14,15,'#2e2a26')+[3,7,11].map(x=>rect(x,1,2,15,'#5a5650')).join('')+rect(1,7,14,2,'#5a5650'), // 9 gate
  rect(0,0,16,16,'#5e5a54')+rect(3,1,10,15,'#3a2a1c')+rect(4,2,8,13,'#4a3624')+rect(10,8,1,1,'#b89a5a'),                    // 10 door
  rect(0,0,16,16,'#6a5a44')+rect(0,3,16,10,'#8a7a5a')+rect(2,5,12,2,'#5a4a34')+rect(4,9,8,2,'#5a4a34'),                      // 11 nest wall (woven)
  rect(0,0,16,16,'#3a3028')+rect(0,2,16,2,'#5a4632')+rect(0,9,16,2,'#5a4632')+[1,4,7,10,13].map(x=>rect(x,4,2,5,'#d8d0b8')).join('')+[2,6,11].map(x=>rect(x,11,3,4,'#c8c0a0')).join(''), // 12 letter shelves
  rect(0,0,16,16,'#4a3e30')+[0,8].map(y=>rect(0,y,16,1,'#3a3024')).join('')+rect(5,0,1,8,'#3a3024')+rect(11,8,1,8,'#3a3024'), // 13 archive boards
  rect(0,0,16,16,'#5a2a2a')+rect(1,1,14,14,'#6a3030')+rect(3,3,10,10,'#7a3a34')+rect(7,0,2,16,'#c8a848'),                    // 14 hall carpet
  rect(0,0,16,16,'#5a2a2a')+rect(2,1,12,14,'#4a3424')+rect(3,2,10,6,'#c8a848')+rect(4,8,8,5,'#6a3030'),                       // 15 the lord's chair
  rect(0,0,16,16,'#5e5a54')+rect(4,0,8,16,'#8a8478')+rect(5,0,2,16,'#9a9488')+rect(3,13,10,3,'#6a665c'),                      // 16 pillar
  rect(0,0,16,16,'#5e5a54')+rect(2,6,12,2,'#5a4632')+rect(3,8,1,8,'#5a4632')+rect(12,8,1,8,'#5a4632')+rect(4,2,3,4,'#3a3a40')+rect(9,3,3,3,'#3a3a40'), // 17 perches, empty
  rect(0,0,16,16,'#5e5a54')+rect(4,8,8,8,'#3a3430')+rect(5,4,6,5,'#e0a850')+rect(6,2,4,3,'#f0c870'),                          // 18 brazier
  rect(0,0,16,16,'#5e5a54')+rect(6,4,4,12,'#3a3a40')+rect(7,0,2,8,'#8a8a90')+rect(5,0,6,2,'#c8a848'),                         // 19 lever
  rect(0,0,16,16,'#3a3a3e')+rect(1,1,14,11,'#26342a')+rect(3,2,9,6,'#3a4a34')+rect(7,11,3,5,'#3a2e22'),                       // 20 cliff pine
  rect(0,0,16,16,'#6a665c')+rect(2,3,12,11,'#4e4e52')+rect(4,4,6,3,'#626266'),                                                 // 21 boulder
  rect(0,0,16,16,'#0e1218')+rect(0,4,16,8,'#5a4632')+[1,5,9,13].map(x=>rect(x,4,1,8,'#3a2e20')).join('')+rect(0,3,16,1,'#8a7a5a')+rect(0,12,16,1,'#8a7a5a'), // 22 rope bridge
  rect(0,0,16,16,'#5e5a54')+rect(4,2,8,12,'#8a8478')+rect(5,0,6,4,'#9a9488')+rect(6,1,4,2,'#3a3a40')+rect(3,13,10,3,'#6a665c'), // 23 statue of a lord
  rect(0,0,16,16,'#7a7468')+rect(0,5,16,1,'#5e5850')+rect(0,11,16,1,'#5e5850')+rect(6,3,4,9,'#1a1e24')+rect(7,4,2,7,'#2a3a4a'), // 24 wall with a window slit
];
const svg = tiles.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
writeFileSync('public/assets/holds-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="64" shape-rendering="crispEdges">${svg}</svg>\n`);
const [CLIFF,LEDGE,SNOW,FLAGS,TWALL,ROOF,STAIR,DROP,BANNER,GATE,DOOR,NEST,LETTERS,BOARDS,CARPET,CHAIR,PILLAR,PERCH,BRAZIER,LEVER,PINE,BOULDER,BRIDGE,STATUE,SLIT]=tiles.map((_,i)=>i+1);
// Collides lists 0-based tile ids.
const solid=[0,4,5,7,8,9,11,12,15,16,17,18,19,20,21,23,24];

function grid(W,H,ground){
  const floor=Array(W*H).fill(ground), furniture=Array(W*H).fill(0);
  const put=(a,x,y,t)=>{if(x>=0&&y>=0&&x<W&&y<H)a[y*W+x]=t;};
  const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
  const frame=t=>{fill(furniture,0,0,W-1,0,t);fill(furniture,0,H-1,W-1,H-1,t);fill(furniture,0,0,0,H-1,t);fill(furniture,W-1,0,W-1,H-1,t);};
  // Carve walkable ground out of the rock.
  const carve=(x0,y0,x1,y1,t)=>{fill(furniture,x0,y0,x1,y1,0);fill(floor,x0,y0,x1,y1,t);};
  return {W,H,floor,furniture,put,fill,frame,carve};
}
const at=(x,y)=>[x*16+8,y*16+8];
function write(name,{W,H,floor,furniture},points){
  const layer=(lname,data,id)=>({id,name:lname,type:'tilelayer',width:W,height:H,x:0,y:0,opacity:1,visible:true,data});
  const map={compressionlevel:-1,width:W,height:H,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
    layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([pname,x,y],i)=>({id:i+1,name:pname,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
    tilesets:[{firstgid:1,name:'holds',image:'../assets/holds-tiles.svg',imagewidth:128,imageheight:64,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:32,
      tiles:solid.map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
  writeFileSync(`public/maps/${name}.json`,JSON.stringify(map,null,2)+'\n');
}

// The climb: switchbacks up a cliff face above the holds' gate, with the drop on the east side.
{
  const m=grid(36,40,LEDGE);const {floor,furniture,put,fill,carve}=m;
  fill(furniture,0,0,35,39,CLIFF);fill(furniture,31,0,35,39,DROP);
  carve(15,36,18,39,LEDGE);                      // up from the gate
  carve(4,33,30,36,LEDGE);                       // the first ledge
  carve(27,25,29,33,STAIR);                      // stair up the east end
  carve(5,23,30,26,SNOW);                        // the second ledge, wind-scoured
  carve(1,20,4,28,LEDGE);carve(4,23,5,24,LEDGE); // a crack in the rock, west of the second ledge
  carve(5,12,7,23,STAIR);                        // stair up the west end
  carve(5,10,30,13,LEDGE);                       // the third ledge
  carve(31,9,33,10,BRIDGE);carve(34,7,35,11,SNOW);put(furniture,35,7,CLIFF); // a rope bridge to a pillar of rock
  fill(furniture,34,7,35,7,0);
  carve(24,1,27,10,STAIR);carve(24,0,27,0,STAIR);// up to the hold
  for(const [x,y] of [[8,34],[21,35],[12,24],[24,25],[10,11],[18,12],[2,21]]) put(furniture,x,y,BOULDER);
  for(const [x,y] of [[29,34],[6,25],[28,11]]) put(furniture,x,y,PINE);
  write('climb',m,[
    ['south',264,632],['from-rookery',264,600],['north',416,8],['from-hold',416,40],
    ['hornet-1',...at(14,34)],['hornet-2',...at(20,11)],['spider',...at(2,25)],['decoy-1',...at(18,24)],['decoy-2',...at(34,9)],['decoy-3',...at(12,11)],
    ['camp-climb',...at(26,24)],['bag',...at(35,9)],['summit',568,104],['from-summit',...at(34,10)],['wind-post',...at(16,35)],['forage-1',...at(3,22)],
  ]);
}

// The hold: a city up a cliff face, ranked by height. Ground-dwellers on the bottom tier, the market and the rookery above,
// and the house's gate at the top of the great stair. The cliff on the west is the only other way up.
{
  const m=grid(44,34,FLAGS);const {floor,furniture,put,fill,frame,carve}=m;
  frame(CLIFF);fill(furniture,0,0,43,14,CLIFF);
  // The house above, seen from below: walls, banners, and the gate.
  fill(furniture,6,12,37,14,TWALL);for(const x of [9,15,28,34]) put(furniture,x,13,BANNER);put(furniture,12,13,SLIT);put(furniture,31,13,SLIT);
  fill(furniture,20,13,23,14,GATE);
  // The middle tier: market, rookery tower, waystone.
  fill(floor,1,15,42,24,FLAGS);
  fill(furniture,1,25,42,25,TWALL);fill(furniture,7,25,10,25,0);fill(floor,7,25,10,25,STAIR);
  fill(furniture,34,16,40,18,NEST);fill(furniture,34,19,40,20,TWALL);put(furniture,37,20,0);put(floor,37,20,DOOR); // the rookery
  fill(furniture,12,17,16,18,ROOF);fill(furniture,12,19,16,19,TWALL);                                           // the magpie's shop
  for(const [x,y] of [[25,17],[29,22],[4,17]]) put(furniture,x,y,BRAZIER);
  put(furniture,19,21,STATUE);
  // The ground-dwellers' tier at the bottom.
  fill(floor,1,26,42,32,LEDGE);
  fill(furniture,26,27,32,28,ROOF);fill(furniture,26,29,32,29,TWALL);put(furniture,29,29,0);put(floor,29,29,DOOR); // the lodging house
  for(const [x,y] of [[4,30],[38,28],[14,31]]) put(furniture,x,y,BOULDER);
  fill(furniture,20,33,23,33,0);fill(floor,20,33,23,33,STAIR);
  // The cliff face on the west of the middle tier, which only a climber would try.
  put(floor,1,18,LEDGE);
  // East, through the wall, the Talon Ring.
  fill(furniture,43,22,43,23,0);fill(floor,43,22,43,23,STAIR);
  write('hold',m,[
    ['south',352,536],['from-climb',352,504],['great-stair',...at(21,15)],['from-hall',...at(21,16)],['cliff',...at(1,19)],['from-upper',...at(2,19)],
    ['duellist',...at(4,20)],['goshawk',...at(24,16)],['magpie',...at(14,20)],['pigeon',...at(6,21)],['wren',...at(30,23)],['sparrow',...at(12,29)],
    ['rookery',...at(37,21)],['courier',...at(35,22)],['letters',...at(39,21)],['statue',...at(19,22)],
    ['waystone',...at(26,21)],['from-waystone',...at(26,22)],['camp-hold',...at(33,31)],['lodging',...at(29,30)],['ring',696,368],['from-ring',...at(41,22)],
  ]);
}

// The upper tiers: the noble house's terraces, where only the hero climbs, hiding his mana past the falcons.
{
  const m=grid(36,26,FLAGS);const {floor,furniture,put,fill,frame}=m;
  frame(TWALL);
  // Terraces stepping up from the cliff top in the south-west to the house in the north-east.
  fill(furniture,1,16,22,16,TWALL);fill(furniture,8,16,9,16,0);fill(floor,8,16,9,16,STAIR);
  fill(furniture,12,8,34,8,TWALL);fill(furniture,26,8,27,8,0);fill(floor,26,8,27,8,STAIR);
  fill(furniture,1,1,11,7,ROOF);fill(furniture,1,8,11,8,TWALL);put(furniture,6,8,0);put(floor,6,8,DOOR); // the archive
  fill(furniture,28,1,34,4,ROOF);fill(furniture,28,5,34,5,TWALL);                                        // the lord's apartments
  for(const [x,y] of [[5,12],[14,12],[19,12],[24,20],[30,20],[17,4],[22,4]]) put(furniture,x,y,PILLAR);
  for(const [x,y] of [[13,10],[20,10],[16,2]]) put(furniture,x,y,STATUE);
  for(const x of [3,10,15,20,25,30]) put(furniture,x,0,BANNER);
  put(furniture,33,12,LEVER);
  fill(furniture,0,21,0,22,0);fill(floor,0,21,0,22,LEDGE);
  write('upper',m,[
    ['down',8,344],['from-hold',24,344],['archive-door',...at(6,9)],['from-archive',...at(6,10)],['lever',...at(33,13)],
    ['sentry-1',...at(12,20)],['sentry-2',...at(26,13)],['sentry-3',...at(14,6)],['sentry-4',...at(30,18)],
    ['gallery',...at(20,11)],['balcony',...at(24,3)],
  ]);
}

// The archive: every letter the rookeries ever carried, copied.
{
  const m=grid(24,16,BOARDS);const {floor,furniture,put,fill,frame}=m;
  frame(TWALL);
  for(const y of [2,5,8,11]) {fill(furniture,2,y,9,y,LETTERS);fill(furniture,14,y,21,y,LETTERS);}
  put(furniture,11,2,BRAZIER);
  put(furniture,11,15,0);put(floor,11,15,DOOR);put(furniture,12,15,0);put(floor,12,15,DOOR);
  write('archive',m,[
    ['out',...at(11,15)],['spawn',...at(11,13)],['order',...at(5,9)],['feast-copy',...at(18,6)],['shelves',...at(6,3)],['clerk',...at(17,12)],['inquisitor',...at(14,13)],
  ]);
}

// The lord's hall, at the top of the great stair.
{
  const m=grid(26,18,CARPET);const {floor,furniture,put,fill,frame}=m;
  frame(TWALL);fill(floor,1,1,24,16,FLAGS);fill(floor,10,2,15,16,CARPET);
  put(furniture,12,2,CHAIR);put(furniture,13,2,CHAIR);
  for(const y of [5,9,13]) {put(furniture,6,y,PILLAR);put(furniture,19,y,PILLAR);}
  for(const x of [3,8,17,22]) put(furniture,x,0,BANNER);
  put(furniture,4,2,BRAZIER);put(furniture,21,2,BRAZIER);
  put(furniture,12,17,0);put(floor,12,17,DOOR);put(furniture,13,17,0);put(floor,13,17,DOOR);
  // A door in the west wall, down to the cellars.
  put(furniture,0,13,0);put(floor,0,13,DOOR);
  write('hall-of-house',m,[
    ['out',...at(12,17)],['spawn',...at(12,15)],['cellar',8,216],['from-cellar',...at(1,13)],['lord',...at(12,5)],['den',...at(12,5)],['portraits',...at(3,8)],['eggshell',...at(22,8)],
  ]);
}

// The cellars under the lord's hall: cells cut in the rock, where the house kept what it didn't want to look at.
{
  const m=grid(30,20,BOARDS);const {floor,furniture,put,fill,frame,carve}=m;
  fill(furniture,0,0,29,19,CLIFF);
  carve(1,8,28,11,FLAGS);                         // the long passage
  carve(28,9,29,10,STAIR);                        // up to the hall, at the east end
  carve(3,2,8,7,FLAGS);carve(5,7,6,7,FLAGS);      // the lord's cell
  carve(12,2,17,7,FLAGS);carve(14,7,15,7,FLAGS);  // the servants' cell
  carve(20,12,26,17,FLAGS);carve(22,12,23,12,FLAGS); // the store, gone dark
  carve(2,12,9,17,FLAGS);carve(5,12,6,12,FLAGS);  // the old wine cellar
  fill(furniture,5,7,6,7,GATE);fill(furniture,14,7,15,7,GATE);
  for(const [x,y] of [[4,13],[8,16],[24,16]]) put(furniture,x,y,BOULDER);
  for(const [x,y] of [[10,9],[19,10]]) put(furniture,x,y,BRAZIER);
  write('cellars',m,[
    ['up',472,152],['from-hall',...at(27,9)],['lord-cell',...at(5,8)],['lord',...at(5,4)],['servant-cell',...at(14,8)],['son',...at(14,4)],
    ['cricket-1',...at(16,10)],['cricket-2',...at(23,15)],['spider',...at(5,15)],['wine',...at(3,13)],['store',...at(25,13)],
  ]);
}

// The old eyrie on the peak, past the rope bridge: where the first couriers flew from, and where the lost flight froze.
{
  const m=grid(30,24,SNOW);const {floor,furniture,put,fill,frame,carve}=m;
  fill(furniture,0,0,29,23,CLIFF);
  carve(1,17,6,22,LEDGE);fill(furniture,0,20,0,21,0);fill(floor,0,20,0,21,LEDGE);   // in from the bridge pillar
  carve(5,10,7,18,STAIR);
  carve(6,3,26,11,SNOW);
  fill(furniture,18,3,25,6,NEST);fill(furniture,20,7,23,7,NEST);put(furniture,21,7,0);put(floor,21,7,DOOR); // the eyrie
  for(const [x,y] of [[9,5],[13,8],[24,10],[10,10]]) put(furniture,x,y,BOULDER);
  for(const [x,y] of [[8,4],[15,4],[11,7]]) put(furniture,x,y,PERCH);
  write('summit',m,[
    ['down',8,328],['from-climb',...at(2,20)],['hermit',...at(21,8)],['eyrie',...at(22,8)],['flight',...at(13,6)],['perches',...at(15,5)],['oldest',...at(19,8)],
  ]);
}

// The Talon Ring: a fighting pit cut into the cliff, ringed with stands, where ground-dwellers fight for the houses.
{
  const m=grid(26,20,SNOW);const {floor,furniture,put,fill,frame}=m;
  frame(TWALL);
  // The stands all round, banners above the house seats.
  fill(furniture,1,1,24,2,PERCH);fill(furniture,1,1,2,18,PERCH);fill(furniture,23,1,24,18,PERCH);
  for(const x of [5,10,15,20]) put(furniture,x,0,BANNER);
  // The pit: a ring of pillars, the sand inside.
  for(const [x,y] of [[6,5],[19,5],[6,14],[19,14],[12,4],[13,4]]) put(furniture,x,y,PILLAR);
  fill(floor,7,6,18,13,LEDGE);
  // In from the hold on the west, under the stands.
  fill(furniture,0,15,2,16,0);fill(floor,0,15,2,16,STAIR);
  put(furniture,4,16,BRAZIER);put(furniture,21,16,BRAZIER);
  write('ring',m,[
    ['out',8,248],['from-hold',...at(3,15)],['ringmaster',...at(12,16)],['board',...at(9,16)],['crowd',...at(16,4)],['thorns',...at(4,12)],['bettor',...at(18,16)],
  ]);
}
