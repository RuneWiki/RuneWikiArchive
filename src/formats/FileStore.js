import bz2 from 'bz2';
import fs from 'fs';
import zlib from 'zlib';

import { ByteBuffer } from '#util/ByteBuffer.js';
import { RandomAccessFile } from '#util/RandomAccessFile.js';

import { FileArchive } from './FileArchive.js';

// const GZIP_HEADER = new Uint8Array([0x1F, 0x8B]);
const BZIP2_HEADER = new Uint8Array([0x42, 0x5A, 0x68, 0x31]);

/*
dat0 = sd client in pack200 format (minus gzip header `1f 8b`)
dat1 = sd client in packclass format
dat3 = hd client in pack200 format
dat4 = hd client in packclass format
dat5 = jogl/jaggl library in pack200 format
dat6 = jogl/jaggl library in packclass format
*/

export class FileStore {
    dat;
    index_offset;
    currentSector;

    archives = [];
    models = [];
    anims = [];
    midis = [];
    rawMaps = [];
    maps = {};

    constructor(path, fresh = false) {
        if (fresh) {
            fs.writeFileSync(`${path}/main_file_cache.dat`, new Uint8Array());
        }

        this.dat = new RandomAccessFile(`${path}/main_file_cache.dat`);
        for (let i = 0; i < 5; ++i) {
            if (fresh) {
                fs.writeFileSync(`${path}/main_file_cache.idx${i}`, new Uint8Array());
            }

            this[`idx${i}`] = new RandomAccessFile(`${path}/main_file_cache.idx${i}`);
        }

        this.index_offset = 1;
        this.currentSector = Math.floor(this.dat.length / 520);

        if (!fresh) {
            this.parse();
        }
    }

    close() {
        this.dat.close();
        delete this.dat;

        for (let i = 0; i < 5; ++i) {
            this[`idx${i}`].close();
            delete this[`idx${i}`];
        }
    }

    parse() {
        this.archives = [];
        for (let i = 1; i < this.count(0); ++i) {
            this.archives[i] = this.read(0, i, true);
        }

        const versionlist = this.archives[5];
        if (!versionlist) {
            return;
        }

        try {
            const model_crc = versionlist.read('model_crc');
            const model_version = versionlist.read('model_version');
            this.models = [];
            for (let i = 0; i < model_crc.length / 4; ++i) {
                this.models.push({
                    id: i,
                    // flags: model_index.readByte(),
                    crc: model_crc.readDWordSigned(),
                    version: model_version.readWord() - 1
                });
            }
        } catch (err) {
            console.log('Failed to unpack model information');
        }

        try {
            const anim_crc = versionlist.read('anim_crc');
            const anim_version = versionlist.read('anim_version');
            this.anims = [];
            for (let i = 0; i < anim_crc.length / 4; ++i) {
                this.anims.push({
                    id: i,
                    crc: anim_crc.readDWordSigned(),
                    version: anim_version.readWord() - 1
                });
            }
        } catch (err) {
            console.log('Failed to unpack anim information');
        }

        try {
            const midi_index = versionlist.read('midi_index');
            const midi_crc = versionlist.read('midi_crc');
            const midi_version = versionlist.read('midi_version');
            this.midis = [];
            for (let i = 0; i < midi_crc.length / 4; ++i) {
                this.midis.push({
                    id: i,
                    prefetch: midi_index.readByte(),
                    crc: midi_crc.readDWordSigned(),
                    version: midi_version.readWord() - 1
                });
            }
        } catch (err) {
            console.log('Failed to unpack midi information');
        }

        try {
            const map_crc = versionlist.read('map_crc');
            const map_version = versionlist.read('map_version');
            this.rawMaps = [];
            for (let i = 0; i < map_version.length / 2; ++i) {
                this.rawMaps.push({
                    id: i,
                    crc: map_crc.readDWordSigned(),
                    version: map_version.readWord() - 1
                });
            }

            const map_index = versionlist.read('map_index');
            this.maps = {};
            for (let i = 0; i < map_index.length / 7; ++i) {
                const index = map_index.readWord();
                const x = (index >> 8) & 0xFF;
                const z = index & 0xFF;

                if (!this.maps[x]) {
                    this.maps[x] = {};
                }

                let map = {
                    landFile: map_index.readWord(),
                    locFile: map_index.readWord(),
                    prefetched: map_index.readByte()
                };

                map.landExists = this.read(4, map.landFile) != null;
                map.landCrc = this.rawMaps[map.landFile].crc;
                map.landVersion = this.rawMaps[map.landFile].version;
                map.locExists = this.read(4, map.locFile) != null;
                map.locCrc = this.rawMaps[map.locFile].crc;
                map.locVersion = this.rawMaps[map.locFile].version;
                this.maps[x][z] = map;
            }
        } catch (err) {
            console.log('Failed to unpack map information');
        }
    }

    read(index, entry, extract = false) {
        const idx = this[`idx${index}`];
        if (!idx) {
            return null;
        }

        const pos = entry * 6;
        if (pos > idx.length - 6) {
            return;
        }

        let buffer = idx.front().seek(pos).read(6);
        let length = buffer.readSWord();
        if (length === 0 || length > this.dat.length) {
            return null;
        }

        let data = new ByteBuffer(new Uint8Array(length), false);
        let nextSector = buffer.readSWord();

        if (nextSector * 520 > this.dat.length) {
            return null;
        }

        let part = 0;
        while (data.available && nextSector !== 0) {
            let sector = this.dat.front().seek(nextSector * 520).read(520);

            let bytes = data.available;
            if (bytes > 512) {
                bytes = 512;
            }

            let currentFile = sector.readWord();
            if (currentFile !== entry) {
                return null;
            }

            let currentPart = sector.readWord();
            if (currentPart !== part) {
                return null;
            }

            nextSector = sector.readSWord();
            if (nextSector * 520 > this.dat.length) {
                return null;
            }

            let currentIndex = sector.readByte();
            if (currentIndex - this.index_offset !== index) {
                return null;
            }

            data.write(sector.read(bytes));
            part++;
        }

        if (data.offset !== data.length) {
            return null;
        }

        try {
            data.front();
            if (extract && index === 0) {
                return FileArchive.from(data);
            } else if (extract) {
                return new ByteBuffer(zlib.gunzipSync(data.raw));
            } else {
                return data;
            }
        } catch (err) {
            return null;
        }
    }

    count(index) {
        return this[`idx${index}`].length / 6;
    }

    write(index, entry, data, compress = true) {
        if (data.raw) {
            data = data.raw;
        }

        if (compress) {
            data = zlib.gzipSync(data);
            data[9] = 0;
        }

        let stream = new ByteBuffer(data);

        let indexStream = new ByteBuffer(new Uint8Array(6));
        indexStream.writeSWord(data.length);
        indexStream.writeSWord(++this.currentSector);

        let idx = `idx${index}`;
        this[idx].front().seek(entry * 6);
        this[idx].write(indexStream.raw);

        let part = 0;
        while (stream.available > 0) {
            this.dat.front().seek(this.currentSector * 520);

            let header = new ByteBuffer(new Uint8Array(8));
            header.writeWord(entry);
            header.writeWord(part++);
            if (stream.available > 512) {
                header.writeSWord(++this.currentSector);
            } else {
                header.writeSWord(0);
            }
            header.writeByte(index + this.index_offset);

            this.dat.write(header.raw);
            this.dat.write(stream.read(512).raw);
        }
    }

    exists(index, entry) {
        const idx = this[`idx${index}`];
        if (!idx) {
            return false;
        }

        const pos = entry * 6;
        if (pos > idx.length - 6) {
            return false;
        }

        let buffer = idx.front().seek(pos).read(6);
        let length = buffer.readSWord();
        if (length === 0 || length > this.dat.length) {
            return false;
        }

        return true;
    }
}
