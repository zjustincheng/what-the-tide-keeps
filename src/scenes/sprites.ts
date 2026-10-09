import type Phaser from 'phaser';

// none: birds, tortoises, and seals, whose heads are just the head.
type Ears = 'long' | 'wool' | 'horns' | 'antlers' | 'pointed' | 'none';
type Villager = { fur: number; muzzle: number; cloth: number; trim: number; ears: Ears; child?: boolean };

// Placeholder townsfolk, drawn on the same 20×26 grid as the priest.
const VILLAGERS: Record<string, Villager> = {
  reeve: { fur: 0xb9ac97, muzzle: 0xe2d8c4, cloth: 0x5d6b7c, trim: 0xc5b275, ears: 'long' },
  innkeeper: { fur: 0xe4dccb, muzzle: 0x6b5d50, cloth: 0x7b5a45, trim: 0xb8a988, ears: 'wool' },
  shopkeeper: { fur: 0xa47a52, muzzle: 0xd8c0a0, cloth: 0x6f7d58, trim: 0xd8cfae, ears: 'antlers' },
  child: { fur: 0xeee6d6, muzzle: 0x8a7a6a, cloth: 0x9c6b5a, trim: 0xd8cfae, ears: 'wool', child: true },
  fishmonger: { fur: 0x9a9184, muzzle: 0xcfc6b5, cloth: 0x4f6a73, trim: 0x8fa9a8, ears: 'horns' },
  fox: { fur: 0xb8693a, muzzle: 0xeadcc4, cloth: 0x4a4038, trim: 0x8c7049, ears: 'pointed' },
  driver: { fur: 0x7d7f80, muzzle: 0xc9c4b8, cloth: 0x5a4a3a, trim: 0x8f3f32, ears: 'pointed' },
  miller: { fur: 0x8a6a4a, muzzle: 0xd8c8a8, cloth: 0xd8d0b8, trim: 0x9a8a6a, ears: 'pointed' },
  shepherd: { fur: 0xc8bea8, muzzle: 0x6b5d50, cloth: 0x6a7a4a, trim: 0xb8a988, ears: 'horns' },
  // Inside Millbrook.
  drinker: { fur: 0x8a8070, muzzle: 0xc8bea8, cloth: 0x5a4a3a, trim: 0x8a7a5a, ears: 'horns' },
  patron: { fur: 0x9a8a78, muzzle: 0xd8ccb8, cloth: 0x4a5a6a, trim: 0xa89878, ears: 'long' },
  clerk: { fur: 0xc8b8a0, muzzle: 0xe8dcc8, cloth: 0x3a3a48, trim: 0xd8d0b8, ears: 'long' },
  tanner: { fur: 0x4a3828, muzzle: 0x8a7058, cloth: 0x6a5a40, trim: 0x3a2e22, ears: 'pointed' },
  guard: { fur: 0xd6cdb8, muzzle: 0x9a8a72, cloth: 0x6b7a8a, trim: 0xd8cfae, ears: 'horns' },
  // The downs and the fen.
  ram: { fur: 0xa8a090, muzzle: 0x5a5048, cloth: 0x5a5a40, trim: 0x8a7a5a, ears: 'horns' },
  'hound-mother': { fur: 0x5a524a, muzzle: 0x8a7a68, cloth: 0x3a3530, trim: 0x4a433c, ears: 'pointed' },
  otter: { fur: 0x6a4a30, muzzle: 0xb8a088, cloth: 0x3a4a44, trim: 0x5a6a5a, ears: 'pointed' },
  // The boar's sister, the kid Millbrook said he ate, and the abbey's last monk.
  sow: { fur: 0x9a7a6a, muzzle: 0xc8a090, cloth: 0x4a3a30, trim: 0x6a4a3a, ears: 'pointed' },
  kid: { fur: 0xd8ccb0, muzzle: 0x8a7a68, cloth: 0x6a7a5a, trim: 0xb8a988, ears: 'horns', child: true },
  monk: { fur: 0xc8c0b0, muzzle: 0x7a6e60, cloth: 0x3a3430, trim: 0x5a5048, ears: 'horns' },
  // The weir: the fishery's goose, the otters, and a mink smuggler. The tarn's trapper and the drove road's wolf.
  goose: { fur: 0xe8e4d8, muzzle: 0xd8903a, cloth: 0x4a5a6a, trim: 0xc8b878, ears: 'wool' },
  'otter-elder': { fur: 0x5a4030, muzzle: 0xa89078, cloth: 0x3a4a44, trim: 0x6a6a5a, ears: 'pointed' },
  'otter-kit': { fur: 0x6a4a30, muzzle: 0xb8a088, cloth: 0x4a5a50, trim: 0x7a7a6a, ears: 'pointed', child: true },
  mink: { fur: 0x2e2420, muzzle: 0x8a7a6a, cloth: 0x4a3a28, trim: 0x8a6a3a, ears: 'pointed' },
  trapper: { fur: 0xa88a60, muzzle: 0xe0d4bc, cloth: 0x5a4a3a, trim: 0xc8ccc8, ears: 'pointed' },
  drover: { fur: 0x7a7a74, muzzle: 0xc0b8a8, cloth: 0x5a4a30, trim: 0x8a3a30, ears: 'pointed' },
  // The capital: the square's people, the harbour's, and the hall's last cleaner.
  crier: { fur: 0xd8d0bc, muzzle: 0x8a7a6a, cloth: 0x6a2a2a, trim: 0xd8c878, ears: 'horns' },
  broadsheet: { fur: 0xc8b8a0, muzzle: 0xe8dcc8, cloth: 0x5a6a7a, trim: 0xd8d0b8, ears: 'long', child: true },
  lamplighter: { fur: 0x3a3430, muzzle: 0xc89888, cloth: 0x4a4a3a, trim: 0xe8c870, ears: 'none' },
  apothecary: { fur: 0x8a7a5a, muzzle: 0xd8c890, cloth: 0x3a4a3a, trim: 0xc8b878, ears: 'pointed' },
  citizen: { fur: 0xb8946a, muzzle: 0xe8d8c0, cloth: 0x5a4a5a, trim: 0xa89888, ears: 'long' },
  fishwife: { fur: 0xe8e8e4, muzzle: 0xe8b83a, cloth: 0x5a6a6a, trim: 0x8aa0a8, ears: 'none' },
  crab: { fur: 0xb84a2a, muzzle: 0xd87a4a, cloth: 0x8a3a20, trim: 0xe8c8a8, ears: 'none' },
  harbourmaster: { fur: 0x5a6a4a, muzzle: 0x8a8a6a, cloth: 0x2a3a4a, trim: 0xc8b878, ears: 'none' },
  steward: { fur: 0x8a5a3a, muzzle: 0xe8d8c0, cloth: 0x3a2a2a, trim: 0xb89a5a, ears: 'pointed' },
  cleaner: { fur: 0xe0e0dc, muzzle: 0x2a2a28, cloth: 0x6a6a5a, trim: 0x8a8a7a, ears: 'pointed' },
  smith: { fur: 0x4a3a2c, muzzle: 0x8a6a4a, cloth: 0x3a3028, trim: 0x8a8a8a, ears: 'pointed' },
  marten: { fur: 0x5a3a24, muzzle: 0xe8c890, cloth: 0x2a2a30, trim: 0xb89a5a, ears: 'pointed' },
  // Keepers of the world's history.
  novice: { fur: 0xb8946a, muzzle: 0xe8d8c0, cloth: 0x8a8a7a, trim: 0xb8b69b, ears: 'long' },
  pilgrim: { fur: 0x6a7a5a, muzzle: 0x8a8a6a, cloth: 0x6a5a44, trim: 0xb8a070, ears: 'none' },
  carter: { fur: 0x5a5e62, muzzle: 0x8a8e90, cloth: 0x3a4a5a, trim: 0x8aa0a8, ears: 'none' },
  beekeeper: { fur: 0x6a5a48, muzzle: 0xd8c8a8, cloth: 0xc8b878, trim: 0x6a6a5a, ears: 'pointed' },
  scribe: { fur: 0xe8e4dc, muzzle: 0xc85a3a, cloth: 0x3a3a48, trim: 0xd8d0b8, ears: 'none' },
  marine: { fur: 0xb8a888, muzzle: 0xe0d4c0, cloth: 0x3a4a6a, trim: 0xc8b878, ears: 'long' },
  bard: { fur: 0x2a2a2e, muzzle: 0x4a4a4e, cloth: 0x5a3a4a, trim: 0xc8a858, ears: 'none' },
  ferry: { fur: 0xd8dcdc, muzzle: 0x3a3a3a, cloth: 0x4a5a50, trim: 0xa83a2a, ears: 'none' },
  chaplain: { fur: 0xe0e0dc, muzzle: 0x2a2a28, cloth: 0x8a8a7a, trim: 0xd8c878, ears: 'pointed' },
  raven: { fur: 0x1e1e24, muzzle: 0x3a3a40, cloth: 0x6a5a3a, trim: 0xa89060, ears: 'none' },
  teacher: { fur: 0x9a9a94, muzzle: 0xd8d4c8, cloth: 0x4a3a5a, trim: 0xc8c0a8, ears: 'pointed' },
  cub: { fur: 0x8a8a84, muzzle: 0xd0ccc0, cloth: 0x5a4a38, trim: 0x8a7a5a, ears: 'pointed', child: true },
  // The fort town in the highlands: a carnivore garrison, and the herbivores who trade there.
  sergeant: { fur: 0x6a6a6a, muzzle: 0xb8b0a0, cloth: 0x4a3a34, trim: 0x8a3a30, ears: 'pointed' },
  quartermaster: { fur: 0x3a3a38, muzzle: 0xe0dcd0, cloth: 0x5a5040, trim: 0x8a7a5a, ears: 'pointed' },
  lynx: { fur: 0xb89a70, muzzle: 0xe8dcc4, cloth: 0x5a4a5a, trim: 0x8a7a6a, ears: 'pointed' },
  veteran: { fur: 0x8a8a84, muzzle: 0xc8c4b8, cloth: 0x3a4038, trim: 0x6a6a5a, ears: 'pointed' },
  merchant: { fur: 0xd8d0bc, muzzle: 0x8a7a6a, cloth: 0x6a5a7a, trim: 0xc8b878, ears: 'horns' },
  fence: { fur: 0x7a5a3a, muzzle: 0xe0d0b0, cloth: 0x2e2a28, trim: 0x5a4a3a, ears: 'pointed' },
};

function villager(scene: Phaser.Scene, key: string, v: Villager) {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const block = (x: number, y: number, w: number, h: number, c: number) => g.fillStyle(c).fillRect(x, y, w, h);
  // Children stand lower and narrower in the same frame.
  const dy = v.child ? 6 : 0, inset = v.child ? 2 : 0;
  block(3 + inset, 21, 14 - inset * 2, 3, 0x27382e);
  block(4 + inset, 10 + dy, 12 - inset * 2, 13 - dy, v.cloth);
  block(8, 10 + dy, 4, 13 - dy, v.trim);
  block(5 + inset, 3 + dy, 11 - inset * 2, 9 - (v.child ? 1 : 0), v.fur);
  block(7 + inset, 6 + dy, 7 - inset * 2, 5, v.muzzle);
  block(8 + inset, 6 + dy, 1, 2, 0x1e2a24); block(12 - inset, 6 + dy, 1, 2, 0x1e2a24);
  if (v.ears === 'long') { block(6, 0 + dy, 3, 6, v.fur); block(12, 0 + dy, 3, 6, v.fur); block(7, 1 + dy, 1, 4, 0xd9a6a0); block(13, 1 + dy, 1, 4, 0xd9a6a0); }
  if (v.ears === 'wool') { block(4 + inset, 2 + dy, 13 - inset * 2, 4, v.fur); block(3 + inset, 5 + dy, 2, 3, v.muzzle); block(16 - inset, 5 + dy, 2, 3, v.muzzle); }
  if (v.ears === 'horns') { block(5, 0 + dy, 2, 4, 0xcfc6a5); block(14, 0 + dy, 2, 4, 0xcfc6a5); block(9, 11 + dy, 3, 3, v.muzzle); }
  if (v.ears === 'antlers') { block(4, 0, 1, 4, 0xcbb68a); block(3, 1, 3, 1, 0xcbb68a); block(16, 0, 1, 4, 0xcbb68a); block(15, 1, 3, 1, 0xcbb68a); }
  if (v.ears === 'pointed') { block(5, 1 + dy, 3, 3, v.fur); block(13, 1 + dy, 3, 3, v.fur); block(6, 2 + dy, 1, 1, 0x2b2420); block(14, 2 + dy, 1, 1, 0x2b2420); }
  g.generateTexture(key, 20, 26); g.destroy();
}

export function createSprites(scene: Phaser.Scene) {
  if (scene.textures.exists('hero')) return;
  const hero = scene.make.graphics({ x:0, y:0 });
  const block=(x:number,y:number,w:number,h:number,c:number)=>hero.fillStyle(c).fillRect(x,y,w,h);
  // A curled tail, green crest, pale eye and the branded convict's cloak.
  block(1,16,7,5,0x688a54);block(0,13,3,6,0x688a54);block(2,13,3,2,0x9bad64);
  block(7,19,3,5,0x35382d);block(13,19,3,5,0x35382d);
  block(5,10,12,11,0x6e644b);block(7,11,8,9,0xa19766);block(6,18,10,3,0x827653);
  block(7,3,10,9,0x88a567);block(9,1,6,3,0x9aaf6e);block(15,6,4,5,0x88a567);
  block(13,4,4,4,0xd7d1a0);block(15,5,2,2,0x213b2e);block(10,12,3,3,0x513a2b);block(11,12,1,3,0xd1a470);
  hero.generateTexture('hero',20,26);hero.destroy();
  const priest=scene.make.graphics({x:0,y:0});
  priest.fillStyle(0x27382e).fillRect(3,21,14,3);
  priest.fillStyle(0x889080).fillRect(4,10,12,13);
  priest.fillStyle(0xb8b69b).fillRect(7,10,6,13);
  priest.fillStyle(0xc3b28a).fillRect(8,12,4,3);
  priest.fillStyle(0x978f78).fillRect(5,3,11,9).fillRect(4,0,3,6).fillRect(14,0,3,6);
  priest.fillStyle(0xd0c3a0).fillRect(7,5,7,7);
  priest.fillStyle(0x2b3b31).fillRect(8,6,1,2).fillRect(12,6,1,2);
  priest.generateTexture('priest',20,26);priest.destroy();
  for (const [key, spec] of Object.entries(VILLAGERS)) villager(scene, key, spec);
  // A gibbet: a post, an arm, and an iron cage that has not been emptied by anyone but the crows.
  const gibbet = scene.make.graphics({ x: 0, y: 0 });
  gibbet.fillStyle(0x2a221c).fillRect(3, 2, 3, 34).fillRect(3, 2, 14, 3).fillRect(1, 34, 7, 2);
  gibbet.fillStyle(0x3a3a38).fillRect(13, 5, 1, 4);
  gibbet.fillStyle(0x4a4a46).fillRect(10, 9, 8, 1).fillRect(10, 22, 8, 1).fillRect(10, 9, 1, 14).fillRect(13, 9, 1, 14).fillRect(17, 9, 1, 14);
  gibbet.fillStyle(0xb8b0a0).fillRect(12, 18, 3, 2).fillRect(14, 15, 2, 2);
  gibbet.generateTexture('gibbet', 19, 36); gibbet.destroy();
  // Bones, picked clean.
  const bones = scene.make.graphics({ x: 0, y: 0 });
  bones.fillStyle(0xc8c0ae).fillRect(1, 6, 9, 2).fillRect(4, 3, 2, 8).fillRect(9, 9, 5, 4);
  bones.fillStyle(0x2a2620).fillRect(10, 10, 1, 1).fillRect(12, 10, 1, 1);
  bones.fillStyle(0x7b3a2e).fillRect(11, 12, 2, 1);
  bones.generateTexture('bones', 15, 14); bones.destroy();
  // The stocks: two posts and a board with three holes.
  const stocks = scene.make.graphics({ x: 0, y: 0 });
  stocks.fillStyle(0x2a221c).fillRect(2, 6, 2, 12).fillRect(16, 6, 2, 12);
  stocks.fillStyle(0x4a3828).fillRect(0, 6, 20, 5);
  stocks.fillStyle(0x161210).fillRect(3, 8, 3, 2).fillRect(9, 7, 3, 3).fillRect(14, 8, 3, 2);
  stocks.fillStyle(0x5a2a22).fillRect(9, 11, 2, 2);
  stocks.generateTexture('stocks', 20, 18); stocks.destroy();
  // A crow.
  const crow = scene.make.graphics({ x: 0, y: 0 });
  crow.fillStyle(0x0e0f10).fillRect(0, 2, 3, 1).fillRect(2, 1, 4, 3).fillRect(5, 2, 3, 1).fillRect(3, 0, 2, 1);
  crow.generateTexture('crow', 8, 4); crow.destroy();
  // What the new people work at: the seal's fish cart, the beekeeper's hives, the scribe's lectern, the chaplain's field altar.
  const fishcart = scene.make.graphics({ x: 0, y: 0 });
  fishcart.fillStyle(0x4a3828).fillRect(1, 6, 26, 9);
  fishcart.fillStyle(0x6a5236).fillRect(2, 7, 24, 3);
  for (const x of [4, 11, 18]) fishcart.fillStyle(0x5a4630).fillRect(x, 1, 6, 8).fillStyle(0x3c3326).fillRect(x, 3, 6, 1);
  fishcart.fillStyle(0x2a2420).fillRect(3, 14, 5, 5).fillRect(20, 14, 5, 5);
  fishcart.fillStyle(0x8aa0a8).fillRect(6, 0, 2, 1).fillRect(13, 0, 3, 1);
  fishcart.generateTexture('fishcart', 28, 19); fishcart.destroy();
  const hive = scene.make.graphics({ x: 0, y: 0 });
  hive.fillStyle(0x6a5236).fillRect(2, 13, 12, 3);
  hive.fillStyle(0xb89a5a).fillRect(3, 4, 10, 10);
  hive.fillStyle(0x9a7a42).fillRect(3, 7, 10, 1).fillRect(3, 10, 10, 1);
  hive.fillStyle(0x7a5a2a).fillRect(2, 2, 12, 3);
  hive.fillStyle(0x2a2018).fillRect(7, 12, 2, 2);
  hive.fillStyle(0xd8b840).fillRect(12, 1, 1, 1).fillRect(1, 6, 1, 1);
  hive.generateTexture('hive', 16, 16); hive.destroy();
  const lectern = scene.make.graphics({ x: 0, y: 0 });
  lectern.fillStyle(0x4a3828).fillRect(6, 7, 4, 9);
  lectern.fillStyle(0x6a5236).fillRect(1, 2, 14, 6);
  lectern.fillStyle(0xd8d0b8).fillRect(2, 3, 5, 3).fillRect(9, 3, 5, 3);
  lectern.fillStyle(0x8a3a30).fillRect(7, 5, 2, 3);
  lectern.generateTexture('lectern', 16, 16); lectern.destroy();
  const altar = scene.make.graphics({ x: 0, y: 0 });
  altar.fillStyle(0x5a564e).fillRect(1, 8, 14, 8);
  altar.fillStyle(0x7a766c).fillRect(0, 6, 16, 3);
  altar.fillStyle(0xd8d0b8).fillRect(5, 3, 1, 4).fillRect(10, 3, 1, 4);
  altar.fillStyle(0xf0b34a).fillRect(5, 2, 1, 1).fillRect(10, 2, 1, 1);
  altar.fillStyle(0x8a8a7a).fillRect(7, 1, 2, 5).fillRect(6, 2, 4, 1);
  altar.generateTexture('altar', 16, 16); altar.destroy();
  // A waystone: a standing stone carved with a road that goes nowhere.
  const stone = scene.make.graphics({ x: 0, y: 0 });
  stone.fillStyle(0x3a3a34).fillRect(2, 22, 14, 3);
  stone.fillStyle(0x6a6a62).fillRect(4, 3, 10, 20);
  stone.fillStyle(0x7e7e74).fillRect(5, 2, 8, 4).fillRect(5, 6, 3, 16);
  stone.fillStyle(0x4a4a44).fillRect(8, 8, 2, 12).fillRect(7, 10, 4, 1).fillRect(7, 15, 4, 1);
  stone.generateTexture('waystone', 18, 25); stone.destroy();
  const woken = scene.make.graphics({ x: 0, y: 0 });
  woken.fillStyle(0x3a3a34).fillRect(2, 22, 14, 3);
  woken.fillStyle(0x6a6a62).fillRect(4, 3, 10, 20);
  woken.fillStyle(0x7e7e74).fillRect(5, 2, 8, 4).fillRect(5, 6, 3, 16);
  woken.fillStyle(0xa8d8e0).fillRect(8, 8, 2, 12).fillRect(7, 10, 4, 1).fillRect(7, 15, 4, 1);
  woken.generateTexture('waystone-woken', 18, 25); woken.destroy();
  // Firelight: a soft warm glow that fades to nothing at its edge.
  const glow = scene.textures.createCanvas('firelight', 128, 128)!;
  const ctx = glow.getContext();
  const light = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  light.addColorStop(0, 'rgba(240,170,80,0.55)'); light.addColorStop(0.45, 'rgba(220,130,60,0.22)'); light.addColorStop(1, 'rgba(200,110,50,0)');
  ctx.fillStyle = light; ctx.fillRect(0, 0, 128, 128); glow.refresh();
  // Things that grow wild and can be picked: thyme, mushrooms, and hedge berries.
  const herb = scene.make.graphics({ x: 0, y: 0 });
  herb.fillStyle(0x3e5a32).fillRect(3, 6, 2, 6).fillRect(7, 3, 2, 9).fillRect(11, 5, 2, 7);
  herb.fillStyle(0x6a8a4a).fillRect(2, 5, 4, 2).fillRect(6, 2, 4, 2).fillRect(10, 4, 4, 2);
  herb.fillStyle(0xb89ac8).fillRect(7, 1, 2, 1).fillRect(3, 4, 1, 1).fillRect(12, 3, 1, 1);
  herb.generateTexture('herb', 16, 12); herb.destroy();
  const mushroom = scene.make.graphics({ x: 0, y: 0 });
  mushroom.fillStyle(0xd8ccb0).fillRect(5, 7, 3, 5).fillRect(11, 8, 2, 4);
  mushroom.fillStyle(0x9a6a4a).fillRect(2, 4, 9, 4).fillRect(3, 3, 7, 1);
  mushroom.fillStyle(0xb8865a).fillRect(9, 6, 6, 3);
  mushroom.fillStyle(0xe8dcc0).fillRect(4, 5, 1, 1).fillRect(8, 4, 1, 1);
  mushroom.generateTexture('mushroom', 16, 12); mushroom.destroy();
  const berry = scene.make.graphics({ x: 0, y: 0 });
  berry.fillStyle(0x2e4a2a).fillRect(1, 3, 14, 9);
  berry.fillStyle(0x3e5a32).fillRect(3, 2, 10, 2);
  berry.fillStyle(0x7a2a3a).fillRect(3, 5, 2, 2).fillRect(8, 4, 2, 2).fillRect(11, 7, 2, 2).fillRect(5, 9, 2, 2);
  berry.fillStyle(0xc85a6a).fillRect(3, 5, 1, 1).fillRect(8, 4, 1, 1).fillRect(11, 7, 1, 1);
  berry.generateTexture('berry', 16, 12); berry.destroy();
  // One of the kraken's arms: grey, ridged, studded with suckers.
  const arm = scene.make.graphics({ x: 0, y: 0 });
  arm.fillStyle(0x4a5050).fillRect(0, 5, 44, 8);
  arm.fillStyle(0x6a7070).fillRect(0, 5, 44, 3);
  arm.fillStyle(0x4a5050).fillRect(40, 3, 8, 6).fillRect(46, 1, 2, 4);
  for (const x of [3, 9, 15, 21, 27, 33]) arm.fillStyle(0xb8a898).fillRect(x, 10, 3, 3);
  arm.fillStyle(0x2a3030).fillRect(0, 12, 44, 1);
  arm.generateTexture('kraken-arm', 48, 14); arm.destroy();
  // The one nailed along the harbour quay: as long as a street.
  const long = scene.make.graphics({ x: 0, y: 0 });
  long.fillStyle(0x4a5050).fillRect(0, 6, 150, 12);
  long.fillStyle(0x6a7070).fillRect(0, 6, 150, 4);
  long.fillStyle(0x4a5050).fillRect(146, 4, 10, 8).fillRect(154, 2, 4, 5).fillRect(157, 0, 3, 3);
  for (let x = 4; x < 146; x += 9) long.fillStyle(0xb8a898).fillRect(x, 13, 4, 4).fillStyle(0x8a7a6a).fillRect(x + 1, 14, 2, 2);
  long.fillStyle(0x2a3030).fillRect(0, 17, 150, 1);
  for (const x of [20, 70, 120]) long.fillStyle(0x5a4630).fillRect(x, 2, 3, 18);
  long.generateTexture('kraken-arm-long', 160, 20); long.destroy();
  // The fishery's cage on the weir: iron bars standing in the river.
  const cage = scene.make.graphics({ x: 0, y: 0 });
  cage.fillStyle(0x2a2a2e).fillRect(0, 0, 18, 2).fillRect(0, 18, 18, 2);
  for (const x of [0, 4, 8, 12, 16]) cage.fillStyle(0x3a3a40).fillRect(x, 0, 2, 20);
  cage.fillStyle(0x6a6a70).fillRect(7, 8, 4, 4);
  cage.generateTexture('cage', 18, 20); cage.destroy();
  // The drovers' gate: a five-bar gate with a beam across it.
  const gate = scene.make.graphics({ x: 0, y: 0 });
  for (const y of [2, 6, 10, 14]) gate.fillStyle(0x6a5236).fillRect(0, y, 16, 2);
  gate.fillStyle(0x4a3828).fillRect(0, 0, 2, 16).fillRect(14, 0, 2, 16);
  gate.fillStyle(0x3a2e22).fillRect(0, 7, 16, 3);
  gate.generateTexture('gate', 16, 16); gate.destroy();
  // Charred beams across the lane to the burned farm.
  const barricade = scene.make.graphics({ x: 0, y: 0 });
  barricade.fillStyle(0x1e1814).fillRect(0, 5, 16, 6);
  barricade.fillStyle(0x3a2a20).fillRect(0, 4, 16, 4);
  barricade.fillStyle(0x5a3a28).fillRect(2, 5, 5, 1).fillRect(10, 6, 4, 1);
  barricade.fillStyle(0x2a201a).fillRect(3, 0, 3, 14).fillRect(11, 1, 3, 13);
  barricade.fillStyle(0xd8743a).fillRect(4, 1, 1, 1);
  barricade.generateTexture('barricade', 16, 14); barricade.destroy();
  // One of the dead the hyena's ghouls dragged up from the battlefield.
  const corpse = scene.make.graphics({ x: 0, y: 0 });
  corpse.fillStyle(0x3a4038).fillRect(3, 5, 18, 7);
  corpse.fillStyle(0x4a5a48).fillRect(5, 5, 12, 5);
  corpse.fillStyle(0x8a8a70).fillRect(19, 5, 5, 5);
  corpse.fillStyle(0x6a2a24).fillRect(9, 7, 2, 2);
  corpse.fillStyle(0x2e342c).fillRect(0, 7, 4, 3);
  corpse.generateTexture('corpse', 24, 14); corpse.destroy();
  // The gap where the bridge over the ravine should be.
  const chasm = scene.make.graphics({ x: 0, y: 0 });
  chasm.fillStyle(0x08090a).fillRect(0, 0, 16, 16);
  chasm.fillStyle(0x1a1a18).fillRect(0, 0, 16, 2);
  chasm.generateTexture('chasm', 16, 16); chasm.destroy();
  // A courier who did not make it over the pass, under a snowy cloak.
  const courier = scene.make.graphics({ x: 0, y: 0 });
  courier.fillStyle(0x3a3a40).fillRect(2, 6, 22, 8);
  courier.fillStyle(0x5a4a3a).fillRect(4, 5, 16, 7);
  courier.fillStyle(0xc8ccc8).fillRect(6, 5, 6, 2).fillRect(14, 8, 5, 2);
  courier.fillStyle(0x6a5a44).fillRect(20, 9, 5, 4);
  courier.fillStyle(0xd8d0b8).fillRect(9, 12, 6, 3);
  courier.generateTexture('courier', 26, 16); courier.destroy();
  // Reed beds that hide the otter's run.
  const reeds = scene.make.graphics({ x: 0, y: 0 });
  reeds.fillStyle(0x1a2426).fillRect(0, 10, 16, 6);
  for (const [x, h] of [[1, 14], [4, 16], [7, 12], [10, 15], [13, 13]]) reeds.fillStyle(0x5a6a3a).fillRect(x, 16 - h, 2, h);
  reeds.fillStyle(0x8a7a4a).fillRect(4, 0, 2, 3).fillRect(10, 1, 2, 3);
  reeds.generateTexture('reeds', 16, 16); reeds.destroy();
  // A fallen oak across the woods path, and dark water where the leech waits.
  const log = scene.make.graphics({ x: 0, y: 0 });
  log.fillStyle(0x2a1e14).fillRect(0, 4, 32, 10);
  log.fillStyle(0x4a3a28).fillRect(1, 3, 30, 8);
  log.fillStyle(0x5d4630).fillRect(2, 4, 26, 2);
  log.fillStyle(0x6a5236).fillRect(28, 3, 4, 9);
  log.fillStyle(0x8a6a46).fillRect(29, 5, 2, 5);
  log.fillStyle(0x2c3a24).fillRect(5, 1, 4, 3).fillRect(16, 0, 3, 4);
  log.generateTexture('log', 32, 14); log.destroy();
  const water = scene.make.graphics({ x: 0, y: 0 });
  water.fillStyle(0x0c1618).fillRect(0, 0, 16, 16);
  water.fillStyle(0x1a2a2e).fillRect(2, 4, 6, 1).fillRect(9, 10, 5, 1);
  water.generateTexture('dark-water', 16, 16); water.destroy();
  // A campfire: crossed logs and a low flame.
  const fire = scene.make.graphics({ x: 0, y: 0 });
  fire.fillStyle(0x3a3833).fillRect(1, 11, 14, 3);
  fire.fillStyle(0x5d4630).fillRect(2, 10, 12, 2).fillRect(4, 12, 8, 2);
  fire.fillStyle(0xd8743a).fillRect(5, 5, 6, 6);
  fire.fillStyle(0xf0b34a).fillRect(6, 3, 4, 6);
  fire.fillStyle(0xfff0b2).fillRect(7, 6, 2, 3);
  fire.generateTexture('campfire', 16, 15); fire.destroy();
  // A stray sheep: a woolly cloud on four short legs.
  const sheep = scene.make.graphics({ x: 0, y: 0 });
  sheep.fillStyle(0x27382e).fillRect(3, 17, 16, 2);
  sheep.fillStyle(0x3a3226).fillRect(5, 13, 2, 5).fillRect(9, 13, 2, 5).fillRect(13, 13, 2, 5).fillRect(16, 13, 2, 5);
  sheep.fillStyle(0xe8e2d2).fillRect(3, 5, 15, 9).fillRect(5, 3, 11, 2);
  sheep.fillStyle(0xd8d0bc).fillRect(4, 10, 13, 3);
  sheep.fillStyle(0x3a3226).fillRect(15, 6, 5, 5);
  sheep.fillStyle(0x1e2a24).fillRect(18, 7, 1, 1);
  sheep.generateTexture('sheep', 21, 20); sheep.destroy();
  // A grey heron: long legs, long neck, dagger bill.
  const heron = scene.make.graphics({ x: 0, y: 0 });
  heron.fillStyle(0x27382e).fillRect(5, 23, 10, 2);
  heron.fillStyle(0xd8b04a).fillRect(8, 16, 1, 8).fillRect(11, 16, 1, 8);
  heron.fillStyle(0x8a9298).fillRect(5, 9, 10, 8);
  heron.fillStyle(0x5d666c).fillRect(4, 11, 4, 6);
  heron.fillStyle(0xd8dcd8).fillRect(11, 2, 3, 8);
  heron.fillStyle(0xe8ece8).fillRect(11, 1, 4, 3);
  heron.fillStyle(0x1e2a24).fillRect(13, 1, 4, 1).fillRect(13, 2, 1, 1);
  heron.fillStyle(0xd8b04a).fillRect(15, 2, 4, 1);
  heron.generateTexture('heron', 20, 26); heron.destroy();
  // A tangle of brambles across the road, and the lamb's lost bell.
  const brambles = scene.make.graphics({ x: 0, y: 0 });
  brambles.fillStyle(0x2c3a24).fillRect(0, 2, 16, 14);
  brambles.fillStyle(0x4a3b2a).fillRect(0, 5, 16, 2).fillRect(2, 0, 2, 16).fillRect(9, 1, 2, 15).fillRect(0, 11, 16, 2).fillRect(13, 3, 2, 12);
  brambles.fillStyle(0x6d8a45).fillRect(5, 3, 3, 2).fillRect(11, 8, 3, 2).fillRect(4, 13, 3, 2);
  brambles.fillStyle(0xc7b88a).fillRect(1, 4, 1, 1).fillRect(7, 6, 1, 1).fillRect(12, 10, 1, 1).fillRect(5, 12, 1, 1).fillRect(15, 6, 1, 1);
  brambles.fillStyle(0x7a3a4a).fillRect(6, 9, 2, 2).fillRect(14, 13, 1, 1);
  brambles.generateTexture('brambles', 16, 16); brambles.destroy();
  const bell = scene.make.graphics({ x: 0, y: 0 });
  bell.fillStyle(0x9c6b5a).fillRect(1, 1, 8, 1);
  bell.fillStyle(0xc89b4a).fillRect(3, 2, 4, 5).fillRect(2, 5, 6, 2);
  bell.fillStyle(0xf0d58a).fillRect(4, 3, 1, 2);
  bell.fillStyle(0x5a4330).fillRect(4, 7, 2, 1);
  bell.generateTexture('bell', 10, 9); bell.destroy();
  // An oilcloth bundle: something someone meant to come back for.
  const cache = scene.make.graphics({ x: 0, y: 0 });
  cache.fillStyle(0x3a3226).fillRect(1, 4, 12, 7);
  cache.fillStyle(0x6a6a52).fillRect(1, 3, 12, 6);
  cache.fillStyle(0x8a8a6a).fillRect(2, 3, 10, 2);
  cache.fillStyle(0x8c6a3a).fillRect(6, 2, 2, 8).fillRect(1, 6, 12, 1);
  cache.generateTexture('cache', 14, 12); cache.destroy();
  const cup = scene.make.graphics({ x: 0, y: 0 });
  cup.fillStyle(0xc89b4a).fillRect(1, 0, 8, 1).fillRect(2, 1, 6, 4).fillRect(4, 5, 2, 3).fillRect(2, 8, 6, 1);
  cup.fillStyle(0xf0d58a).fillRect(3, 1, 1, 3);
  cup.fillStyle(0x7b3a2e).fillRect(5, 2, 2, 1);
  cup.generateTexture('cup', 10, 9); cup.destroy();
}
