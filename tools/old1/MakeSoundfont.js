import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);
ByteBuffer.setGlobalTerminator('\n');

import { FileArchive } from '../util/FileArchive.js';
import fs from 'fs';
let archive = new FileArchive();
archive.add('soundfont', fs.readFileSync('data/soundfont.sf2'));
fs.writeFileSync('www/archives/soundfont', archive.write());
