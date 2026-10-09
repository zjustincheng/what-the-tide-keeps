// Rebuild the placeholder fen tileset and the fen upstream of the mill, over the drowned hamlet.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const tree = (leaf,dark,ground) => rect(0,0,16,16,ground)+rect(1,1,14,11,dark)+rect(3,2,9,6,leaf)+rect(7,11,3,5,'#3a2e22');
const tiles = [
  rect(0,0,16,16,'#4a5236')+rect(3,4,1,3,'#5e6a40')+rect(11,10,1,3,'#5e6a40')+rect(7,13,2,1,'#3a4228'),  // 0 marsh grass
  rect(0,0,16,16,'#4a3e2c')+rect(2,4,4,1,'#5a4c36')+rect(9,11,5,1,'#3a3022')+rect(5,13,2,1,'#5a4c36'),     // 1 mud
  rect(0,0,16,16,'#1a2426')+rect(0,2,16,12,'#5a4630')+[1,5,9,13].map(x=>rect(x,2,1,12,'#3e3022')).join(''), // 2 boardwalk
  rect(0,0,16,16,'#121c1e')+rect(2,4,5,1,'#22302e')+rect(9,11,5,1,'#22302e'),                              // 3 black water
  rect(0,0,16,16,'#121c1e')+[1,4,7,10,13].map((x,i)=>rect(x,1+i%3,2,15-i%3,'#5a6a3a')).join('')+rect(4,0,1,3,'#8a7a4a')+rect(10,1,1,3,'#8a7a4a'), // 4 reeds
  tree('#4a5a36','#36442a','#4a5236')+rect(1,10,1,5,'#4a5a36')+rect(13,10,1,5,'#4a5a36'),                 // 5 willow
  rect(0,0,16,16,'#121c1e')+rect(1,3,14,10,'#4a4028')+[4,7,10].map(y=>rect(1,y,14,1,'#3a3220')).join('')+rect(0,13,16,3,'#22302e'), // 6 drowned roof
  rect(0,0,16,16,'#121c1e')+rect(2,4,12,9,'#5a5a50')+rect(3,5,4,3,'#6a6a5e')+rect(0,12,16,4,'#22302e'),  // 7 drowned wall
  rect(0,0,16,16,'#4e4e46')+rect(0,5,16,1,'#36362f')+rect(0,11,16,1,'#36362f')+rect(6,0,1,5,'#36362f')+rect(11,6,1,5,'#36362f'), // 8 chapel wall
  rect(0,0,16,16,'#2e3a38')+rect(0,0,7,7,'#36423e')+rect(8,8,8,8,'#36423e')+rect(3,12,6,1,'#46524c'),     // 9 flooded chapel floor
  rect(0,0,16,16,'#2a4448')+rect(1,1,14,14,'#5a4630')+rect(1,5,14,1,'#3a2e20')+rect(1,10,14,1,'#3a2e20')+rect(6,0,4,4,'#6a6a62'), // 10 sluice gate
  tree('#2e3e28','#222e1e','#3a4428'),                                                                    // 11 border trees
  rect(0,0,16,16,'#121c1e')+rect(7,5,2,11,'#4a3a28')+rect(1,2,12,5,'#6a5838')+rect(2,3,10,1,'#8a7448')+rect(0,12,16,4,'#22302e'), // 12 sunken sign
  rect(0,0,16,16,'#2a4a50')+rect(2,4,5,1,'#3e6068')+rect(9,10,5,1,'#3e6068'),                             // 13 stream
  rect(0,0,16,16,'#4a5236')+rect(7,4,2,12,'#3a3228')+rect(3,3,5,1,'#3a3228')+rect(9,6,5,1,'#3a3228')+rect(4,1,1,3,'#3a3228'), // 14 dead tree
  rect(0,0,16,16,'#4a5236')+rect(2,3,12,11,'#6a5a3a')+rect(3,4,10,2,'#8a7a4a')+rect(4,9,8,1,'#4a3a28'),   // 15 eel traps
  rect(0,0,16,16,'#4a5236')+rect(1,7,14,8,'#5a4a38')+rect(3,4,10,4,'#6a5a44')+rect(6,10,4,5,'#2a2018'),   // 16 lean-to
  rect(0,0,16,16,'#2a4a50')+[1,5,9,13].map(x=>rect(x,0,2,16,'#4a3a28')).join('')+rect(0,6,16,2,'#5a4630'),  // 17 weir stakes
  rect(0,0,16,16,'#6a6058')+rect(0,13,16,3,'#4a4038')+rect(0,4,16,1,'#5a5048')+rect(5,6,6,7,'#2a2420'),    // 18 toll hut wall
  rect(0,0,16,16,'#2a4a50')+rect(1,4,14,9,'#4a3a28')+rect(2,5,12,6,'#6a5236')+rect(3,7,10,2,'#3a2e20'),    // 19 boat
  rect(0,0,16,16,'#4a4a46')+[0,4,8,12].map((y,i)=>rect(1,y,14,4,['#6a6a62','#5e5e56','#525248','#46463e'][i])).join(''), // 20 rock stair
  rect(0,0,16,16,'#3a3a36')+rect(1,1,7,6,'#4a4a46')+rect(8,8,7,7,'#46463f')+rect(0,7,16,1,'#2a2a26'),     // 21 cliff
];
const svg = tiles.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
writeFileSync('public/assets/fen-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="48" shape-rendering="crispEdges">${svg}</svg>\n`);
const [GRASS,MUD,WALK,WATER,REEDS,WILLOW,ROOF,STUB,CHAPEL,CFLOOR,SLUICE,BORDER,SIGN,STREAM,DEAD,TRAPS,LEANTO,WEIR,TOLL,BOAT,STAIR,CLIFF]=tiles.map((_,i)=>i+1);
const solid=[3,4,5,6,7,8,10,11,12,13,14,15,16,17,18,19,21];

const w=56,h=40, floor=Array(w*h).fill(GRASS), furniture=Array(w*h).fill(0);
const put=(a,x,y,t)=>a[y*w+x]=t;
const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
const at=(x,y)=>[x*16+8,y*16+8];
fill(furniture,0,0,w-1,0,BORDER);fill(furniture,0,h-1,w-1,h-1,BORDER);fill(furniture,0,0,0,h-1,BORDER);fill(furniture,w-1,0,w-1,h-1,BORDER);
// The stream comes in from the south down a narrow wooded valley, past the sluice that holds the fen back from the mill.
fill(furniture,1,30,54,h-2,BORDER);fill(furniture,23,30,26,h-2,0);
fill(furniture,20,30,22,h-1,STREAM);fill(furniture,23,h-1,24,h-1,0);fill(floor,23,32,24,h-1,MUD);
fill(furniture,20,34,22,34,SLUICE);
// Above the sluice the water spreads into the fen.
fill(furniture,1,1,54,29,WATER);
// Islands of marsh ground, joined by boardwalks.
const land=(x0,y0,x1,y1)=>{fill(furniture,x0,y0,x1,y1,0);};
land(18,24,30,31);                                 // the landing above the sluice
land(36,12,52,20);                                 // the otter's hummock
land(30,2,44,8);                                   // the north meadow, with the willows
land(26,15,32,21);                                 // the middle island
land(2,2,13,9);                                    // the chapel island
// North out of the meadow, the path up to the weir.
fill(furniture,37,0,38,1,0);fill(floor,37,0,38,2,MUD);
// Boardwalks.
fill(furniture,24,22,25,23,0);fill(floor,24,22,25,23,WALK);
fill(furniture,26,21,27,22,0);
fill(furniture,33,17,35,18,0);fill(floor,33,17,35,18,WALK);
fill(furniture,28,9,29,14,0);fill(floor,28,9,29,14,WALK);fill(furniture,28,8,30,9,0);fill(floor,30,8,30,9,WALK);
// The causeway to the chapel lies under the water until the sluice is opened.
// Three tiles wide, so it can be walked without lining up to the pixel, and it meets the boardwalk squarely.
fill(furniture,14,7,25,9,0);fill(floor,14,7,25,9,MUD);fill(furniture,26,7,27,9,0);fill(floor,26,7,27,9,MUD);
// The drowned hamlet: roofs and wall stubs standing in the water.
for(const [x,y,t] of [[6,14,ROOF],[7,14,ROOF],[6,15,STUB],[7,15,STUB],[11,17,ROOF],[12,17,ROOF],[13,17,ROOF],[11,18,STUB],[13,18,STUB],[5,21,ROOF],[6,21,ROOF],[5,22,STUB],[15,12,ROOF],[16,12,ROOF],[16,13,STUB],[9,24,ROOF],[10,24,ROOF]]) put(furniture,x,y,t);
put(furniture,18,23,SIGN);
// The chapel, its floor under a hand of water, with the bell somewhere below.
fill(furniture,3,2,10,2,CHAPEL);fill(furniture,3,2,3,7,CHAPEL);fill(furniture,10,2,10,7,CHAPEL);fill(furniture,3,7,10,7,CHAPEL);fill(furniture,6,7,7,7,0);
fill(floor,4,3,9,6,CFLOOR);fill(floor,6,7,7,8,MUD);fill(floor,8,8,13,8,MUD);
// Reeds close off the otter's run until she shows you the way.
fill(furniture,45,9,52,11,0);fill(floor,45,9,52,10,WALK);
// Willows and reed beds on the dry ground; dead trees in the hamlet.
for(const [x,y] of [[32,3],[36,4],[41,3],[43,6],[19,26],[29,26],[38,19],[51,13],[3,9]]) put(furniture,x,y,WILLOW);
for(const [x,y] of [[8,19],[14,25],[4,18]]) put(furniture,x,y,DEAD);
for(const [x,y] of [[18,29],[30,30],[36,12],[52,19],[30,15],[26,18]]) put(furniture,x,y,REEDS);
put(furniture,43,14,LEANTO);put(furniture,40,16,TRAPS);
const points=[
  ['south',...at(23,39).map((v,i)=>i===0?v+8:v)],['from-fields',392,600],
  ['sluice',...at(23,34)],['hamlet-sign',...at(18,24)],
  ['otter',...at(44,16)],['traps',...at(40,17)],['fen-spot',...at(49,9)],
  ...[45,46,47,48,49,50,51,52].map((x,i)=>[`reeds-${i+1}`,...at(x,11)]),
  ['wisp-1',...at(34,5)],['wisp-2',...at(31,20)],
  ['drowned',...at(6,4)],['chapel-cache',...at(8,4)],['bell',...at(5,5)],
  // Each tile of the causeway is under water until the sluice opens.
  ...[7,8,9].flatMap(y=>Array.from({length:12},(_,i)=>[14+i,y])).map(([x,y],i)=>[`flood-${i+1}`,...at(x,y)]),
  ['willow-sign',...at(31,8)],['forage-1',...at(41,13)],['forage-2',...at(24,26)],['north',608,8],['from-weir',608,40],
];
const layer=(name,data,id)=>({id,name,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
  layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
  tilesets:[{firstgid:1,name:'fen',image:'../assets/fen-tiles.svg',imagewidth:128,imageheight:48,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:24,
    tiles:solid.map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
writeFileSync('public/maps/fen.json',JSON.stringify(map,null,2)+'\n');

// The weir: the church fishery across the river above the fen, the otters' holt, and the smugglers' stair up to the tarn.
{
  const W=40,Hh=32, floor=Array(W*Hh).fill(GRASS), furniture=Array(W*Hh).fill(0);
  const put=(a,x,y,t)=>a[y*W+x]=t;
  const fill=(a,x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(a,x,y,t);};
  const at=(x,y)=>[x*16+8,y*16+8];
  fill(furniture,0,0,W-1,0,BORDER);fill(furniture,0,Hh-1,W-1,Hh-1,BORDER);fill(furniture,0,0,0,Hh-1,BORDER);fill(furniture,W-1,0,W-1,Hh-1,BORDER);
  // Cliffs to the north, with the smugglers' stair cut into them on the west bank.
  fill(furniture,1,1,38,3,CLIFF);fill(furniture,7,0,8,3,0);fill(floor,7,0,8,3,STAIR);
  // The river comes down the middle; the weir and its walkway are the only crossing.
  fill(furniture,17,1,22,30,STREAM);fill(furniture,17,14,22,14,WEIR);fill(furniture,12,15,27,15,0);fill(floor,12,15,27,15,WALK);fill(furniture,17,15,22,15,0);
  // The way in from the fen, on the west bank.
  fill(furniture,14,31,15,31,0);fill(floor,14,24,15,31,MUD);
  // The toll hut on the east bank, and the fishing stand below it.
  fill(furniture,26,9,31,12,TOLL);fill(floor,23,16,38,30,GRASS);fill(floor,23,19,25,21,WALK);
  // The otters' holt on the west bank: reeds, a bank of mud, their traps.
  fill(floor,2,16,10,23,MUD);for(const [x,y] of [[2,16],[3,16],[10,17],[2,22],[9,23]]) put(furniture,x,y,REEDS);put(furniture,5,18,LEANTO);put(furniture,8,20,TRAPS);
  // The smuggler's boat, pulled up on the west bank below the weir.
  fill(furniture,15,25,16,26,0);put(furniture,16,25,BOAT);put(furniture,16,26,BOAT);
  for(const [x,y] of [[4,6],[12,8],[29,5],[35,8],[33,26],[5,27],[27,27],[37,18]]) put(furniture,x,y,WILLOW);
  for(const [x,y] of [[11,11],[14,5],[25,24],[30,22]]) put(furniture,x,y,DEAD);
  put(furniture,24,13,SIGN);
  const points=[
    ['south',248,504],['from-fen',248,480],['stair',128,8],['from-tarn',128,72],
    ['warden',...at(28,13)],['weir-sign',...at(24,14)],['cage',...at(19,14)],['brother',...at(19,14)],
    ['elder',...at(6,19)],['kin',...at(4,21)],['holt-traps',...at(8,21)],
    ['smuggler',...at(14,25)],['ferry',...at(14,27)],['waystone',...at(34,14)],['from-waystone',...at(34,15)],['forage-1',...at(30,20)],['forage-2',...at(4,13)],['weir-spot',...at(24,22)],
    ['wisp-1',...at(32,24)],['wisp-2',...at(6,10)],['drowned-1',...at(11,7)],
  ];
  const layer=(name,data,id)=>({id,name,type:'tilelayer',width:W,height:Hh,x:0,y:0,opacity:1,visible:true,data});
  const map={compressionlevel:-1,width:W,height:Hh,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
    layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
    tilesets:[{firstgid:1,name:'fen',image:'../assets/fen-tiles.svg',imagewidth:128,imageheight:48,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:24,
      tiles:solid.map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
  writeFileSync('public/maps/weir.json',JSON.stringify(map,null,2)+'\n');
}
