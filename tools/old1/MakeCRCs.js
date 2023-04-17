import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);
ByteBuffer.setGlobalTerminator('\n');

import fs from 'fs';

let stream = new ByteBuffer();
stream.writeDWord(0);
stream.writeDWord(ByteBuffer.crc32(fs.readFileSync('www/archives/title')));
stream.writeDWord(ByteBuffer.crc32(fs.readFileSync('www/archives/config')));
stream.writeDWord(ByteBuffer.crc32(fs.readFileSync('www/archives/interface')));
stream.writeDWord(ByteBuffer.crc32(fs.readFileSync('www/archives/media')));
stream.writeDWord(ByteBuffer.crc32(fs.readFileSync('www/archives/models')));
stream.writeDWord(ByteBuffer.crc32(fs.readFileSync('www/archives/textures')));
stream.writeDWord(ByteBuffer.crc32(fs.readFileSync('www/archives/wordenc')));
stream.writeDWord(ByteBuffer.crc32(fs.readFileSync('www/archives/sounds')));
stream.writeDWord(ByteBuffer.crc32(fs.readFileSync('www/archives/soundfont')));
fs.writeFileSync('www/archives/crc', stream.raw);
