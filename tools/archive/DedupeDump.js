import fs from 'fs';
import { ByteBuffer } from '#util/ByteBuffer.js';
import { FileStore } from '#formats/FileStore.js';

const cache = new FileStore('dump/packed/289');
const type = 'midis';

console.log('Precalculating CRCs');
let crc1 = {};
let crc2 = {};
const files = fs.readdirSync(`dump/cache/${type}`)
files.forEach(name => {
    const file = ByteBuffer.fromFile(`dump/cache/${type}/${name}`);
    crc1[name] = ByteBuffer.crc32(file);
    crc2[name] = ByteBuffer.crc32(file.slice(0, file.length - 2));
});
console.log('Deduplicating');

cache[type].filter(map => map.version != -1).forEach(map => {
    const target = map.crc;

    for (let i = 0; i < files.length; ++i) {
        const name = files[i];
        if (!fs.existsSync(`dump/cache/${type}/${name}`)) {
            continue;
        }

        let crc = crc1[name];
        if (crc != target) {
            crc = crc2[name];
        }

        if (crc == target && name != target && fs.existsSync(`dump/cache/${type}/${target}`)) {
            console.log('Also exists as normal, removing copy', target, name);
            fs.unlinkSync(`dump/cache/${type}/${name}`);
        }
    };
});
