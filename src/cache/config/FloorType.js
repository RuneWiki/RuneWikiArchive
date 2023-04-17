import { ByteBuffer } from '#util/ByteBuffer.js';

export default class FloorType {
    static dat = null;
    static count = 0;
    static offsets = [];
    static cache = [];

    id = -1;
    rgb = 0;
    texture = -1;
    opcode3 = false;
    occlude = true;
    name = '';

    static unpack(dat, idx, preload = false) {
        FloorType.dat = dat;
        FloorType.count = idx.readWord();
        FloorType.offsets = [];
        FloorType.cache = [];

        let offset = 2;
        for (let i = 0; i < FloorType.count; i++) {
            FloorType.offsets[i] = offset;
            offset += idx.readWord();
        }

        if (preload) {
            for (let i = 0; i < FloorType.count; i++) {
                FloorType.get(i);
            }
        }
    }

    static load(config) {
        const dat = config.read('flo.dat');
        const idx = config.read('flo.idx');

        FloorType.unpack(dat, idx);
    }

    static loadRaw() {
        const dat = ByteBuffer.fromFile('data/cache/raw/config/flo.dat');
        const idx = ByteBuffer.fromFile('data/cache/raw/config/flo.idx');

        FloorType.unpack(dat, idx);
    }

    static pack() {
        const dat = new ByteBuffer();
        const idx = new ByteBuffer();

        idx.writeWord(FloorType.count);
        dat.writeWord(FloorType.count);

        for (let i = 0; i < FloorType.count; i++) {
            const floor = FloorType.get(i);
            const floorDat = floor.encode();
            idx.writeWord(floorDat.length);
            dat.write(floorDat);
        }

        return { dat, idx };
    }

    static get(id) {
        if (FloorType.cache[id]) {
            return FloorType.cache[id];
        } else {
            return new FloorType(id);
        }
    }

    static toJagConfig() {
        let config = '';

        for (let i = 0; i < FloorType.count; i++) {
            config += '#' + i + '\n';
            config += FloorType.get(i).toJagConfig() + '\n';
        }

        return config;
    }

    constructor(id = 0, decode = true) {
        this.id = id;
        FloorType.cache[id] = this;

        if (decode) {
            const offset = FloorType.offsets[id];
            if (!offset) {
                return;
            }

            FloorType.dat.front().seek(offset);
            this.#decode();
        }
    }

    #decode() {
        const dat = FloorType.dat;

        while (true) {
            const opcode = dat.readByte();
            if (opcode == 0) {
                break;
            }

            if (opcode == 1) {
                this.rgb = dat.readSWord();
            } else if (opcode == 2) {
                this.texture = dat.readByte();
            } else if (opcode == 3) {
                this.opcode3 = true;
            } else if (opcode == 5) {
                this.occlude = false;
            } else if (opcode == 6) {
                this.name = dat.readString();
            } else if (opcode == 7) {
                dat.readSWord();
            } else if (opcode == 8) {
            } else if (opcode == 9) {
                dat.readWord();
            } else if (opcode == 10) {
            } else if (opcode == 11) {
                dat.readByte();
            } else if (opcode == 12) {
            } else if (opcode == 3) {
                dat.readByte();
            } else {
                console.error('Unknown FloorType opcode:', opcode);
            }
        }
    }

    encode() {
        const dat = new ByteBuffer();

        if (this.rgb != 0) {
            dat.writeByte(1);
            dat.writeSWord(this.rgb);
        }

        if (this.texture != -1) {
            dat.writeByte(2);
            dat.writeByte(this.texture);
        }

        if (this.opcode3) {
            dat.writeByte(3);
        }

        if (!this.occlude) {
            dat.writeByte(5);
        }

        if (this.name) {
            dat.writeByte(6);
            dat.writeString(this.name);
        }

        dat.writeByte(0);
        return dat.front();
    }

    toJagConfig() {
        let config;
        if (this.name) {
            config = `[${this.name}]\n`;
        } else {
            config = `[flo_${this.id}]\n`;
        }

        if (this.texture != -1) {
            config += `texture=texture_${this.texture}\n`;
        } else {
            if (this.rgb == 0) {
                config += 'colour=^BLACK\n';
            } else {
                config += `colour=0x${this.rgb.toString(16).padStart(6, '0').toUpperCase()}\n`;
            }
        }

        if (!this.occlude) {
            config += 'occlude=no\n';
        }

        return config;
    }
}
