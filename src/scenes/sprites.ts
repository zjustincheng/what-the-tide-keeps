import type Phaser from 'phaser';

type Ears = 'long' | 'wool' | 'horns' | 'antlers' | 'pointed';
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
  guard: { fur: 0xd6cdb8, muzzle: 0x9a8a72, cloth: 0x6b7a8a, trim: 0xd8cfae, ears: 'horns' },
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
