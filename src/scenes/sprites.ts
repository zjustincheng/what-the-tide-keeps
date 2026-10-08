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
}
