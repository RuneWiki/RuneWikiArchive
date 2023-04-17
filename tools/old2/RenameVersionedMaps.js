import fs from 'fs';
import { } from 'dotenv/config';
import bz2 from 'bz2';

import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);
ByteBuffer.setGlobalTerminator('\n');

const BZIP2_HEADER = new Uint8Array([0x42, 0x5A, 0x68, 0x31]);

// let maps = fs.readdirSync('dump/later');
// maps.forEach(file => {
//     let version = file.split('.')[1];
//     let newPath = 'dump/later/v' + version + '/' + file.substring(0, file.lastIndexOf('.'));

//     fs.mkdirSync('dump/later/v' + version, { recursive: true });
//     fs.renameSync('dump/later/' + file, newPath);

//     let data = new ByteBuffer(bz2.decompress(ByteBuffer.fromFile(newPath).write(BZIP2_HEADER).raw));
//     fs.writeFileSync(newPath, data.raw);
// });

let maps = fs.readdirSync('dump/maps');
maps.forEach(file => {
    let version = 1;
    let newPath = 'dump/maps/v' + version + '/' + file;

    fs.mkdirSync('dump/maps/v' + version, { recursive: true });
    fs.renameSync('dump/maps/' + file, newPath);

    let data = new ByteBuffer(bz2.decompress(ByteBuffer.fromFile(newPath).write(BZIP2_HEADER).raw));
    fs.writeFileSync(newPath, data.raw);
});
