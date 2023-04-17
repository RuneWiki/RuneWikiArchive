import bz2 from 'bz2';
import compressjs from 'compressjs';
const { Bzip2 } = compressjs;

import { ByteBuffer } from '#util/ByteBuffer.js';
import { decompressBz2 } from '#util/Bzip2.js';

const BZIP2_HEADER = new Uint8Array([0x42, 0x5A, 0x68, 0x31]);

export class FileArchive {
    data;
    files = {};
    count = 0;
    isCompressedWhole = false;
    queue = [];

    static from(data) {
        const archive = new FileArchive();
        archive.parse(data);
        return archive;
    }

    static fromFile(path) {
        const archive = new FileArchive();
        archive.parse(ByteBuffer.fromFile(path));
        return archive;
    }

    static genHash(name) {
        let hash = new DataView(new ArrayBuffer(4));
        name = name.toUpperCase();
        for (let i = 0; i < name.length; ++i) {
            hash.setInt32(0, hash.getInt32() * 61 + name.charCodeAt(i) - 32);
        }
        return hash.getInt32();
    }

    static genHashOld(string) {
        string = string.trim();
        let l = 0n;
        for (let loop = 0; loop < string.length && loop < 12; loop++) {
            let c = string[loop];
            let i = string.charCodeAt(loop);
            l *= 37n;
            if (c >= 'A' && c <= 'Z') {
                l += BigInt(1 + i - 0x41);
            } else if (c >= 'a' && c <= 'z') {
                l += BigInt(1 + i - 0x61);
            } else if (c >= '0' && c <= '9') {
                l += BigInt(33 + i - 0x30);
            }
        }
        return l;
    }

    parse(data) {
        let unpackedSize = data.readSWord();
        let packedSize = data.readSWord();

        this.isCompressedWhole = unpackedSize != packedSize;

        if (this.isCompressedWhole) {
            data = new ByteBuffer(decompressBz2(data.read()));
        }

        let fileCount = data.readWord();
        this.count = fileCount;

        let offset = data.offset + (fileCount * 10);
        for (let i = 0; i < fileCount; ++i) {
            const hash = data.readDWordSigned();
            let file = {};
            file.uncompressedSize = data.readSWord();
            file.compressedSize = data.readSWord();
            file.offset = offset;
            offset += file.compressedSize;
            this.files[hash] = file;
        }

        this.data = data;
    }

    read(name, nameIsHash = false) {
        let hash = name;
        if (!nameIsHash) {
            hash = FileArchive.genHash(name);
        }
        if (!this.files[hash]) {
            return new Uint8Array();
        }

        this.data.front().seek(this.files[hash].offset);
        let data = this.data.read(this.files[hash].compressedSize);
        if (!this.isCompressedWhole || this.files[hash].compressedSize != this.files[hash].uncompressedSize) {
            data = new ByteBuffer(decompressBz2(data.read()));
        }
        return data;
    }

    add(name, data) {
        this.queue[name] = data;
    }

    write() {
        let names = Object.keys(this.queue);
        let files = Object.values(this.queue);
        let offsets = [];
        let sizes = [];

        let isCompressedWhole = names.length < 2;

        // write data
        let data = new ByteBuffer();
        for (let i = 0; i < names.length; ++i) {
            offsets.push(data.offset);
            if (isCompressedWhole) {
                data.write(files[i]);
            } else {
                console.log('Compressing', names[i]);
                let file = Bzip2.compressFile(files[i]).slice(4);
                data.write(file);
                sizes.push(file.length);
            }
        }

        // write header
        let header = new ByteBuffer();
        header.writeWord(names.length);
        for (let i = 0; i < names.length; ++i) {
            header.writeDWord(FileArchive.genHash(names[i]));
            header.writeSWord(files[i].length);
            if (isCompressedWhole) {
                header.writeSWord(files[i].length);
            } else {
                header.writeSWord(sizes[i]);
            }
        }

        // write archive
        let archiveData = new ByteBuffer();
        archiveData.write(header.raw);
        archiveData.write(data.raw);
        let unpackedSize = archiveData.length;
        let packedSize = archiveData.length;
        if (isCompressedWhole) {
            archiveData = new ByteBuffer(Bzip2.compressFile(archiveData.raw).slice(4));
            packedSize = archiveData.length;
        }

        let archive = new ByteBuffer();
        archive.writeSWord(unpackedSize);
        archive.writeSWord(packedSize);
        archive.write(archiveData.raw);

        this.queue = [];
        this.parse(archive.front());
        return archive.raw;
    }
}
