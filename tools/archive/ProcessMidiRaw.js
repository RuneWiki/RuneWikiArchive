import fs from 'fs';
import { ByteBuffer } from '#util/ByteBuffer.js';
import child_process from 'child_process';
import zlib from 'zlib';

if (process.argv.length < 2) {
    process.exit(1);
}

const type = 'midis';

function jagexGzip(path) {
    child_process.execSync(`java -jar data/JagCompress.jar ${path}`);
    let compressed = ByteBuffer.fromFile(path + '.gz');
    fs.unlinkSync(path + '.gz');
    return compressed;
}

let total = 0;
let count = 0;
const files = fs.readdirSync('dump/cache/raw').filter(file => !file.endsWith('.gz') && !file.endsWith('.riff'));

files.forEach(file => {
    // const compressed = new ByteBuffer(zlib.gzipSync(ByteBuffer.fromFile(`dump/cache/raw/${file}`).raw));
    // compressed.raw[9] = 0;

    const compressed = jagexGzip(`dump/cache/raw/${file}`);
    const crc = ByteBuffer.crc32(compressed);

    // Ran across one RIFF-prefixed MIDI:
    // const raw = ByteBuffer.fromFile(`dump/cache/raw/${file}`);
    // let riff = new ByteBuffer();
    // riff.write(ByteBuffer.fromHex('52 49 46 46')); // RIFF
    // riff.writeDWord(raw.length + 8, true);
    // riff.write(ByteBuffer.fromHex('52 4D 49 44 64 61 74 61')); // RMIDdata
    // riff.writeDWord(raw.length, true);
    // riff.write(raw);
    // riff.toFile(`dump/cache/raw/${file}.riff`);
    // const riffCompressed = jagexGzip(`dump/cache/raw/${file}.riff`);
    // const riffCrc = ByteBuffer.crc32(riffCompressed);

    if (!fs.existsSync(`dump/cache/${type}/${crc}`)) {
        compressed.toFile(`dump/cache/${type}/${crc}`);
        count++;
    }

    total++;
    fs.unlinkSync(`dump/cache/raw/${file}`);
});

console.log(`Added ${count} new ${type}. Processed ${total} files.`);
