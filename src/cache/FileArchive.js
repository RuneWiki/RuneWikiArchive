import { ByteBuffer } from '#util/ByteBuffer.js';
import { RandomAccessFile } from '#util/RandomAccessFile.js';
import Hashes from '#enum/Hashes.js';
import { decompressBz2 } from '#util/Bzip2.js';

function genHash(name) {
    let hash = new DataView(new ArrayBuffer(4));
    name = name.toUpperCase();
    for (let i = 0; i < name.length; ++i) {
        hash.setInt32(0, hash.getInt32() * 61 + name.charCodeAt(i) - 32);
    }
    return hash.getInt32();
}

export default class FileArchive {
    #data;

    files = [];
    isCompressedWhole = false;

    constructor(data) {
        if (data) {
            this.#data = data;

            this.#parseHeader(this.#data);
            if (this.isCompressedWhole) {
                this.#data = new ByteBuffer(decompressBz2(this.#data.slice()));
            }

            this.#readFileTable();
        }
    }

    static fromFile(path) {
        let archive = new FileArchive();

        let file = new RandomAccessFile(path);
        let archiveSize = file.read(6);
        archive.#parseHeader(archiveSize);

        if (archive.isCompressedWhole) {
            archive.#data = new ByteBuffer(decompressBz2(file.copy(file.available)));
        } else {
            archive.#data = file.read();
        }
        file.close();

        archive.#readFileTable();
        return archive;
    }

    #parseHeader(data) {
        let uncompressedSize = data.readSWord();
        let compressedSize = data.readSWord();

        if (uncompressedSize != compressedSize) {
            this.isCompressedWhole = true;
        }
    }

    #readFileTable() {
        let count = this.#data.readWord();
        let offset = this.#data.offset + (count * 10);

        for (let i = 0; i < count; ++i) {
            let hashName = this.#data.readDWordSigned();

            let file = {
                hashName,
                name: Hashes.find(x => hashName == genHash(x)),
                uncompressedSize: this.#data.readSWord(),
                compressedSize: this.#data.readSWord(),
                offset
            };

            offset += file.compressedSize;
            this.files.push(file);
        }
    }

    read(name) {
        let file = this.files.find(x => x.name == name);
        if (!file) {
            return null;
        }

        this.#data.front().seek(file.offset);
        let data = this.#data.read(file.compressedSize);

        if (file.compressedSize != file.uncompressedSize) {
            data = new ByteBuffer(decompressBz2(data));
        }

        return data;
    }
}
