// Rebuild the placeholder marsh tileset and the river-and-marsh region: the causeway, the stilt town of Wickmere,
// its church hospice, the far bank with the spoiled stores, and the flooded apothecary.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
import { ellipse, rect as krect, rows, scatter, sheet, stairs, vary, crumble, gap, tileProps } from './tile-kit.mjs';
import { blocks, boulder, planks, shadow, tree as drawTree, turf, water } from './tile-art.mjs';
const rect = (x,y,w,h,c,o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o===undefined?'':` fill-opacity="${o}"`}/>`;
// The marsh, lit dimly from the upper left through fog: sodden grass, black water, tarred boards.
const tree = (leaf,dark,light,ground) => drawTree({ ground, leaf, dark, light, trunk:'#3a2e22', trunkDark:'#261e16' });
const blackWater = () => water('#101a1c','#1c2a2a','#34484a','#0a1214');
const marshGrass = () => turf('#3e4a34','#52603a','#323c28');
const deck = () => rect(0,0,16,16,'#46382a')+[0,4,8,12].map((y,i)=>rect(0,y,16,3,'#5a4832')+rect(0,y,16,1,'#6e5a40')+rect([5,11,3,13][i],y,1,3,'#46382a')).join('');
const boards = () => rect(0,0,16,16,'#3a3024')+[0,8].map((y,i)=>rect(0,y,16,7,'#4a3e30')+rect(0,y,16,1,'#5e5040')+rect([5,11][i],y,1,7,'#3a3024')).join('');
const WATER_BG = '#101a1c';
const tiles = [
  marshGrass(), // 0 marsh grass
  rect(0,0,16,16,'#3e3426')+rect(2,4,4,1,'#4e4230')+rect(9,11,5,1,'#30281c')+rect(5,13,2,1,'#4e4230')+ellipse(11,5,2,1,'#262018')+rect(10,4,1,1,'#5e5444'), // 1 mud
  rect(0,0,16,16,WATER_BG)+planks(0,2,16,12,'#54422e','#6e5a40','#2e2418')+rect(0,2,16,1,'#7a6448')+rect(0,13,16,1,'#2e2418')+rect(0,14,16,2,'#000000',0.35), // 2 boardwalk
  blackWater(), // 3 black water
  blackWater()+[1,4,7,10,13].map((x,i)=>rect(x,1+i%3,2,15-i%3,'#3e4e2a')+rect(x,1+i%3,1,15-i%3,'#5a6a3a')).join('')+rect(4,0,1,3,'#7a6040')+rect(10,1,1,3,'#7a6040'), // 4 reeds
  tree('#3e5030','#2e3c24','#52663e','#3e4a34')+rect(1,9,1,6,'#3e5030')+rect(3,10,1,5,'#33422a')+rect(12,10,1,5,'#33422a')+rect(14,9,1,6,'#3e5030'), // 5 willow
  tree('#26342a','#1c281e','#34463a','#2e3626'), // 6 border trees
  deck(), // 7 deck
  rect(0,0,16,16,'#4a4234')+[0,4,8,12].map(x=>rect(x,0,3,14,'#5e5444')+rect(x,0,1,14,'#726650')).join('')+rect(0,14,16,2,'#2e2a22')+rect(0,13,16,1,'#000000',0.25), // 8 stilt-house wall
  rect(0,0,16,16,'#4a3a2c')+[1,4,6,9,12,14].map((x,i)=>rect(x,0,1,16,i%2?'#3a2c20':'#5e4a38')).join('')+[3,8,13].map(y=>rect(0,y,16,1,'#3a2c20',0.6)).join(''), // 9 thatch roof
  rect(0,0,16,16,'#3a3028')+rect(0,0,16,1,'#5a4e42')+rect(3,3,10,10,'#1e1812')+rect(3,3,10,1,'#3a3028')+rect(5,0,2,4,'#7a7a70')+rect(5,0,1,4,'#9a9a90')+rect(9,1,2,3,'#5a5a52')+ellipse(6,0,2,1,'#8a8a80',0.4)+rect(5,9,6,3,'#7a4a2a')+rect(6,10,4,1,'#b06a3a'), // 10 smokehouse
  blocks('#6e6e64','#8a8a7e','#a2a296','#76766c'), // 11 hospice wall
  rect(0,0,16,16,'#5a4832')+rect(3,1,10,15,'#2a1e14')+rect(4,2,8,13,'#4a3624')+[6,9].map(x=>rect(x,2,1,13,'#3a2a1c')).join('')+rect(4,2,8,1,'#000000',0.3)+rect(10,8,1,1,'#b89a5a'), // 12 door
  rect(0,0,16,16,'#3e3a32')+shadow(9,15,7,1)+rect(1,3,14,11,'#6a5636')+rect(1,3,14,1,'#86704a')+rect(1,3,1,11,'#86704a')+rect(14,4,1,10,'#4a3c26')+rect(1,8,14,1,'#4a3c26')+rect(7,3,1,11,'#4a3c26'), // 13 crates
  rect(0,0,16,16,'#3e3a32')+shadow(9,15,7,1)+rect(1,3,14,11,'#6a5636')+rect(1,3,14,1,'#86704a')+rect(14,4,1,10,'#4a3c26')+rect(3,6,10,4,'#c8c0a0')+rect(3,6,10,1,'#ddd6bc')+rect(4,7,8,1,'#2a2a2a')+rect(4,9,5,1,'#2a2a2a')+rect(11,8,1,1,'#7a3a2a'), // 14 crate marked for the lighthouse
  rect(0,0,16,16,'#3e3a32')+shadow(9,15,6,1)+ellipse(8,9,6,5.5,'#5a5a3e')+ellipse(7.5,8.5,5,4.5,'#6a6a4a')+rect(5,2,6,3,'#5a5a3e')+rect(5,8,3,2,'#4a5a2a')+rect(9,10,3,2,'#3a4a22')+rect(6,6,1,1,'#7a8a3a'), // 15 spoiled sack
  rect(0,0,16,16,'#2e261e')+rect(0,2,16,2,'#5a4632')+rect(0,2,16,1,'#76603e')+rect(0,9,16,2,'#5a4632')+rect(0,9,16,1,'#76603e')+[2,6,11].map(x=>rect(x,4,3,5,'#4a6a5a')+rect(x,4,1,5,'#8aaa9a')+rect(x,4,3,1,'#5a4632')).join('')+[3,9,13].map(x=>rect(x,11,2,4,'#7a5a3a')+rect(x,11,1,4,'#9a7a4a')).join(''), // 16 jar shelves
  rect(0,0,16,16,'#22343a')+rect(0,4,16,10,'#5a4632')+rect(0,4,16,2,'#6e583e')+rect(0,13,16,1,'#2e2418')+rect(0,14,16,2,'#000000',0.3)+rect(3,15,4,1,'#3a5054'), // 17 counter, in water
  water('#22343a','#2e464c','#5a7478','#1a2a30')+rect(5,8,3,1,'#3a3022')+rect(11,3,2,1,'#3a3022'), // 18 flooded floor
  boards(), // 19 floorboards
  boards()+shadow(9,15,7,1)+rect(1,3,14,11,'#5a4a36')+rect(1,3,14,1,'#7a6a52')+rect(2,4,12,4,'#a8a090')+rect(3,5,4,2,'#c0b8a8')+rect(2,8,12,5,'#6a7a7a')+rect(2,8,12,1,'#8a9a9a')+rect(13,9,1,4,'#4a5a5a'), // 20 cot
  boards()+rect(0,7,16,2,'#3a3a36')+rect(0,7,16,1,'#6a6a64')+[1,5,9,13].map(x=>rect(x,0,2,16,'#4a4a46')+rect(x,0,1,16,'#7a7a74')).join(''), // 21 grate
  blackWater()+[1,4,7,10,13].map((x,i)=>rect(x,1+i%3,2,15-i%3,'#3e4e2a')+rect(x,1+i%3,1,15-i%3,'#5a6a3a')).join('')+[[3,5],[9,3],[6,10],[11,9]].map(([x,y])=>ellipse(x+1.5,y+1.5,1.8,1.6,'#a8a47a')+rect(x+1,y+1,1,1,'#d8d4aa')).join(''), // 22 egg-laden reeds
  blackWater()+rect(6,2,4,14,'#4a3a28')+rect(6,2,1,14,'#5e4a34')+rect(5,1,6,2,'#5a4a34')+rect(5,1,6,1,'#6e5a42')+rect(4,9,8,1,'#8a7a5a')+rect(4,10,8,1,'#5a4a34')+rect(5,14,6,2,'#000000',0.3), // 23 mooring post
  blackWater()+ellipse(8,8.5,7.5,4.5,'#2e2418')+ellipse(8,8,6.5,3.5,'#5a4630')+ellipse(8,8,5,2.5,'#2e2418')+rect(4,8,8,1,'#6a5236')+rect(2,7,2,1,'#7a6040'), // 24 boat
  blocks('#2a2622','#3e3a36','#4a4642','#322e2a'), // 25 cellar wall
  deck()+ellipse(8,3,5,5,'#e0a850',0.12)+shadow(9,15,3,1)+rect(7,4,2,12,'#3a3028')+rect(7,4,1,12,'#4e4234')+rect(5,1,6,3,'#2a2420')+rect(6,2,4,1,'#e0a850')+rect(7,2,2,1,'#fff0b2'), // 26 lantern post
  boards()+shadow(9,14,7,1)+rect(2,2,12,12,'#5a5a56')+rect(2,2,12,1,'#7a7a74')+rect(4,4,8,8,'#2a2a28')+ellipse(8,8,3,3,'#3a4a4a')+rect(7,6,2,1,'#6a8a8a')+rect(13,3,1,11,'#3e3e3a'), // 27 hospice basin
];
// Variants of the marsh grass, and of the town decks: sedge and puddles; a patched board, a coil of rope.
const GRASS_VARIANTS = [tiles.length + 1, tiles.length + 2], DECK_VARIANTS = [tiles.length + 3];
tiles.push(
  scatter(tiles[0], 15, [['#52603a',1,3],['#323c28',2,1],['#5e6e40',1,2],['#b8b48a',1,1]], 8),
  scatter(tiles[0], 16, [['#28302a',3,2],['#2e3a3a',2,1],['#52603a',1,2]], 6),
  tiles[7] + krect(9,5,5,3,'#6a5840') + krect(9,5,5,1,'#7a6848') + krect(2,10,4,4,'#8a7a5a') + krect(3,11,2,2,'#5a4832'),
);
// The peat cuttings: cut banks of black peat, the floor of a working, stacked turves, and what the bog kept.
const PEAT_TILES = tiles.length + 1;
tiles.push(
  rect(0,0,16,16,'#221a12')+rect(0,0,16,3,'#3e3a24')+rect(0,0,16,1,'#52503a')+rect(0,3,16,1,'#120e0a')+[5,10,14].map(y=>rect(0,y,16,1,'#1a140e')+rect(0,y+1,16,1,'#2e241a')).join('')+rect(4,7,3,1,'#3a2c1e')+rect(10,12,2,1,'#3a2c1e'), // cut bank
  rect(0,0,16,16,'#3a2c1e')+rect(2,4,4,1,'#2a2016')+rect(9,10,5,1,'#2a2016')+rect(6,13,2,1,'#4a3a28')+rect(12,2,1,3,'#2e3a2a')+rect(13,1,1,2,'#3e4a34'),        // worked floor
  rect(0,0,16,16,'#3a2c1e')+[[1,9],[6,9],[11,9],[3,4],[8,4]].map(([x,y])=>rect(x,y,5,5,'#2a1e14')+rect(x,y,5,1,'#4a3826')+rect(x,y,1,5,'#3a2c1e')+rect(x+4,y+1,1,4,'#1a120c')).join('')+rect(5,1,5,3,'#2a1e14')+rect(5,1,5,1,'#4a3826'), // stacked turves
  rect(0,0,16,16,'#2a2a1e')+rect(1,1,14,14,'#1e2a26')+rect(1,1,14,1,'#141e1a')+rect(3,5,10,4,'#6a4e30')+rect(3,5,10,1,'#7a5e3a')+rect(4,4,3,2,'#7a5a38')+rect(11,6,2,1,'#4a3420')+rect(5,9,6,2,'#5a4028'), // a body in a cutting
);
// Parkour: a gap narrow enough to leap, and footing that won't hold for long.
const LEAP_TILES = tiles.length + 1;
tiles.push(tiles[3] + krect(0,0,16,16,'#000000',0.35) + krect(3,5,4,1,'#3a5a5a',0.6) + krect(9,11,4,1,'#3a5a5a',0.6), crumble({ top: '#6a5a40', crack: '#2a2018', under: '#0e1a1c' }));
const svg = sheet(tiles);
writeFileSync('public/assets/marsh-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows(tiles)*16}" shape-rendering="crispEdges">${svg}</svg>\n`);
// TILES_ONLY=1 redraws the tiles and leaves the maps alone: they have been edited by hand since this script made them.
if (process.env.TILES_ONLY) process.exit(0);
const [GRASS,MUD,WALK,WATER,REEDS,WILLOW,BORDER,DECK,HWALL,ROOF,SMOKE,HOSPICE,DOOR,CRATES,LIGHTHOUSE,SACK,SHELVES,COUNTER,FLOOD,BOARDS,COT,GRATE,EGGS,POST,BOAT,CELLAR,LANTERN,BASIN]=tiles.map((_,i)=>i+1);
// Collides lists 0-based tile ids.
const [CUTBANK,PEAT,TURVES,BOGBODY]=[0,1,2,3].map(i=>PEAT_TILES+i);
const solid=[3,4,5,6,8,9,10,11,13,14,15,16,17,20,21,22,23,24,25,26,27,CUTBANK-1,TURVES-1,BOGBODY-1];

function grid(W,H,ground){
  const floor=Array(W*H).fill(ground), furniture=Array(W*H).fill(0);
  const put=(a,x,y,t)=>{if(x>=0&&y>=0&&x<W&&y<H)a[y*W+x]=t;};
  const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
  const frame=t=>{fill(furniture,0,0,W-1,0,t);fill(furniture,0,H-1,W-1,H-1,t);fill(furniture,0,0,0,H-1,t);fill(furniture,W-1,0,W-1,H-1,t);};
  // Walkable planks over water: clear the water and lay the walk.
  const walk=(x0,y0,x1,y1,t=WALK)=>{fill(furniture,x0,y0,x1,y1,0);fill(floor,x0,y0,x1,y1,t);};
  return {W,H,floor,furniture,put,fill,frame,walk};
}
const at=(x,y)=>[x*16+8,y*16+8];
function write(name,{W,H,floor,furniture},points){
  const layer=(lname,data,id)=>({id,name:lname,type:'tilelayer',width:W,height:H,x:0,y:0,opacity:1,visible:true,data});
  const map={compressionlevel:-1,width:W,height:H,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
    layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([pname,x,y],i)=>({id:i+1,name:pname,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
    tilesets:[{firstgid:1,name:'marsh',image:'../assets/marsh-tiles.svg',imagewidth:128,imageheight:rows(tiles)*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows(tiles)*8,
      tiles:tileProps(solid,[LEAP_TILES-1],[LEAP_TILES])}]};
  vary(floor,W,1,GRASS_VARIANTS,name.length*7);vary(floor,W,8,DECK_VARIANTS,name.length*11,0.15);
  writeFileSync(`public/maps/${name}.json`,JSON.stringify(map,null,2)+'\n');
}

// The causeway: the ferry lands you on a jetty in the north-west; boardwalks wind south-east through the fog to Wickmere.
// The reed beds to the north-east are where the mosquitoes breed.
{
  const m=grid(48,36,GRASS);const {floor,furniture,put,fill,frame,walk}=m;
  fill(furniture,1,1,46,34,WATER);frame(BORDER);
  const land=(x0,y0,x1,y1,t=GRASS)=>{fill(furniture,x0,y0,x1,y1,0);fill(floor,x0,y0,x1,y1,t);};
  // The jetty and the landing island.
  land(2,2,9,8);walk(3,9,4,12,WALK);put(furniture,2,2,BORDER);
  fill(furniture,10,4,12,4,0);fill(floor,10,4,12,4,WALK);put(furniture,12,5,BOAT);put(furniture,10,5,POST);
  // The long boardwalk south and east.
  walk(3,12,16,13);walk(15,13,16,22);walk(15,21,30,22);walk(29,22,30,30);walk(29,29,46,30);
  // Islands along the way.
  land(18,15,25,19,MUD);walk(17,16,17,17);         // the drowned fisher's island, beside the walk
  land(6,17,12,24);walk(9,14,10,16);                // the fisher's platform, with a fire
  land(32,24,39,27,MUD);walk(31,25,31,26);          // the scorpions' mudbank
  land(33,8,44,15,MUD);walk(31,13,32,14);walk(26,14,30,14);walk(25,14,26,15); // the reed beds, off the main walk
  for(const [x,y] of [[34,9],[36,9],[38,10],[41,9],[43,11],[43,13],[35,14],[39,8]]) put(furniture,x,y,EGGS);
  for(const [x,y] of [[13,8],[22,9],[24,25],[7,28],[40,20],[44,4],[2,30],[18,32]]) put(furniture,x,y,REEDS);
  for(const [x,y] of [[6,3],[8,7],[7,22],[11,19],[21,16],[37,26],[42,14]]) put(furniture,x,y,WILLOW);
  // East out to Wickmere.
  fill(furniture,47,29,47,30,0);fill(floor,47,29,47,30,WALK);
  // South from the mudbank, a smugglers' walk down to the creek.
  walk(35,28,36,35);
  write('causeway',m,[
    ['upriver',...at(3,3)],['from-weir',...at(4,4)],['east',760,488],['from-wickmere',...at(45,29)],
    ['fisher',...at(21,17)],['bones',...at(23,18)],['camp-causeway',...at(9,20)],['forage-1',...at(7,23)],['forage-2',...at(37,25)],
    ['mosquito-1',...at(15,18)],['mosquito-2',...at(24,21)],['mosquito-3',...at(30,27)],['scorpion-1',...at(35,26)],['scorpion-2',...at(40,29)],
    ['brood',...at(39,11)],['nest',...at(41,12)],['causeway-sign',...at(5,11)],['causeway-spot',...at(13,12)],['creek',584,568],['from-creek',...at(35,33)],
  ]);
}

// Wickmere: a stilt town where the river meets the tide. Decks over the water, the hospice on its own platform,
// the smokehouses, the magistrate's cage, the ferryman at the channel, and the far bank beyond it.
{
  const m=grid(44,34,GRASS);const {floor,furniture,put,fill,frame,walk}=m;
  fill(furniture,1,1,42,32,WATER);frame(BORDER);
  const deck=(x0,y0,x1,y1)=>walk(x0,y0,x1,y1,DECK);
  const house=(x0,y0,x1,y1,door)=>{fill(furniture,x0,y0,x1,y0+1,ROOF);fill(furniture,x0,y0+2,x1,y1,HWALL);if(door)put(furniture,door,y1,0),put(floor,door,y1,DOOR);};
  // The main deck runs east from the causeway walk, with decks branching north and south.
  walk(1,16,5,17);deck(6,12,36,21);
  deck(10,4,22,11);deck(26,3,38,11);deck(8,22,20,30);deck(24,22,34,29);
  // Houses on the decks.
  house(10,4,14,7,12);house(17,4,21,7,0);house(27,3,31,6,0);house(8,25,12,28,0);house(27,24,31,27,0);
  // The hospice on its own platform to the north-east, in pale stone.
  fill(furniture,32,3,37,7,HOSPICE);put(furniture,34,7,0);put(floor,34,7,DOOR);
  // Smokehouses on the south deck, the magistrate's cage on the main deck.
  put(furniture,15,24,SMOKE);put(furniture,17,24,SMOKE);put(furniture,15,27,SMOKE);
  for(const [x,y] of [[6,12],[20,12],[36,14],[6,21],[22,21],[36,21]]) put(furniture,x,y,LANTERN);
  for(const [x,y] of [[24,29],[34,23]]) put(furniture,x,y,CRATES);
  // The channel: deep, fast water east of the main deck. The ferryman's post, and the far bank past it.
  put(furniture,37,17,POST);put(furniture,38,15,BOAT);
  fill(furniture,40,15,42,18,0);fill(floor,40,15,42,18,MUD);fill(furniture,43,16,43,17,0);fill(floor,43,16,43,17,MUD);
  // South off the decks, the tidal road down the estuary to the capital's harbour.
  walk(10,31,11,33,MUD);
  // North up the old alley, to the rows the river took.
  fill(furniture,15,0,16,3,0);fill(floor,15,0,16,3,WALK);
  write('wickmere',m,[
    ['west',8,264],['from-causeway',...at(2,16)],['channel',...at(36,16)],['from-far-bank',...at(35,17)],
    ['hospice-door',...at(34,8)],['from-hospice',...at(34,9)],
    ['magistrate',...at(24,14)],['cage',...at(26,14)],['newt',...at(26,14)],['ferryman',...at(36,18)],
    ['smoker',...at(16,26)],['herbalist',...at(12,9)],['widow',...at(29,8)],['child',...at(10,29)],['mourner',...at(30,28)],
    ['waystone',...at(18,17)],['from-waystone',...at(18,18)],['camp-wickmere',...at(9,19)],['wickmere-spot',...at(21,23)],
    ['notice',...at(20,13)],['barrels',...at(33,22)],['south',176,536],['from-harbour',176,500],['mink',...at(14,15)],
    ['north',256,8],['from-rows',256,40],
  ]);
}

// The church hospice: a long ward of cots, a basin, the sister on guard, and the frog behind a grate.
{
  const m=grid(22,14,BOARDS);const {floor,furniture,put,fill,frame}=m;
  frame(HOSPICE);
  fill(furniture,1,1,20,1,HOSPICE);
  for(const x of [3,6,9,12,15]) {put(furniture,x,3,COT);put(furniture,x,7,COT);}
  put(furniture,18,3,BASIN);
  // The frog's cell at the east end.
  fill(furniture,17,6,17,12,GRATE);fill(furniture,17,6,20,6,HOSPICE);
  put(furniture,10,12,0);put(floor,10,12,DOOR);put(furniture,11,12,0);put(floor,11,12,DOOR);
  write('hospice',m,[
    ['out',...at(10,13)],['spawn',...at(10,11)],['sister',...at(14,10)],['frog',286,152],
    ['patient-1',...at(6,4)],['patient-2',...at(12,8)],['patient-3',...at(3,8)],['basin',...at(18,4)],['ward-book',...at(4,10)],
  ]);
}

// The far bank: the church storehouse, roof fallen in and its stores spoiled, and the flooded apothecary at the water's edge.
{
  const m=grid(40,30,MUD);const {floor,furniture,put,fill,frame,walk}=m;
  frame(BORDER);
  // The channel along the west edge, with the ferry landing.
  fill(furniture,1,1,4,28,WATER);walk(1,14,5,15);
  // The storehouse: a big ruin, its yard open, the cellar stair inside.
  fill(furniture,12,3,30,3,CELLAR);fill(furniture,12,14,30,14,CELLAR);fill(furniture,12,3,12,14,CELLAR);fill(furniture,30,3,30,14,CELLAR);
  fill(furniture,20,14,21,14,0);fill(floor,13,4,29,13,BOARDS);
  for(const [x,y] of [[14,5],[15,5],[16,5],[14,7],[15,9],[17,11],[22,5],[25,7],[27,5],[28,11],[24,11]]) put(furniture,x,y,SACK);
  for(const [x,y] of [[18,5],[19,5],[26,9],[27,9]]) put(furniture,x,y,CRATES);
  for(const [x,y] of [[22,8],[23,8],[22,9]]) put(furniture,x,y,LIGHTHOUSE);
  // The apothecary, sunk to its sills at the south-east edge, its door on the water.
  fill(furniture,30,20,38,20,HWALL);fill(furniture,30,18,38,19,ROOF);put(furniture,34,20,0);put(floor,34,20,DOOR);
  fill(furniture,30,21,38,28,WATER);walk(33,21,35,24);walk(30,24,35,24);
  for(const [x,y] of [[8,4],[6,20],[10,26],[16,22],[24,26],[36,10],[37,4],[9,12]]) put(furniture,x,y,WILLOW);
  // East along the bank to the church's pens.
  fill(furniture,39,15,39,16,0);
  for(const [x,y] of [[7,8],[14,18],[20,24],[27,18],[38,14]]) put(furniture,x,y,REEDS);
  // South, a cutters' track to the peat.
  fill(furniture,14,29,15,29,0);fill(floor,14,25,15,29,WALK);
  write('far-bank',m,[
    ['ferry',...at(2,14)],['from-wickmere',...at(4,15)],['pens',632,248],['from-pens',...at(37,15)],
    ['store-gate',...at(20,15)],['apprentice',...at(20,7)],['manifest',...at(23,9)],['vial',...at(16,9)],
    ['apothecary-door',...at(34,21)],['from-apothecary',...at(34,22)],
    ['mosquito-1',...at(9,18)],['scorpion-1',...at(26,22)],['mosquito-2',...at(34,8)],['forage-1',...at(8,24)],['south',240,472],['from-peat',240,440],
  ]);
}

// The flooded apothecary: shelves of jars over black water, a counter, and the viper's coils.
{
  const m=grid(24,16,FLOOD);const {floor,furniture,put,fill,frame}=m;
  frame(HWALL);
  fill(furniture,1,1,22,1,SHELVES);fill(furniture,1,1,1,14,SHELVES);fill(furniture,22,1,22,14,SHELVES);
  fill(furniture,7,4,16,4,COUNTER);
  for(const [x,y] of [[4,7],[19,7],[4,11],[19,11]]) put(furniture,x,y,SHELVES);
  put(furniture,11,15,0);put(floor,11,15,DOOR);put(furniture,12,15,0);put(floor,12,15,DOOR);
  write('apothecary',m,[
    ['out',...at(11,15)],['spawn',...at(11,13)],['viper',...at(11,6)],['den',...at(11,6)],['ledger',...at(8,3)],['cure',...at(15,3)],
  ]);
}

// The pens: the church's holding pens on stilts over the tidal flats, where the caught are kept until a boat comes.
{
  const m=grid(32,24,MUD);const {floor,furniture,put,fill,frame,walk}=m;
  fill(furniture,1,1,30,22,WATER);frame(BORDER);
  fill(furniture,0,11,0,12,0);fill(floor,0,11,0,12,WALK);walk(1,11,6,12);
  // The pen deck, with the gatehouse.
  walk(7,4,26,19,DECK);
  fill(furniture,9,5,13,8,HWALL);fill(furniture,9,5,13,6,ROOF);put(furniture,11,8,0);put(floor,11,8,DOOR);
  // Rows of cages.
  for(const x of [16,19,22,25]) {fill(furniture,x,5,x+1,6,GRATE);fill(furniture,x,15,x+1,16,GRATE);}
  for(const [x,y] of [[8,17],[14,18],[24,11]]) put(furniture,x,y,LANTERN);
  // The jetty out to where the boat ties up.
  walk(26,10,30,11);put(furniture,30,12,BOAT);put(furniture,29,9,POST);
  for(const [x,y] of [[14,10],[14,11]]) put(furniture,x,y,CRATES);
  write('pens',m,[
    ['west',8,192],['from-far-bank',...at(2,11)],['warder',...at(12,10)],['ledger',...at(11,9)],
    ['cages',...at(20,8)],['newt-boy',...at(19,6)],['adder',...at(25,15)],['old-pens',...at(16,14)],['jetty',...at(29,10)],
    ['mosquito-1',...at(21,12)],
  ]);
}

// The smugglers' creek: where the sea's boats come up the marsh by night with fish nobody stamped.
{
  const m=grid(30,26,GRASS);const {floor,furniture,put,fill,frame,walk}=m;
  frame(BORDER);
  fill(furniture,19,1,28,24,WATER);fill(furniture,12,14,28,24,WATER);
  fill(furniture,5,0,6,0,0);fill(floor,5,0,6,4,WALK);
  fill(floor,1,1,18,13,MUD);fill(floor,1,14,11,24,MUD);
  // The landing: a jetty into the creek, boats, crates under oilcloth, the seal's fire.
  walk(12,8,22,9);put(furniture,23,8,BOAT);put(furniture,23,10,BOAT);put(furniture,20,10,POST);
  for(const [x,y] of [[9,5],[10,5],[9,6],[14,4],[15,4]]) put(furniture,x,y,CRATES);
  for(const [x,y] of [[3,10],[7,18],[2,22],[16,2],[10,23]]) put(furniture,x,y,WILLOW);
  for(const [x,y] of [[11,12],[4,15],[9,20],[17,11]]) put(furniture,x,y,REEDS);
  write('creek',m,[
    ['north',88,8],['from-causeway',...at(5,2)],['seal',...at(12,6)],['camp-creek',...at(7,8)],['boats',...at(21,9)],['tally',...at(13,4)],
    ['scorpion-1',...at(6,17)],['wisp-1',...at(14,12)],['creek-spot',...at(11,16)],['forage-1',...at(3,13)],
  ]);
}

// The peat cuttings south of the far bank: black banks cut in steps, pools in the old workings, and the bodies the bog gives back.
{
  const m=grid(36,26,GRASS);const {floor,furniture,put,fill,frame,walk}=m;
  frame(BORDER);
  fill(furniture,17,0,18,0,0);walk(17,0,18,6);
  // Three workings, each a floor of cut peat below a bank, stepped down to the south.
  fill(floor,3,8,32,23,PEAT);
  fill(furniture,3,7,32,7,CUTBANK);fill(furniture,17,7,18,7,0);
  fill(furniture,3,13,14,13,CUTBANK);fill(furniture,20,13,32,13,CUTBANK);
  fill(furniture,3,19,9,19,CUTBANK);fill(furniture,13,19,32,19,CUTBANK);
  // Old workings, flooded black.
  fill(furniture,4,9,9,11,WATER);fill(furniture,25,15,31,17,WATER);fill(furniture,15,21,22,23,WATER);
  // Turves stacked to dry, and the cutters' hut at the top.
  for(const [x,y] of [[12,9],[13,9],[22,9],[23,10],[6,16],[7,16],[29,21],[30,21]]) put(furniture,x,y,TURVES);
  fill(furniture,24,2,30,3,ROOF);fill(furniture,24,4,30,5,HWALL);put(furniture,27,5,DOOR);
  // What the cutters found: they leave them where they lie, and put a stake by each.
  put(furniture,10,15,BOGBODY);put(furniture,23,18,BOGBODY);put(furniture,31,22,BOGBODY);
  for(const [x,y] of [[11,14],[24,17],[32,21]]) put(furniture,x,y,POST);
  for(const [x,y] of [[3,3],[8,2],[13,4],[33,9],[2,22],[34,16]]) put(furniture,x,y,WILLOW);
  for(const [x,y] of [[5,5],[20,3],[32,5],[3,17]]) put(furniture,x,y,REEDS);
  write('peat',m,[
    ['north',288,8],['from-far-bank',288,40],
    ['cutter',...at(21,5)],['camp-peat',...at(31,6)],['body-1',...at(10,16)],['body-2',...at(23,17)],['old-body',...at(31,23)],
    ['leech-1',...at(18,10)],['wisp-1',...at(27,11)],['mosquito-1',...at(11,21)],['peat-spot',...at(26,14)],['forage-1',...at(5,14)],
  ]);
}

// The sunken rows north of Wickmere: the first town, before the river moved. Rooftops and deck ends stand out of deep water;
// the channels between are narrow enough to leap, and some of the old boards have rotted to nothing.
{
  const m=grid(36,28,BOARDS);const {floor,furniture,put,fill,walk}=m;
  const FLOODED=LEAP_TILES, ROTTEN=LEAP_TILES+1;
  fill(furniture,0,0,35,27,WATER);
  // The landing from the south, and the first roof across a channel.
  walk(17,27,18,27,DECK);walk(14,21,21,26,DECK);
  fill(furniture,15,19,17,20,FLOODED);walk(13,14,19,18,BOARDS);
  // East along rotten boards to the counting house.
  for(let x=20;x<=25;x++){fill(furniture,x,16,x,16,0);put(floor,x,16,ROTTEN);}
  walk(26,12,31,19,BOARDS);put(furniture,31,12,CRATES);put(furniture,26,19,SACK);
  // North across a channel, then two chimney stacks, to the old church's belfry.
  fill(furniture,15,12,16,13,FLOODED);walk(12,7,18,11,BOARDS);
  fill(furniture,10,7,11,9,FLOODED);walk(9,8,9,8,BOARDS);fill(furniture,7,7,8,9,FLOODED);
  walk(2,4,6,10,BOARDS);put(furniture,2,4,HWALL);put(furniture,6,4,HWALL);put(furniture,4,10,LANTERN);
  for(const [x,y] of [[12,22],[22,25],[33,5],[2,20],[29,24]]) put(furniture,x,y,REEDS);
  write('rows',m,[
    ['south',288,440],['from-wickmere',288,408],
    ['register',...at(4,6)],['counting',...at(28,14)],['wisp-1',...at(29,17)],['rows-spot',...at(13,18)],['window',...at(16,9)],
  ]);
}
