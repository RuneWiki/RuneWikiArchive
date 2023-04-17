import fs from 'fs';
import zlib from 'zlib';
import { ByteBuffer } from '#util/ByteBuffer.js';
import { FileStore } from '#formats/FileStore.js';

if (process.argv.length < 2) {
    process.exit(1);
}

let store = new FileStore(process.argv[2]);
fs.writeFileSync('dump/cache.json', JSON.stringify(store.midis, null, 2));

fs.mkdirSync('dump/extract/3', { recursive: true });
for (let i = 0; i < store.count(3); i++) {
    let data = store.read(3, i, true);
    if (data) {
        fs.writeFileSync(`dump/extract/3/${i}`, data.raw);
    }
}
