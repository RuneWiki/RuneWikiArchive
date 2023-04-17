import fs from 'fs';
import { ByteBuffer } from 'utility.js';
import { FileArchive } from '../src/util/FileArchive.js';

ByteBuffer.setGlobalEndianness(false);

let files = fs.readdirSync('data/src/lostcity');
let lostcity = new FileArchive();
files.map(x => {
    lostcity.add(x, fs.readFileSync('data/src/lostcity/' + x));
});
fs.writeFileSync('www/archives/lostcity', lostcity.write());

let crcs = new ByteBuffer();
crcs.writeDWord(0);
crcs.writeDWord(ByteBuffer.crc32(ByteBuffer.fromFile('www/archives/title').raw));
crcs.writeDWord(ByteBuffer.crc32(ByteBuffer.fromFile('www/archives/config').raw));
crcs.writeDWord(ByteBuffer.crc32(ByteBuffer.fromFile('www/archives/interface').raw));
crcs.writeDWord(ByteBuffer.crc32(ByteBuffer.fromFile('www/archives/media').raw));
crcs.writeDWord(ByteBuffer.crc32(ByteBuffer.fromFile('www/archives/models').raw));
crcs.writeDWord(ByteBuffer.crc32(ByteBuffer.fromFile('www/archives/textures').raw));
crcs.writeDWord(ByteBuffer.crc32(ByteBuffer.fromFile('www/archives/wordenc').raw));
crcs.writeDWord(ByteBuffer.crc32(ByteBuffer.fromFile('www/archives/sounds').raw));
crcs.writeDWord(ByteBuffer.crc32(ByteBuffer.fromFile('www/archives/soundfont').raw));
crcs.writeDWord(ByteBuffer.crc32(ByteBuffer.fromFile('www/archives/lostcity').raw));
fs.writeFileSync('www/archives/crc', crcs.raw);
