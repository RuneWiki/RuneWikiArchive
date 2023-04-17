import compressjs from 'compressjs';
const { Bzip2 } = compressjs;
import fs from 'fs';

import { ByteBuffer } from 'utility.js';
import { getBase37, fromBase37 } from '../util/Base37.js';

ByteBuffer.setGlobalEndianness(false);

if (!fs.existsSync('www/songs')) {
    fs.mkdirSync('www/songs');
}

// let files = fs.readdirSync('dump/midi-named/jingles');
// for (let i = 0; i < files.length; ++i) {
//     let file = fs.readFileSync('dump/midi-named/jingles/' + files[i]);
//     let data = Bzip2.compressFile(file).slice(4);
//     let stream = new ByteBuffer(data).prepend(new Uint8Array(4));
//     stream.writeDWord(file.length);
//     // let name = fromBase37(getBase37(files[i]));
//     // console.log(name);
//     fs.writeFileSync('data/midis/' + files[i] + '.bz2', stream.raw);
// }

// let files = fs.readdirSync('dump/midi-named/src-289');
// for (let i = 0; i < files.length; ++i) {
//     let file = fs.readFileSync('dump/midi-named/songs/' + files[i]);
//     let data = Bzip2.compressFile(file).slice(4);
//     let stream = new ByteBuffer(data).prepend(new Uint8Array(4));
//     stream.writeDWord(file.length);
//     fs.writeFileSync('www/songs/' + files[i], stream.raw);
// }

// let files = fs.readdirSync('www/songs');
// for (let i = 0; i < files.length; ++i) {
//     let file = fs.readFileSync('www/songs/' + files[i]);
//     let name = files[i].split('.')[0];
//     fs.renameSync('www/songs/' + files[i], 'www/songs/' + name.replace(' ', '_') + '_' + ByteBuffer.crc32(file) + '.mid');
// }
