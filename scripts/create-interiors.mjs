// Rebuild the placeholder interior tileset and the four building interiors: the inn, the reeve's hall, the mill, and the tannery.
// Each room sits in the middle of a dark map the size of the view. Edit the JSON in Tiled for content work; this script resets them.
import { writeFileSync } from 'node:fs';
import { ellipse, rect as krect, rows, scatter, sheet, stairs, vary } from './tile-kit.mjs';
const rect = (x,y,w,h,c,o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o===undefined?'':` fill-opacity="${o}"`}/>`;
// Inside, lit by windows and the fire from the upper left: every board, stone, and piece of furniture has its lit edge and its shadow.
const shadow = (cx,cy,rx,ry) => ellipse(cx,cy,rx,ry,'#000000',0.28);
// Boards running across the room, each with a lit top edge, grain, and the ends of boards staggered row to row.
const planks = (a,b) => rect(0,0,16,16,a)+[0,4,8,12].map((y,i)=>rect(0,y,16,1,'#ffffff',0.06)+rect(0,y+3,16,1,b)+rect([5,11,3,13][i],y,1,3,b)+rect([9,2,12,6][i],y+1,3,1,'#000000',0.12)).join('');
const FLAGS = [[0,0,7,7],[8,0,8,7],[0,8,4,8],[5,8,11,8]];
const flags = (a,b,c) => rect(0,0,16,16,c)+FLAGS.map(([x,y,w,h])=>rect(x,y,w-1,h-1,a)+rect(x,y,w-1,1,b)+rect(x,y,1,h-1,b)).join('');
const floorPlank = planks('#4a3828','#33261a');
const tiles = [
  rect(0,0,16,16,'#07090a'),                                                                                     // 0 void
  floorPlank,                                                                                                    // 1 plank floor
  flags('#43453f','#50534c','#2c2e2a'),                                                                          // 2 stone floor
  rect(0,0,16,16,'#5a4a38')+rect(0,0,16,1,'#6e5c46')+rect(0,4,16,1,'#4a3c2c')+rect(0,9,16,1,'#4a3c2c')+rect(7,0,1,4,'#4a3c2c')+rect(3,5,1,4,'#4a3c2c')+rect(12,5,1,4,'#4a3c2c')
    +rect(0,13,16,3,'#3a2e22')+rect(0,13,16,1,'#4f3f2e'),                                                       // 3 wall face
  rect(0,0,16,16,'#1c1712')+rect(0,0,16,2,'#2c241b')+rect(0,2,16,1,'#000000',0.3),                               // 4 wall top
  floorPlank+rect(2,9,12,6,'#5a2e22')+rect(3,10,10,4,'#7a4a34')+[4,7,10].map(x=>rect(x,10,1,4,'#8a5a40')).join('')+rect(2,14,12,1,'#000000',0.25), // 5 doormat
  floorPlank+shadow(9,15,7,1.2)+rect(1,1,14,14,'#3a2a1e')+rect(1,1,14,1,'#5a4430')+rect(2,2,12,4,'#c8c0aa')+rect(3,3,4,2,'#ddd6c2')+rect(2,6,12,8,'#5a4a6a')+rect(2,6,12,1,'#7a6a8a')+rect(2,10,12,1,'#4a3c5a')+rect(13,7,1,7,'#4a3c5a'), // 6 bed
  floorPlank+shadow(9,14.5,7,1.5)+rect(2,11,2,4,'#3a2a1e')+rect(12,11,2,4,'#3a2a1e')+rect(1,3,14,8,'#6a5036')+rect(1,3,14,2,'#8a6a46')+rect(1,10,14,1,'#4a3826')+rect(4,6,4,1,'#5a4430'), // 7 table
  floorPlank+shadow(9,14,4,1)+rect(5,10,1,4,'#3a2a1e')+rect(10,10,1,4,'#3a2a1e')+ellipse(8,8,3.5,2.5,'#6a5036')+ellipse(7.5,7.5,2.5,1.5,'#8a6a46'), // 8 stool
  floorPlank+shadow(9,14.5,6,1.5)+rect(4,2,8,13,'#6a5236')+rect(3,4,10,9,'#6a5236')+[6,9].map(x=>rect(x,3,1,11,'#5a4430')).join('')+rect(4,2,2,13,'#86683f')+rect(3,5,10,1,'#3c3326')+rect(3,11,10,1,'#3c3326'), // 9 barrel
  rect(0,0,16,16,'#1c1712')+rect(1,1,14,14,'#4a3828')+rect(1,1,14,1,'#5e4a36')+rect(1,5,14,1,'#2a2018')+rect(1,10,14,1,'#2a2018')
    +rect(2,2,2,3,'#8a7a5a')+rect(4,3,2,2,'#6a8a8a')+rect(7,2,1,3,'#7a4a3a')+rect(8,2,1,3,'#5a6a4a')+rect(9,3,3,2,'#c8b888')+rect(3,7,3,3,'#6a7a6a')+rect(3,7,3,1,'#8a9a8a')+rect(9,6,4,4,'#8a6a4a')+rect(4,11,6,3,'#7a5a4a')+rect(11,12,2,2,'#c8c0aa'), // 10 shelf
  rect(0,0,16,16,'#2c2a26')+rect(1,2,14,14,'#4a4842')+[[1,2,5,4],[7,2,8,4],[1,7,3,4],[12,7,3,4]].map(([x,y,w,h])=>rect(x,y,w-1,1,'#5e5c55')).join('')
    +ellipse(8,11.5,5,4.5,'#1a1410')+rect(3,12,10,4,'#1a1410')+rect(4,13,8,2,'#5a3020')+ellipse(8,12,3,3,'#d8743a')+ellipse(8,11,2,2.2,'#f0b34a')+rect(7,10,1,1,'#fff0b2'), // 11 hearth
  floorPlank+shadow(8,14,8,1)+rect(0,4,16,10,'#6a5036')+rect(0,4,16,2,'#8a6a46')+rect(0,13,16,1,'#4a3826')+[5,11].map(x=>rect(x,6,1,7,'#5a4430')).join(''), // 12 counter
  floorPlank+shadow(9,14.5,7,1.5)+ellipse(8,9,6.5,5.5,'#b8a87a')+ellipse(7.5,8.5,5.5,4.5,'#c8b88a')+rect(6,3,4,2,'#a89868')+rect(5,8,6,3,'#8a7a5a')+rect(6,9,4,1,'#c8b88a')+ellipse(6,6.5,2,1.5,'#d8c89a'), // 13 flour sacks
  flags('#43453f','#50534c','#2c2e2a')+shadow(9,13,7,2)+ellipse(8,8,7,6.5,'#55564d')+ellipse(7.5,7.5,6.5,6,'#7a7b6e')+ellipse(6,6,3,2.5,'#929385')+ellipse(8,8,1.5,1.5,'#2e2e2a')+rect(3,9,3,1,'#55564d')+rect(10,4,3,1,'#55564d'), // 14 millstone
  flags('#43453f','#50534c','#2c2e2a')+ellipse(8,8,7.5,7.5,'#3a2a1e')+ellipse(8,8,6,6,'#4a3828')+ellipse(8,8,4,4,'#3e403c')+rect(7,1,2,14,'#6a5036')+rect(1,7,14,2,'#6a5036')
    +rect(7,1,1,14,'#8a6a46')+rect(1,7,14,1,'#8a6a46')+[[7,0],[0,7],[14,7],[7,14],[2,2],[12,2],[2,12],[12,12]].map(([x,y])=>rect(x,y,2,2,'#5a4430')).join('')+ellipse(8,8,1.5,1.5,'#2a2018'), // 15 gear wheel
  flags('#43453f','#50534c','#2c2e2a')+rect(1,1,2,15,'#5d4630')+rect(13,1,2,15,'#5d4630')+rect(1,1,14,2,'#6a5236')+rect(1,1,14,1,'#8c7049')+rect(3,3,4,10,'#9a7a58')+rect(3,3,4,1,'#b4946a')+rect(8,3,4,9,'#856749')+rect(8,3,4,1,'#9a7a58'), // 16 hide rack
  flags('#43453f','#50534c','#2c2e2a')+rect(1,2,14,13,'#4a4842')+rect(1,2,14,1,'#5e5c55')+rect(2,3,12,10,'#4a3a1e')+rect(3,4,10,1,'#6a5a2a')+rect(5,7,4,1,'#6a5a2a')+rect(10,9,2,1,'#7a6a34')+rect(1,14,14,1,'#2c2a26'), // 17 tanning vat
  floorPlank+rect(1,1,14,14,'#4a2422')+rect(2,2,12,12,'#6a3a30')+rect(3,3,10,10,'#5a2a26')+rect(5,5,6,6,'#7a4a36')+rect(7,7,2,2,'#c8a85a')+[[4,4],[11,4],[4,11],[11,11]].map(([x,y])=>rect(x,y,1,1,'#c8a85a')).join(''), // 18 rug
  rect(0,0,16,16,'#5a4a38')+rect(0,0,16,1,'#6e5c46')+rect(3,2,10,10,'#3a2e22')+rect(4,3,8,8,'#2a3a40')+rect(4,3,8,3,'#3a5058')+rect(7,3,2,8,'#5a4a38')+rect(4,6,8,1,'#5a4a38')+rect(5,4,1,1,'#8aa8b0')
    +rect(2,12,12,1,'#7a6448')+rect(0,13,16,3,'#3a2e22')+rect(0,13,16,1,'#4f3f2e'),                             // 19 window
  flags('#43453f','#50534c','#2c2e2a')+shadow(9,13.5,7,1.5)+rect(1,3,14,9,'#5a4430')+rect(1,3,14,2,'#7a5e40')+rect(1,11,14,1,'#3a2a1e')+rect(3,5,5,4,'#d8d0b8')+rect(4,6,3,1,'#8a8270')+rect(4,7,2,1,'#8a8270')+rect(10,4,2,3,'#2a2a2a')+rect(10,4,1,1,'#5a5a5a')+rect(12,6,2,1,'#c8b878'), // 20 desk with papers
  flags('#43453f','#50534c','#2c2e2a')+rect(2,1,12,15,'#4a3828')+rect(2,1,12,1,'#6a5036')+rect(3,2,10,6,'#5a4430')+rect(3,9,10,6,'#5a4430')+rect(3,2,10,1,'#6e5638')+rect(3,9,10,1,'#6e5638')+rect(7,4,2,1,'#c8a85a')+rect(7,11,2,1,'#c8a85a')+rect(13,2,1,13,'#33261a'), // 21 cabinet
  rect(0,0,16,16,'#5a5030')+[[2,3,'#7a6a40'],[9,9,'#7a6a40'],[4,12,'#6a5a34'],[11,2,'#8a7a48'],[6,7,'#4a4228'],[13,13,'#7a6a40']].map(([x,y,c])=>rect(x,y,4,1,c)+rect(x+1,y+1,2,1,'#3a3420',0.5)).join(''), // 22 straw floor
  flags('#43453f','#50534c','#2c2e2a')+rect(3,0,2,16,'#6a5036')+rect(3,0,1,16,'#8a6a46')+rect(11,0,2,16,'#6a5036')+rect(11,0,1,16,'#8a6a46')+[2,6,10,14].map(y=>rect(3,y,10,1,'#8a6a46')+rect(3,y+1,10,1,'#4a3826')).join(''), // 23 ladder
];
// Variants of the floors: a knot and a worn board in the planks, a cracked flag in the stone.
const PLANK_VARIANTS = [tiles.length + 1, tiles.length + 2], STONE_VARIANTS = [tiles.length + 3];
tiles.push(
  tiles[1] + krect(6,9,2,2,'#33261a') + krect(7,10,1,1,'#5a4634'),
  tiles[1] + krect(0,4,16,3,'#54402e') + krect(0,4,16,1,'#5e4a36'),
  tiles[2] + krect(3,2,1,3,'#2c2e2a') + krect(4,4,2,1,'#2c2e2a') + krect(6,5,1,2,'#2c2e2a'),
);
const svg = sheet(tiles);
writeFileSync('public/assets/interior-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="${rows(tiles)*16}" shape-rendering="crispEdges">${svg}</svg>\n`);
// TILES_ONLY=1 redraws the tiles and leaves the maps alone: they have been edited by hand since this script made them.
if (process.env.TILES_ONLY) process.exit(0);
const [VOID,PLANK,STONE,WALL,TOP,MAT,BED,TABLE,STOOL,BARREL,SHELF,HEARTH,COUNTER,SACKS,MILLSTONE,GEAR,RACK,VAT,RUG,WINDOW,DESK,CABINET,STRAW,LADDER]=tiles.map((_,i)=>i+1);
const solid=[0,3,4,6,7,9,10,11,12,13,14,15,16,17,19,20,21,23];

// A room of the given floor, walled, with a doormat at the bottom centre. Returns the layers and the doormat column.
function room(x0,y0,x1,y1,floorTile){
  const w=32,h=24, floor=Array(w*h).fill(VOID), furniture=Array(w*h).fill(VOID);
  const put=(a,x,y,t)=>a[y*w+x]=t;
  const fill=(a,ax,ay,bx,by,t)=>{for(let y=ay;y<=by;y++)for(let x=ax;x<=bx;x++)put(a,x,y,t);};
  fill(floor,x0,y0,x1,y1,floorTile);fill(furniture,x0,y0,x1,y1,0);
  fill(furniture,x0-1,y0-2,x1+1,y0-2,TOP);fill(furniture,x0,y0-1,x1,y0-1,WALL);
  fill(furniture,x0-1,y0-1,x0-1,y1+1,TOP);fill(furniture,x1+1,y0-1,x1+1,y1+1,TOP);fill(furniture,x0-1,y1+1,x1+1,y1+1,TOP);
  const door=Math.floor((x0+x1)/2);
  put(furniture,door,y1+1,0);put(furniture,door+1,y1+1,0);put(floor,door,y1+1,MAT);put(floor,door+1,y1+1,MAT);
  return {w,h,floor,furniture,put,fill,door};
}
function write(name,{w,h,floor,furniture},points){
  const layer=(n,data,id)=>({id,name:n,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
  const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:points.length+1,
    layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([n,x,y],i)=>({id:i+1,name:n,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],
    tilesets:[{firstgid:1,name:'interior',image:'../assets/interior-tiles.svg',imagewidth:128,imageheight:rows(tiles)*16,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:rows(tiles)*8,
      tiles:solid.map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
  vary(floor,w,2,PLANK_VARIANTS,name.length*13,0.3);vary(floor,w,3,STONE_VARIANTS,name.length*17,0.2);
  writeFileSync(`public/maps/${name}.json`,JSON.stringify(map,null,2)+'\n');
}
const at=(x,y)=>[x*16+8,y*16+8];

// The inn: a common room with a hearth, a counter, tables, and beds along the west wall.
{
  const r=room(7,6,24,18,PLANK);
  r.fill(r.furniture,7,5,24,5,WALL);[10,20].forEach(x=>r.put(r.furniture,x,5,WINDOW));
  r.put(r.furniture,15,6,HEARTH);r.put(r.furniture,16,6,HEARTH);
  r.fill(r.furniture,19,8,24,8,COUNTER);r.put(r.furniture,22,6,SHELF);r.put(r.furniture,23,6,SHELF);r.put(r.furniture,24,7,BARREL);
  for(const [x,y] of [[12,11],[18,13]]){r.put(r.furniture,x,y,TABLE);r.put(r.furniture,x+1,y,TABLE);r.put(r.floor,x-1,y,STOOL);r.put(r.floor,x+2,y,STOOL);}
  r.put(r.furniture,7,8,BED);r.put(r.furniture,7,11,BED);r.put(r.furniture,7,14,BED);
  r.fill(r.floor,13,15,18,17,RUG);
  write('inn',r,[['spawn',...at(r.door,17)],['out',...at(r.door,19)],['drinker',...at(14,11)],['patron',...at(20,14)],['bed',...at(8,14)],['tariff',...at(21,9)],['marine',...at(11,11)]]);
}
// The reeve's hall: stone floor, a clerk at a desk, cabinets of records.
{
  const r=room(9,7,22,16,STONE);
  r.put(r.furniture,12,6,WINDOW);r.put(r.furniture,19,6,WINDOW);
  r.put(r.furniture,15,9,DESK);r.put(r.furniture,16,9,DESK);
  [9,10,11].forEach(x=>r.put(r.furniture,x,7,CABINET));[20,21,22].forEach(x=>r.put(r.furniture,x,7,CABINET));
  r.put(r.furniture,22,12,SHELF);r.put(r.furniture,9,13,BARREL);
  r.fill(r.floor,14,12,17,14,RUG);
  write('hall',r,[['spawn',...at(r.door,15)],['out',...at(r.door,17)],['clerk',...at(16,10)],['records',...at(10,8)],['letter',...at(15,10)]]);
}
// The mill: straw underfoot, flour sacks, the gears off the wheel, and the miller's ledger.
{
  const r=room(8,7,23,17,STRAW);
  r.put(r.furniture,8,6,WINDOW);
  r.put(r.furniture,22,8,GEAR);r.put(r.furniture,23,8,GEAR);r.put(r.furniture,22,9,GEAR);r.put(r.furniture,23,9,MILLSTONE);
  for(const [x,y] of [[9,8],[10,8],[9,9],[12,8],[9,15],[10,15],[10,16]]) r.put(r.furniture,x,y,SACKS);
  r.put(r.furniture,16,7,LADDER);r.put(r.furniture,19,13,TABLE);r.put(r.furniture,20,13,TABLE);
  write('mill-inside',r,[['spawn',...at(r.door,16)],['out',...at(r.door,18)],['gears',...at(21,9)],['sacks',...at(11,9)],['mill-ledger',...at(19,14)]]);
}
// The tannery: stone floor, vats, racks of hides, and a bolted back door.
{
  const r=room(8,7,23,16,STONE);
  for(const [x,y] of [[10,9],[12,9],[10,12],[12,12]]) r.put(r.furniture,x,y,VAT);
  [19,20,21,22].forEach(x=>r.put(r.furniture,x,8,RACK));[19,20].forEach(x=>r.put(r.furniture,x,11,RACK));
  r.put(r.furniture,15,6,WALL);r.put(r.floor,15,7,MAT);
  write('tannery',r,[['spawn',...at(r.door,15)],['out',...at(r.door,17)],['tanner',...at(17,10)],['vats',...at(11,11)],['back-door',...at(15,8)]]);
}
// The fort barracks: bunks down both walls, a stove, the garrison roll. The vulture slept by the far wall.
{
  const r=room(8,7,23,16,PLANK);
  r.put(r.furniture,15,6,HEARTH);r.put(r.furniture,10,6,WINDOW);r.put(r.furniture,20,6,WINDOW);
  for(const y of [8,10,12,14]){r.put(r.furniture,8,y,BED);r.put(r.furniture,23,y,BED);}
  r.put(r.furniture,14,11,TABLE);r.put(r.furniture,15,11,TABLE);r.put(r.floor,13,11,STOOL);r.put(r.floor,16,11,STOOL);
  r.put(r.furniture,11,7,CABINET);r.put(r.furniture,12,7,CABINET);r.put(r.furniture,19,7,BARREL);
  write('barracks',r,[['spawn',...at(r.door,15)],['out',...at(r.door,17)],['bunk',...at(22,14)],['roll',...at(12,8)],['stove',...at(15,7)],['wrestler',...at(17,11)]]);
}
// The hall of the Long Table, where the feast was held: the long table down the middle, the rulers' table across the top,
// five seats for the heroes at the far end, the cupbearer's sideboard by the door, and the kraken hung from the rafters.
{
  const r=room(4,6,27,18,STONE);
  r.put(r.furniture,15,5,HEARTH);r.put(r.furniture,16,5,HEARTH);[7,11,20,24].forEach(x=>r.put(r.furniture,x,5,WINDOW));
  r.fill(r.furniture,11,7,20,7,TABLE);
  r.fill(r.furniture,7,11,22,12,TABLE);
  for(let x=7;x<=22;x+=2){r.put(r.floor,x,10,STOOL);r.put(r.floor,x,13,STOOL);}
  for(const y of [9,10,11,12,13]) r.put(r.floor,26,y,STOOL);
  r.fill(r.furniture,5,7,6,7,COUNTER);r.put(r.furniture,5,8,BARREL);
  r.fill(r.floor,12,15,19,17,RUG);
  write('feast-hall',r,[['spawn',...at(r.door,17)],['out',...at(r.door,19)],
    ['long-table',...at(14,10)],['rulers-table',...at(15,8)],['five-seats',...at(25,11)],['sideboard',...at(7,8)],
    ['kraken-1',...at(10,11)],['kraken-2',...at(16,12)],['kraken-3',...at(21,11)],['cleaner',...at(23,15)]]);
}
