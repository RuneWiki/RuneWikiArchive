import fs from 'fs';
import { ByteBuffer } from '#util/ByteBuffer.js';
import child_process from 'child_process';

if (process.argv.length < 2) {
    process.exit(1);
}

const type = process.argv[2];

async function jagexGzipAll(paths) {
    for (let i = 0; i < paths.length; i += 50) {
        child_process.execSync(`java -jar data/JagCompress.jar ${paths.slice(i, i + 50).join(' ')}`);
    }
}

let total = 0;
let count = 0;
const files = fs.readdirSync('dump/cache/raw').filter(file => !file.endsWith('.gz'));

await jagexGzipAll(files.map(file => `dump/cache/raw/${file}`));

// l48_61 -395015746
files.forEach(file => {
    const compressed = ByteBuffer.fromFile(`dump/cache/raw/${file}.gz`);
    const crc = ByteBuffer.crc32(compressed);

    console.log(file, crc);
    if (!fs.existsSync(`dump/cache/${type}/${crc}`)) {
        compressed.toFile(`dump/cache/${type}/${crc}`);
        count++;
    }

    total++;
    fs.unlinkSync(`dump/cache/raw/${file}.gz`);
    fs.unlinkSync(`dump/cache/raw/${file}`);
});

console.log(`Added ${count} new ${type}. Processed ${total} files.`);
