// Rebuild the placeholder marsh tileset and the river-and-marsh region: the causeway, the stilt town of Wickmere,
// its church hospice, the far bank with the spoiled stores, and the flooded apothecary.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const tree = (leaf,dark,ground) => rect(0,0,16,16,ground)+rect(1,1,14,11,dark)+rect(3,2,9,6,leaf)+rect(7,11,3,5,'#3a2e22');
const WATER_BG = '#101a1c';
const tiles = [
  rect(0,0,16,16,'#3e4a34')+rect(3,4,1,3,'#52603a')+rect(11,10,1,3,'#52603a')+rect(7,13,2,1,'#323c28'),        // 0 marsh grass
  rect(0,0,16,16,'#3e3426')+rect(2,4,4,1,'#4e4230')+rect(9,11,5,1,'#30281c')+rect(5,13,2,1,'#4e4230'),          // 1 mud
  rect(0,0,16,16,WATER_BG)+rect(0,2,16,12,'#54422e')+[1,5,9,13].map(x=>rect(x,2,1,12,'#3a2e20')).join(''),     // 2 boardwalk
  rect(0,0,16,16,WATER_BG)+rect(2,4,5,1,'#1c2a2a')+rect(9,11,5,1,'#1c2a2a'),                                    // 3 black water
  rect(0,0,16,16,WATER_BG)+[1,4,7,10,13].map((x,i)=>rect(x,1+i%3,2,15-i%3,'#4e5e34')).join('')+rect(4,0,1,3,'#7a6a40'), // 4 reeds
  tree('#3e5030','#2e3c24','#3e4a34')+rect(1,10,1,5,'#3e5030')+rect(13,10,1,5,'#3e5030'),                    // 5 willow
  tree('#26342a','#1c281e','#2e3626'),                                                                           // 6 border trees
  rect(0,0,16,16,'#5a4832')+[0,4,8,12].map(y=>rect(0,y,16,1,'#46382a')).join('')+rect(5,1,1,2,'#6a5840'),     // 7 deck
  rect(0,0,16,16,'#5e5444')+[3,8,13].map(x=>rect(x,0,1,16,'#4a4234')).join('')+rect(0,14,16,2,'#2e2a22'),     // 8 stilt-house wall
  rect(0,0,16,16,'#4a3a2c')+[2,6,10,14].map(y=>rect(0,y,16,2,'#3a2c20')).join(''),                             // 9 thatch roof
  rect(0,0,16,16,'#4a4038')+rect(3,3,10,10,'#2a221c')+rect(5,0,2,4,'#8a8a80')+rect(9,1,2,3,'#6a6a62'),          // 10 smokehouse
  rect(0,0,16,16,'#8a8a7e')+rect(0,5,16,1,'#6e6e64')+rect(0,11,16,1,'#6e6e64')+rect(7,0,1,5,'#6e6e64')+rect(3,6,1,5,'#6e6e64'), // 11 hospice wall
  rect(0,0,16,16,'#5a4832')+rect(3,1,10,15,'#3a2a1c')+rect(4,2,8,13,'#4a3624')+rect(10,8,1,1,'#b89a5a'),       // 12 door
  rect(0,0,16,16,'#3e3a32')+rect(1,3,14,11,'#6a5636')+rect(1,8,14,1,'#4a3c26')+rect(7,3,1,11,'#4a3c26'),        // 13 crates
  rect(0,0,16,16,'#3e3a32')+rect(1,3,14,11,'#6a5636')+rect(3,6,10,4,'#c8c0a0')+rect(4,7,8,1,'#2a2a2a')+rect(4,9,5,1,'#2a2a2a'), // 14 crate marked for the lighthouse
  rect(0,0,16,16,'#3e3a32')+rect(2,4,12,10,'#6a6a4a')+rect(4,2,8,3,'#5a5a3e')+rect(5,8,3,2,'#4a5a2a')+rect(9,10,3,2,'#3a4a22'), // 15 spoiled sack
  rect(0,0,16,16,'#3a3028')+rect(0,2,16,2,'#5a4632')+rect(0,9,16,2,'#5a4632')+[2,6,11].map(x=>rect(x,4,3,5,'#6a8a7a')).join('')+[3,9,13].map(x=>rect(x,11,2,4,'#8a6a4a')).join(''), // 16 jar shelves
  rect(0,0,16,16,'#2a3436')+rect(0,4,16,10,'#5a4632')+rect(0,4,16,2,'#6e583e'),                                // 17 counter, in water
  rect(0,0,16,16,'#22343a')+rect(2,4,5,1,'#2e464c')+rect(9,11,5,1,'#2e464c')+rect(5,8,3,1,'#3a3022'),           // 18 flooded floor
  rect(0,0,16,16,'#4a3e30')+[0,8].map(y=>rect(0,y,16,1,'#3a3024')).join('')+rect(5,0,1,8,'#3a3024')+rect(11,8,1,8,'#3a3024'), // 19 floorboards
  rect(0,0,16,16,'#4a3e30')+rect(1,3,14,11,'#6a5a46')+rect(2,4,12,4,'#a8a090')+rect(2,8,12,5,'#7a8a8a'),       // 20 cot
  rect(0,0,16,16,'#4a3e30')+[1,5,9,13].map(x=>rect(x,0,2,16,'#5a5a56')).join('')+rect(0,7,16,2,'#4a4a46'),      // 21 grate
  rect(0,0,16,16,WATER_BG)+[1,4,7,10,13].map((x,i)=>rect(x,1+i%3,2,15-i%3,'#4e5e34')).join('')+[[3,5],[9,3],[6,10],[11,9]].map(([x,y])=>rect(x,y,3,3,'#b8b48a')).join(''), // 22 egg-laden reeds
  rect(0,0,16,16,WATER_BG)+rect(6,2,4,14,'#4a3a28')+rect(5,1,6,2,'#5a4a34')+rect(4,9,8,1,'#8a7a5a'),          // 23 mooring post
  rect(0,0,16,16,WATER_BG)+rect(1,4,14,9,'#4a3a28')+rect(2,5,12,6,'#6a5236')+rect(3,7,10,2,'#3a2e20'),         // 24 boat
  rect(0,0,16,16,'#3e3a36')+rect(0,5,16,1,'#2e2a26')+rect(0,11,16,1,'#2e2a26')+rect(6,0,1,5,'#2e2a26')+rect(11,6,1,5,'#2e2a26'), // 25 cellar wall
  rect(0,0,16,16,'#5a4832')+rect(7,2,2,14,'#3a3028')+rect(5,1,6,3,'#2a2420')+rect(6,2,4,1,'#e0a850'),          // 26 lantern post
  rect(0,0,16,16,'#4a3e30')+rect(2,2,12,12,'#5a5a56')+rect(4,4,8,8,'#2a2a28')+rect(6,6,4,4,'#3a4a4a'),          // 27 hospice basin
];
const svg = tiles.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
writeFileSync('public/assets/marsh-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="64" shape-rendering="crispEdges">${svg}</svg>\n`);
const [GRASS,MUD,WALK,WATER,REEDS,WILLOW,BORDER,DECK,HWALL,ROOF,SMOKE,HOSPICE,DOOR,CRATES,LIGHTHOUSE,SACK,SHELVES,COUNTER,FLOOD,BOARDS,COT,GRATE,EGGS,POST,BOAT,CELLAR,LANTERN,BASIN]=tiles.map((_,i)=>i+1);
// Collides lists 0-based tile ids.
const solid=[3,4,5,6,8,9,10,11,13,14,15,16,17,20,21,22,23,24,25,26,27];

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
    tilesets:[{firstgid:1,name:'marsh',image:'../assets/marsh-tiles.svg',imagewidth:128,imageheight:64,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:32,
      tiles:solid.map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
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
  write('causeway',m,[
    ['upriver',...at(3,3)],['from-weir',...at(4,4)],['east',760,488],['from-wickmere',...at(45,29)],
    ['fisher',...at(21,17)],['bones',...at(23,18)],['camp-causeway',...at(9,20)],['forage-1',...at(7,23)],['forage-2',...at(37,25)],
    ['mosquito-1',...at(15,18)],['mosquito-2',...at(24,21)],['mosquito-3',...at(30,27)],['scorpion-1',...at(35,26)],['scorpion-2',...at(40,29)],
    ['brood',...at(39,11)],['nest',...at(41,12)],['causeway-sign',...at(5,11)],['causeway-spot',...at(13,12)],
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
  write('wickmere',m,[
    ['west',8,264],['from-causeway',...at(2,16)],['channel',...at(36,16)],['from-far-bank',...at(35,17)],
    ['hospice-door',...at(34,8)],['from-hospice',...at(34,9)],
    ['magistrate',...at(24,14)],['cage',...at(26,14)],['newt',...at(26,14)],['ferryman',...at(36,18)],
    ['smoker',...at(16,26)],['herbalist',...at(12,9)],['widow',...at(29,8)],['child',...at(10,29)],['mourner',...at(30,28)],
    ['waystone',...at(18,17)],['from-waystone',...at(18,18)],['camp-wickmere',...at(9,19)],['wickmere-spot',...at(21,23)],
    ['notice',...at(20,13)],['barrels',...at(33,22)],['south',176,536],['from-harbour',176,500],
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
  for(const [x,y] of [[7,8],[14,18],[20,24],[27,18],[38,14]]) put(furniture,x,y,REEDS);
  write('far-bank',m,[
    ['ferry',...at(2,14)],['from-wickmere',...at(4,15)],
    ['store-gate',...at(20,15)],['apprentice',...at(20,7)],['manifest',...at(23,9)],['vial',...at(16,9)],
    ['apothecary-door',...at(34,21)],['from-apothecary',...at(34,22)],
    ['mosquito-1',...at(9,18)],['scorpion-1',...at(26,22)],['mosquito-2',...at(34,8)],['forage-1',...at(8,24)],
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
