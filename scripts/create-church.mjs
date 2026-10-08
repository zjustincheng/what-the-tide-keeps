// Rebuild the original placeholder tileset and Tiled JSON map.
// Edit the JSON in Tiled for content work; this script resets it to the prototype.
import { writeFileSync } from 'node:fs';
const colors = ['#344b42','#293e38','#4c5a4d','#644b39','#57624e','#7a7861','#263e3b','#777257'];
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const tiles = [];
for(let i=0;i<16;i++){
 let s=rect(0,0,16,16,colors[i%8]);
 if(i===0||i===1){s=rect(0,0,16,16,i===0?'#3b5045':'#384b40')+rect(0,0,16,1,'#566455')+rect(0,0,1,16,'#435b4c')+rect(15,1,1,15,'#293e35')+rect(1,15,14,1,'#2c4138')+rect(3,4,2,1,'#52604e')+rect(10,11,3,1,'#30473c');}
 if(i===2){s=rect(0,0,16,16,'#263a35')+rect(1,1,14,6,'#53614f')+rect(0,9,7,6,'#435647')+rect(9,9,7,6,'#4b5a49')+rect(1,1,14,1,'#6e7159')+rect(0,9,7,1,'#63715a');}
 if(i===3){s=rect(0,0,16,16,'#73583c')+rect(0,0,2,16,'#a58b56')+rect(14,0,2,16,'#a58b56')+rect(4,0,8,16,'#604c36')+rect(7,5,2,2,'#8f754c')+rect(6,6,4,2,'#8f754c')+rect(7,8,2,2,'#8f754c');}
 if(i===4){s=rect(1,5,14,10,'#23372e')+rect(2,3,12,10,'#352c22')+rect(1,1,14,4,'#89704b')+rect(2,2,12,1,'#b39a65')+rect(2,6,12,5,'#6e5539')+rect(3,7,10,1,'#927648')+rect(2,12,2,3,'#483b29')+rect(12,12,2,3,'#483b29');}
 if(i===5){s=rect(2,0,12,16,'#253d34')+rect(4,1,8,13,'#788573')+rect(5,1,2,12,'#a2a386')+rect(2,0,12,3,'#92957b')+rect(2,13,12,3,'#92957b')+rect(3,15,10,1,'#505b46');}
 if(i===6){s=rect(0,0,16,16,'#263b35')+rect(2,1,12,14,'#65776a')+rect(3,3,10,11,'#648d85')+rect(4,4,3,4,'#97b8a0')+rect(9,4,3,4,'#bac3a3')+rect(4,10,3,3,'#b1b795')+rect(9,10,3,3,'#87a698')+rect(7,2,2,12,'#3a574c')+rect(3,8,10,2,'#3a574c')+rect(1,14,14,2,'#818575');}
 if(i===7){s=rect(0,4,16,12,'#343f34')+rect(0,2,16,10,'#a09a77')+rect(1,3,14,1,'#d1c29a')+rect(0,12,16,3,'#60634c')+rect(6,4,4,6,'#bdaf84');}
 if(i===8){s=rect(0,0,16,16,'#263c35')+rect(2,2,12,12,'#657762')+rect(3,3,10,10,'#81907a')+rect(4,4,8,8,'#253f3c')+rect(5,5,6,5,'#557f72')+rect(6,5,4,1,'#9aac8b')+rect(2,13,12,2,'#445943');}
 if(i===9){s=rect(0,0,16,16,'#3b5045')+rect(3,1,10,14,'#493e30')+rect(4,2,8,12,'#788771')+rect(4,2,8,4,'#b1b69a')+rect(5,7,6,7,'#89967b')+rect(3,14,2,2,'#2e3026')+rect(11,14,2,2,'#2e3026');}
 if(i===10){s=rect(0,0,16,16,'#3b5045')+rect(2,2,12,12,'#5a4833')+rect(3,3,10,10,'#816a44')+rect(4,4,8,7,'#c5b989')+rect(8,4,1,7,'#73694c')+rect(5,6,2,1,'#857955')+rect(10,8,2,1,'#857955');}
 if(i===11){s=rect(0,0,16,16,'#202e29')+rect(2,0,12,16,'#735939')+rect(3,0,1,16,'#a3854e')+rect(7,0,1,16,'#a3854e')+rect(12,0,1,16,'#a3854e')+rect(3,4,10,2,'#302e26')+rect(3,12,10,2,'#302e26')+rect(10,8,2,2,'#c5b275');}
 if(i===12){s=rect(0,0,16,16,'#3b5045')+rect(6,8,4,5,'#806d41')+rect(4,13,8,2,'#a18d55')+rect(7,4,2,5,'#e2d3a2')+rect(7,1,2,3,'#e1a558')+rect(7,2,1,2,'#fff0b2');}
 if(i===13){s=rect(0,0,16,16,'#3b5045')+rect(2,5,12,9,'#484438')+rect(4,1,8,11,'#65765f')+rect(5,2,6,2,'#94a087')+rect(7,4,2,7,'#b1b395')+rect(5,6,6,2,'#b1b395')+rect(2,13,12,2,'#8c9476');}
 if(i===14){s=rect(0,0,16,16,'#142722')+rect(0,0,16,3,'#344e3f');}
 if(i===15){s=rect(0,0,16,16,'#3b5045')+rect(1,6,14,7,'#53614e')+rect(2,5,12,2,'#9b9c78')+rect(4,2,8,4,'#748365')+rect(7,1,2,5,'#b7b58c');}
 tiles.push(`<g transform="translate(${i%8*16} ${Math.floor(i/8)*16})">${s}</g>`);
}
writeFileSync('public/assets/church-tiles.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="32" shape-rendering="crispEdges">${tiles.join('')}</svg>\n`);
const w=32,h=24, floor=Array(w*h).fill(0),furniture=Array(w*h).fill(0);
const put=(a,x,y,t)=>a[y*w+x]=t;
for(let y=0;y<h;y++)for(let x=0;x<w;x++)put(floor,x,y,(x+y)%3===0?2:1);
for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<2||x>29||y<3||y>21)put(furniture,x,y,3);
for(let y=5;y<22;y++)for(let x=14;x<=17;x++)put(floor,x,y,4);
for(const x of [5,10,21,26])put(furniture,x,2,7);
for(const y of [6,10,14,18])for(const x of [3,28])put(furniture,x,y,6);
for(const y of [10,13,16])for(const start of [7,21])for(let x=start;x<start+4;x++)put(furniture,x,y,5);
for(let x=13;x<=18;x++)put(furniture,x,5,8);
put(furniture,15,4,16);put(furniture,16,4,16);
for(const [x,y] of [[12,5],[19,5],[5,4],[26,4],[12,18],[19,18]])put(furniture,x,y,13);
put(furniture,5,6,10);put(furniture,6,6,10);put(furniture,25,6,11);put(furniture,25,18,9);
for(const x of [15,16])put(furniture,x,22,12);
const layer=(name,data,id)=>({id,name,type:'tilelayer',width:w,height:h,x:0,y:0,opacity:1,visible:true,data});
const points=[['spawn',88,124],['priest',248,124],['ledger',408,104],['basin',408,296],['door',256,350],['encounter',360,320]];
const map={compressionlevel:-1,width:w,height:h,infinite:false,orientation:'orthogonal',renderorder:'right-down',tilewidth:16,tileheight:16,tiledversion:'1.11.2',version:'1.10',type:'map',nextlayerid:4,nextobjectid:7,layers:[layer('Floor',floor,1),layer('Furniture',furniture,2),{id:3,name:'Points',type:'objectgroup',x:0,y:0,opacity:1,visible:true,draworder:'topdown',objects:points.map(([name,x,y],i)=>({id:i+1,name,type:'',x,y,width:0,height:0,rotation:0,visible:true,point:true}))}],tilesets:[{firstgid:1,name:'church',image:'../assets/church-tiles.svg',imagewidth:128,imageheight:32,margin:0,spacing:0,tilewidth:16,tileheight:16,columns:8,tilecount:16,tiles:[2,4,5,6,7,8,9,10,11,12,13,14,15].map(id=>({id,properties:[{name:'collides',type:'bool',value:true}]}))}]};
writeFileSync('public/maps/church.json',JSON.stringify(map,null,2)+'\n');
