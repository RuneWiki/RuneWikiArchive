import { ByteBuffer } from 'utility.js';
import bz2 from 'bz2';
import fs from 'fs';
import zlib from 'zlib';

ByteBuffer.setGlobalEndianness(false);

let maps = fs.readdirSync('data/cache/225/songs-raw');
maps.map(x => {
    if (x.indexOf('.gz') !== -1) {
        return;
    }

    let stats = fs.statSync('data/cache/225/songs-raw/' + x);

    let compressed = zlib.gzipSync(fs.readFileSync('data/cache/225/songs-raw/' + x));
    compressed[9] = 0;

    let stream = new ByteBuffer(compressed);
    stream.offset = stream.length;
    stream.writeWord(2);

    fs.writeFileSync('data/cache/225/songs-raw/225.3-' + x + '.gz', stream.raw);
    fs.utimesSync('data/cache/225/songs-raw/225.3-' + x + '.gz', stats.mtime, stats.mtime);
});
