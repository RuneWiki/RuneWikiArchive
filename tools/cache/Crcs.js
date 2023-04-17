import fs from 'fs';
import zlib from 'zlib';
import { ByteBuffer } from '#util/ByteBuffer.js';
import { FileStore } from '#formats/FileStore.js';

if (process.argv.length < 2) {
    process.exit(1);
}

let files = fs.readdirSync(process.argv[2]);

for (let file of files) {
    console.log(file, ByteBuffer.crc32(ByteBuffer.fromFile(process.argv[2] + '/' + file)));
}
