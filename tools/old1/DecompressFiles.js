import fs from 'fs';
import bz2 from 'bz2';

import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);

const BZIP2_HEADER = new Uint8Array([0x42, 0x5A, 0x68, 0x31]);

let oldPath = 'data/rev1/';
let old = fs.readdirSync(oldPath);
let newPath = 'data/';
for (let i = 0; i < old.length; ++i) {
    console.log(old[i]);
    let raw = bz2.decompress(new ByteBuffer(fs.readFileSync(oldPath + old[i]).slice(4)).prepend(BZIP2_HEADER).raw);

    let time = fs.statSync(oldPath + old[i]).mtime;
    fs.writeFileSync(newPath + old[i], raw);
    fs.utimesSync(newPath + old[i], time, time);
}
