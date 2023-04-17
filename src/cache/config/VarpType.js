import { ByteBuffer } from '#util/ByteBuffer.js';

export default class VarpType {
    static offsets = [];
    static count = 0;
    static dat = null;
    static cache = [];

    id = -1;
    opcode1 = 0;
    opcode2 = 0;
    opcode3 = false;
    opcode3_count = 0;
    opcode3_array = [];
    opcode4 = true;
    clientcode = 0;
    opcode6 = false;
    opcode7 = 0;
    opcode8 = false;
    opcode10 = '';

    static unpack(dat, idx, preload = false) {
        VarpType.dat = dat;
        VarpType.count = idx.readWord();
        VarpType.offsets = [];
        VarpType.cache = [];

        let offset = 2;
        for (let i = 0; i < VarpType.count; i++) {
            VarpType.offsets[i] = offset;
            offset += idx.readWord();
        }

        if (preload) {
            for (let i = 0; i < VarpType.count; i++) {
                VarpType.get(i);
            }
        }
    }

    static load(config) {
        const dat = config.read('varp.dat');
        const idx = config.read('varp.idx');

        VarpType.unpack(dat, idx);
    }

    static loadRaw() {
        const dat = ByteBuffer.fromFile('data/cache/raw/config/varp.dat');
        const idx = ByteBuffer.fromFile('data/cache/raw/config/varp.idx');

        VarpType.unpack(dat, idx);
    }

    static pack() {
        const dat = new ByteBuffer();
        const idx = new ByteBuffer();

        idx.writeWord(VarpType.count);
        dat.writeWord(VarpType.count);

        for (let i = 0; i < VarpType.count; i++) {
            let varp;
            if (VarpType.cache[i]) {
                varp = VarpType.cache[i];
            } else {
                varp = new VarpType(i);
            }

            const varpDat = varp.encode();
            idx.writeWord(varpDat.length);
            dat.write(varpDat);
        }

        return { dat, idx };
    }

    static get(id) {
        if (VarpType.cache[id]) {
            return VarpType.cache[id];
        } else {
            return new VarpType(id);
        }
    }

    static toJagConfig() {
        let config = '';

        for (let i = 0; i < VarpType.count; i++) {
            config += VarpType.get(i).toJagConfig() + '\n';
        }

        return config;
    }

    constructor(id = 0, decode = true) {
        this.id = id;
        VarpType.cache[id] = this;

        if (decode) {
            const offset = VarpType.offsets[id];
            if (!offset) {
                return;
            }

            VarpType.dat.front().seek(offset);
            this.#decode();
        }
    }

    #decode() {
        const dat = VarpType.dat;

        while (true) {
            const opcode = dat.readByte();
            if (opcode == 0) {
                break;
            }

            if (opcode == 1) {
                this.opcode1 = dat.readByte();
            } else if (opcode == 2) {
                this.opcode2 = dat.readByte();
            } else if (opcode == 3) {
                this.opcode3 = true;
                this.opcode3_array[this.opcode3_count++] = this.id;
            } else if (opcode == 4) {
                this.opcode4 = false;
            } else if (opcode == 5) {
                this.clientcode = dat.readWord();
            } else if (opcode == 6) {
                this.opcode6 = true;
            } else if (opcode == 7) {
                this.opcode7 = dat.readDWord();
            } else if (opcode == 8) {
                this.opcode8 = true;
            } else if (opcode == 10) {
                this.opcode10 = dat.readString();
            } else {
                console.error('Unknown VarpType opcode:', opcode);
            }
        }
    }

    encode() {
        const dat = new ByteBuffer();

        if (this.opcode1 != 0) {
            dat.writeByte(1);
            dat.writeByte(this.opcode1);
        }

        if (this.opcode2 != 0) {
            dat.writeByte(2);
            dat.writeByte(this.opcode2);
        }

        if (this.opcode3) {
            dat.writeByte(3);
        }

        if (!this.opcode4) {
            dat.writeByte(4);
        }

        if (this.clientcode != 0) {
            dat.writeByte(5);
            dat.writeWord(this.clientcode);
        }

        if (this.opcode6) {
            dat.writeByte(6);
        }

        if (this.opcode7 != 0) {
            dat.writeByte(7);
            dat.writeDWord(this.opcode7);
        }

        if (this.opcode8) {
            dat.writeByte(8);
        }

        if (this.opcode10) {
            dat.writeByte(10);
            dat.writeString(this.opcode10);
        }

        dat.writeByte(0);
        return dat.front();
    }

    toJagConfig() {
        let config = `[varp_${this.id}]\n`;

        if (this.clientcode != 0) {
            config += `clientcode=${this.clientcode}\n`;
        }

        return config;
    }
}
