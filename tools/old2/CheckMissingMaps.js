import fs from 'fs';
import zlib from 'zlib';
import compressjs from 'compressjs';
const { Bzip2 } = compressjs;

import { FileStore } from '../src/util/FileStore.js';

import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);
ByteBuffer.setGlobalTerminator('\n');

const BZIP2_HEADER = new Uint8Array([0x42, 0x5A, 0x68, 0x31]);

let cache = new FileStore('data/cache/254');

// let size = cache.count(4);
// for (let i = 0; i < size; ++i) {
//     let file = cache.read(4, i);
//     if (!file) {
//         continue;
//     }
 
//     let realVersion = file.data.back().seek(-2).readWord() - 1;

//     if (!fs.existsSync(`dump/raw-maps/${i}.${realVersion}`)) {
//         let rawData = zlib.gunzipSync(file.data.raw);
//         let data = new ByteBuffer(Bzip2.compressFile(rawData).slice(4)).prepend(new Uint8Array(4));
//         data.writeDWord(rawData.length);
//         fs.writeFileSync(`dump/raw-maps/${i}.${realVersion}`, data.raw);
//     }
// }

let config = cache.read(0, 5, true);

let mapVersion = config.read('map_version');
let versions = [];
for (let i = 0; i < mapVersion.length / 2; ++i) {
    versions[i] = mapVersion.readWord() - 1;
}

let mapIndex = config.read('map_index');

let maps = [];
for (let i = 0; i < mapIndex.length / 7; ++i) {
    let map = {};
    map.region = mapIndex.readWord();
    map.x = (map.region >> 8) & 0xFF;
    map.y = map.region & 0xFF;
    map.land = mapIndex.readWord();
    map.landVersion = versions[map.land];
    map.loc = mapIndex.readWord();
    map.locVersion = versions[map.loc];
    map.prefetch = mapIndex.readByte();
    maps[i] = map;
}

// fs.writeFileSync('dump/maps.json', JSON.stringify(maps, null, 2));

// // process.exit(0);

let count = 0;
maps.map(map => {
    let land = cache.read(4, map.land);
    let loc = cache.read(4, map.loc);

    let missing = 0;
    if (!land) {
        missing |= 1;
    } else {
        let realVersion = land.data.back().seek(-2).readWord() - 1;

        if (!fs.existsSync(`dump/raw-maps/m${map.x}_${map.y}.${realVersion}`)) {
            let rawData = zlib.gunzipSync(land.data.raw);
            let data = new ByteBuffer(Bzip2.compressFile(rawData).slice(4)).prepend(new Uint8Array(4));
            data.writeDWord(rawData.length);
            fs.writeFileSync(`dump/raw-maps/m${map.x}_${map.y}.${realVersion}`, data.raw);
        }
    }

    if (!loc) {
        missing |= 2;
    } else {
        let realVersion = loc.data.back().seek(-2).readWord() - 1;

        if (!fs.existsSync(`dump/raw-maps/l${map.x}_${map.y}.${realVersion}`)) {
            let rawData = zlib.gunzipSync(loc.data.raw);
            let data = new ByteBuffer(Bzip2.compressFile(rawData).slice(4)).prepend(new Uint8Array(4));
            data.writeDWord(rawData.length);
            fs.writeFileSync(`dump/raw-maps/l${map.x}_${map.y}.${realVersion}`, data.raw);
        }
    }

    let x = map.region >> 8;
    let y = map.region & 0xFF;
    if (missing & 1) {
        count++;
        console.log('Missing land for', map.region, `(${x}, ${y}) ver. ${map.landVersion}`);
    }
    if (missing & 2) {
        count++;
        console.log('Missing loc for', map.region, `(${x}, ${y}) ver. ${map.locVersion}`);
    }
});
console.log(count);
