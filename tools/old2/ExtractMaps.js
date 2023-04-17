import { ByteBuffer } from 'utility.js';
import bz2 from 'bz2';
import fs from 'fs';

ByteBuffer.setGlobalEndianness(false);

const BZIP2_HEADER = new Uint8Array([0x42, 0x5A, 0x68, 0x31]);

let maps = fs.readdirSync('data/cache/225/songs');
maps.map(x => {
    let stats = fs.statSync('data/cache/225/songs/' + x);
    let stream = ByteBuffer.fromFile('data/cache/225/songs/' + x);
    stream.write(BZIP2_HEADER);
    let raw = bz2.decompress(stream.raw);
    fs.writeFileSync('data/cache/225/songs-raw/' + x, raw);
    fs.utimesSync('data/cache/225/songs-raw/' + x, stats.mtime, stats.mtime);
});
