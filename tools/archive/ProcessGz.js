import fs from 'fs';
import zlib from 'zlib';
import { ByteBuffer } from '#util/ByteBuffer.js';

if (process.argv.length < 2) {
    process.exit(1);
}

const type = process.argv[2];

let total = 0;
let count = 0;
fs.readdirSync('dump/cache/raw').forEach(file => {
    let data = fs.readFileSync('dump/cache/raw/' + file);
    data = data.subarray(0, data.length - 2);

    const crc = ByteBuffer.crc32(data);
    if (!fs.existsSync(`dump/cache/${type}/${crc}`)) {
        fs.writeFileSync(`dump/cache/${type}/${crc}`, data);
        count++;
    }

    total++;
    // fs.unlinkSync(`dump/cache/raw/${file}`);
});

console.log(`Added ${count} new ${type}. Processed ${total} files.`);
