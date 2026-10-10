// Rebuild the placeholder interior tileset and the four building interiors: the inn, the reeve's hall, the mill, and the tannery.
// Each room sits in the middle of a dark map the size of the view. Edit the JSON in Tiled for content work; this script resets them.
import { writeFileSync } from 'node:fs';
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const planks = (a,b) => rect(0,0,16,16,a)+[3,7,11,15].map(y=>rect(0,y,16,1,b)).join('')+rect(5,0,1,3,b)+rect(11,4,1,3,b)+rect(3,8,1,3,b)+rect(13,12,1,3,b);
const tiles = [
  rect(0,0,16,16,'#07090a'),                                                                                     // 0 void
  planks('#4a3828','#33261a'),                                                                                  // 1 plank floor
  rect(0,0,16,16,'#3e403c')+rect(0,0,7,7,'#474a44')+rect(8,8,8,8,'#474a44')+rect(0,15,16,1,'#2c2e2a'),           // 2 stone floor
  rect(0,0,16,16,'#5a4a38')+rect(0,13,16,3,'#3a2e22')+rect(0,4,16,1,'#4a3c2c')+rect(0,9,16,1,'#4a3c2c'),          // 3 wall face
  rect(0,0,16,16,'#1c1712')+rect(0,0,16,2,'#2c241b'),                                                            // 4 wall top
  planks('#4a3828','#33261a')+rect(2,10,12,6,'#6a3a2a')+rect(3,11,10,4,'#7a4a34'),                                // 5 doormat
  rect(0,0,16,16,'#4a3828')+rect(1,2,14,13,'#3a2a1e')+rect(2,3,12,4,'#c8c0aa')+rect(2,7,12,7,'#6a5a7a'),          // 6 bed
  rect(0,0,16,16,'#4a3828')+rect(1,3,14,8,'#6a5036')+rect(1,3,14,2,'#8a6a46')+rect(2,11,2,4,'#3a2a1e')+rect(12,11,2,4,'#3a2a1e'), // 7 table
  planks('#4a3828','#33261a')+rect(5,6,6,4,'#6a5036')+rect(5,10,1,4,'#3a2a1e')+rect(10,10,1,4,'#3a2a1e'),       // 8 stool
  rect(0,0,16,16,'#4a3828')+rect(3,2,10,13,'#6a5236')+rect(3,4,10,1,'#3c3326')+rect(3,11,10,1,'#3c3326'),         // 9 barrel
  rect(0,0,16,16,'#1c1712')+rect(1,1,14,14,'#4a3828')+rect(1,5,14,1,'#2a2018')+rect(1,10,14,1,'#2a2018')+rect(3,2,3,3,'#8a7a5a')+rect(8,6,4,4,'#6a7a6a')+rect(4,11,6,3,'#7a5a4a'), // 10 shelf
  rect(0,0,16,16,'#2c2a26')+rect(1,3,14,13,'#4a4842')+rect(3,7,10,9,'#1a1410')+rect(5,10,6,5,'#d8743a')+rect(6,8,4,4,'#f0b34a'), // 11 hearth
  rect(0,0,16,16,'#4a3828')+rect(0,4,16,10,'#6a5036')+rect(0,4,16,2,'#8a6a46'),                                   // 12 counter
  rect(0,0,16,16,'#4a3828')+rect(2,4,12,11,'#c8b88a')+rect(3,2,10,3,'#d8c89a')+rect(5,7,6,3,'#8a7a5a'),          // 13 flour sacks
  rect(0,0,16,16,'#3e403c')+rect(1,1,14,14,'#6a6a62')+rect(3,3,10,10,'#8a8a80')+rect(7,7,2,2,'#3a3a36'),          // 14 millstone
  rect(0,0,16,16,'#3e403c')+rect(1,1,14,14,'#4a3828')+rect(3,3,10,10,'#3e403c')+rect(7,1,2,14,'#6a5036')+rect(1,7,14,2,'#6a5036'), // 15 gear wheel
  rect(0,0,16,16,'#3e403c')+rect(1,1,1,15,'#5d4630')+rect(14,1,1,15,'#5d4630')+rect(1,2,14,1,'#5d4630')+rect(3,3,4,9,'#9a7a58')+rect(9,3,4,8,'#856749'), // 16 hide rack
  rect(0,0,16,16,'#3e403c')+rect(1,2,14,13,'#4a4842')+rect(2,3,12,10,'#5a4a2a')+rect(4,5,6,2,'#6a5a3a'),          // 17 tanning vat
  rect(0,0,16,16,'#4a3828')+rect(1,1,14,14,'#5a2a26')+rect(2,2,12,12,'#6a3a30')+rect(4,4,8,8,'#5a2a26'),          // 18 rug
  rect(0,0,16,16,'#5a4a38')+rect(0,13,16,3,'#3a2e22')+rect(4,3,8,8,'#2a3a40')+rect(7,3,2,8,'#5a4a38')+rect(4,6,8,1,'#5a4a38'), // 19 window
  rect(0,0,16,16,'#3e403c')+rect(1,3,14,9,'#5a4430')+rect(1,3,14,2,'#7a5e40')+rect(3,5,5,4,'#d8d0b8')+rect(10,4,2,3,'#2a2a2a'), // 20 desk with papers
  rect(0,0,16,16,'#3e403c')+rect(2,1,12,15,'#4a3828')+rect(3,2,10,6,'#5a4430')+rect(3,9,10,6,'#5a4430')+rect(7,4,2,1,'#c8a85a')+rect(7,11,2,1,'#c8a85a'), // 21 cabinet
  rect(0,0,16,16,'#5a5030')+rect(2,3,5,1,'#7a6a40')+rect(9,9,6,1,'#7a6a40')+rect(4,12,4,1,'#6a5a34'),            // 22 straw floor
  rect(0,0,16,16,'#3e403c')+rect(3,0,2,16,'#6a5036')+rect(11,0,2,16,'#6a5036')+[2,6,10,14].map(y=>rect(3,y,10,1,'#8a6a46')).join(''), // 23 ladder
];
const svg = tiles.map((s,i)=>`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`).join('');
writeFileSync('public/assets/interior-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="48" shape-rendering="crispEdges">${svg}</svg>\n`);
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
    tilesets:[{firstgid:1,name:'interior',image:'../assets/interior-tiles.svg',imagewidth:128,imageheight:48,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:24,
      tiles:solid.map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
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
