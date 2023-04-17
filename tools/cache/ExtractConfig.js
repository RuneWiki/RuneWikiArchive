import fs from 'fs';
import FileArchive from '#cache/FileArchive.js';

import FloorType from '#config/FloorType.js';
import IdentityKitType from '#config/IdentityKitType.js';
import LocationType from '#config/LocationType.js';
import NpcType from '#config/NpcType.js';
import ObjectType from '#config/ObjectType.js';
import SequenceType from '#config/SequenceType.js';
import SpotAnimationType from '#config/SpotAnimationType.js';
import VarpType from '#config/VarpType.js';
import SequenceBase from '#cache/SequenceBase.js';
import SequenceFrame from '#cache/SequenceFrame.js';
import { FileStore } from '#formats/FileStore.js';

fs.mkdirSync('dump/config', { recursive: true });

let models = FileArchive.fromFile('data/cache/models');
// SequenceBase.unpack(models); // needed for SequenceFrame
// SequenceFrame.unpack(models); // needed for SequenceType

let cache = new FileStore('dump/packed/337');
let config = new FileArchive(cache.read(0, 2, false));

// let config = FileArchive.fromFile('data/cache/config');

FloorType.unpack(config.read('flo.dat'), config.read('flo.idx'));
IdentityKitType.unpack(config.read('idk.dat'), config.read('idk.idx'));
LocationType.unpack(config.read('loc.dat'), config.read('loc.idx'));
NpcType.unpack(config.read('npc.dat'), config.read('npc.idx'));
ObjectType.unpack(config.read('obj.dat'), config.read('obj.idx'));
// SequenceType.unpack(config.read('seq.dat'), config.read('seq.idx'));
SpotAnimationType.unpack(config.read('spotanim.dat'), config.read('spotanim.idx'));
VarpType.unpack(config.read('varp.dat'), config.read('varp.idx'));

// fs.mkdirSync('dump/config/floor', { recursive: true });
// for (let i = 0; i < FloorType.count; i++) {
//     let floor = new FloorType(i);
//     if (floor == null) {
//         continue;
//     }

//     fs.writeFileSync(`dump/config/floor/${i}.json`, JSON.stringify(floor, null, 2));
// }
// fs.writeFileSync('dump/config/flo.def', FloorType.toJagConfig());

// fs.mkdirSync('dump/config/idk', { recursive: true });
// for (let i = 0; i < IdentityKitType.count; i++) {
//     let idk = new IdentityKitType(i);
//     if (idk == null) {
//         continue;
//     }

//     fs.writeFileSync(`dump/config/idk/${i}.json`, JSON.stringify(idk, null, 2));
// }
// fs.writeFileSync('dump/config/idk.def', IdentityKitType.toJagConfig());

// fs.mkdirSync('dump/config/loc', { recursive: true });
// for (let i = 0; i < LocationType.count; i++) {
//     let loc = new LocationType(i);
//     if (loc == null) {
//         continue;
//     }

//     fs.writeFileSync(`dump/config/loc/${i}.json`, JSON.stringify(loc, null, 2));
// }
fs.writeFileSync('dump/config/loc.def', LocationType.toJagConfig());

// fs.mkdirSync('dump/config/npc', { recursive: true });
// for (let i = 0; i < NpcType.count; i++) {
//     let npc = new NpcType(i);
//     if (npc == null) {
//         continue;
//     }

//     fs.writeFileSync(`dump/config/npc/${i}.json`, JSON.stringify(npc, null, 2));
// }
// fs.writeFileSync('dump/config/npc.def', NpcType.toJagConfig());

// fs.mkdirSync('dump/config/obj', { recursive: true });
// for (let i = 0; i < ObjectType.count; i++) {
//     let obj = new ObjectType(i);
//     if (obj == null) {
//         continue;
//     }

//     fs.writeFileSync(`dump/config/obj/${i}.json`, JSON.stringify(obj, null, 2));
// }
// fs.writeFileSync('dump/config/obj.def', ObjectType.toJagConfig());

// fs.mkdirSync('dump/config/seq', { recursive: true });
// for (let i = 0; i < SequenceType.count; i++) {
//     let seq = new SequenceType(i);
//     if (seq == null) {
//         continue;
//     }

//     fs.writeFileSync(`dump/config/seq/${i}.json`, JSON.stringify(seq, null, 2));
// }
// fs.writeFileSync('dump/config/seq.def', SequenceType.toJagConfig());

// fs.mkdirSync('dump/config/spotanim', { recursive: true });
// for (let i = 0; i < SpotAnimationType.count; i++) {
//     let spotanim = new SpotAnimationType(i);
//     if (spotanim == null) {
//         continue;
//     }

//     fs.writeFileSync(`dump/config/spotanim/${i}.json`, JSON.stringify(spotanim, null, 2));
// }
// fs.writeFileSync('dump/config/spotanim.def', SpotAnimationType.toJagConfig());

// fs.mkdirSync('dump/config/varp', { recursive: true });
// for (let i = 0; i < VarpType.count; i++) {
//     let varp = new VarpType(i);
//     if (varp == null) {
//         continue;
//     }

//     fs.writeFileSync(`dump/config/varp/${i}.json`, JSON.stringify(varp, null, 2));
// }
// fs.writeFileSync('dump/config/varp.def', VarpType.toJagConfig());
