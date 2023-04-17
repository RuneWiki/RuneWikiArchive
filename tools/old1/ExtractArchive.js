import { ByteBuffer } from 'utility.js';
import { FileArchive } from '../util/FileArchive.js';
import fs from 'fs';
import bz2 from 'bz2';

ByteBuffer.setGlobalEndianness(false);

let stream = new ByteBuffer(fs.readFileSync('data/2005-02-07.jag'));
let archive = new FileArchive(stream);
fs.writeFileSync('data/b12_full.dat', archive.read('b12_full.dat').raw);
fs.writeFileSync('data/index.dat', archive.read('index.dat').raw);
