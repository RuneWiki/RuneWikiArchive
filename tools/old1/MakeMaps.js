import compressjs from 'compressjs';
const { Bzip2 } = compressjs;
import fs from 'fs';

import { ByteBuffer } from 'utility.js';

ByteBuffer.setGlobalEndianness(false);

import { FileStore } from '../util/FileStore.js';

let cache = new FileStore('dump/289');

let config = cache.read(0, 5, true);
let index = config.read('map_index');
let map_count = index.length / 7;
let maps = [];
for (let i = 0; i < map_count; ++i) {
    let id = index.readWord();
    let land = index.readWord();
    let loc = index.readWord();
    let prefetched = index.readByte();
    maps.push({ id, land, loc });
}

if (!fs.existsSync('dump/maps')) {
    fs.mkdirSync('dump/maps');
}

for (let i = 0; i < maps.length; ++i) {
    let map = maps[i];
    let x = map.id >> 8;
    let y = map.id & 0xFF;
    // if (!fs.existsSync(`dump/maps/m${x}_${y}`))
    {
        let land = cache.read(4, map.land, true).data;
        let data = new ByteBuffer(Bzip2.compressFile(land).slice(4)).prepend(new Uint8Array(4));
        data.writeDWord(land.length);
        fs.writeFileSync(`dump/maps/m${x}_${y}`, data.raw);
        console.log('New land', x, y);
    }
    // if (!fs.existsSync(`dump/maps/l${x}_${y}`))
    {
        let loc = cache.read(4, map.loc, true).data;
        let data = new ByteBuffer(Bzip2.compressFile(loc).slice(4)).prepend(new Uint8Array(4));
        data.writeDWord(loc.length);
        fs.writeFileSync(`dump/maps/l${x}_${y}`, data.raw);
        console.log('New loc', x, y);
    }
}
