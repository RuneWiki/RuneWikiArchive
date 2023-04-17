import bz2 from 'bz2';
import compressjs from 'compressjs';
const { Bzip2 } = compressjs;
import { ByteBuffer } from '#util/ByteBuffer.js';

export function decompressBz2(data, prepend = true) {
    if (data.raw) {
        data = data.raw;
    }

    if (data[0] != 0x42 || data[1] != 0x5A || data[2] != 0x68 || data[3] != 0x31) {
        if (prepend) {
            let temp = new Uint8Array(data.length + 4);
            temp.set(Uint8Array.from([0x42, 0x5A, 0x68, 0x31]));
            temp.set(data, 4);
            return bz2.decompress(temp);
        } else {
            data[0] = 0x42;
            data[1] = 0x5A;
            data[2] = 0x68;
            data[3] = 0x31;
        }
    }

    return bz2.decompress(data);
}

export function compressBz2(data, prependLength = true) {
    let compressed = new ByteBuffer(Bzip2.compressFile(data));
    if (prependLength) {
        compressed.writeDWord(data.length);
    } else {
        compressed = compressed.slice(4); // remove BZip header
    }
    return compressed.raw;
}
