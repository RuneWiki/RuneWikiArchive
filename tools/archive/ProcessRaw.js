import fs from 'fs';
import { ByteBuffer } from '#util/ByteBuffer.js';
import child_process from 'child_process';

let args = process.argv.slice(2);
if (args.length < 1) {
    process.exit(1);
}

const type = args[0];

async function jagexGzipAll(paths) {
    for (let i = 0; i < paths.length; i += 50) {
        child_process.execSync(`java -jar JagCompress.jar ${paths.slice(i, i + 50).join(' ')}`);
    }
}

let total = 0;
let count = 0;
const files = fs.readdirSync('dump/cache/raw').filter(file => !file.endsWith('.gz'));

await jagexGzipAll(files.map(file => `dump/cache/raw/${file}`));

// l44_52 -1025816876
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
