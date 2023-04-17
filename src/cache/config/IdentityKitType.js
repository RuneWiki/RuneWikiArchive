import { ByteBuffer } from '#util/ByteBuffer.js';

export default class IdentityKitType {
    static dat = null;
    static count = 0;
    static offsets = [];
    static cache = [];

    static BODYPART_MALE_HAIR = 0;
    static BODYPART_MALE_JAW = 1;
    static BODYPART_MALE_TORSO = 2;
    static BODYPART_MALE_ARMS = 3;
    static BODYPART_MALE_HANDS = 4;
    static BODYPART_MALE_LEGS = 5;
    static BODYPART_MALE_FEET = 6;
    static BODYPART_FEMALE_HAIR = 7;
    static BODYPART_FEMALE_JAW = 8;
    static BODYPART_FEMALE_TORSO = 9;
    static BODYPART_FEMALE_ARMS = 10;
    static BODYPART_FEMALE_HANDS = 11;
    static BODYPART_FEMALE_LEGS = 12;
    static BODYPART_FEMALE_FEET = 13;

    // reverse lookup for toJagConfig
    static BODYPART = {
        0: 'BODYPART_MALE_HAIR',
        1: 'BODYPART_MALE_JAW',
        2: 'BODYPART_MALE_TORSO',
        3: 'BODYPART_MALE_ARMS',
        4: 'BODYPART_MALE_HANDS',
        5: 'BODYPART_MALE_LEGS',
        6: 'BODYPART_MALE_FEET',
        7: 'BODYPART_FEMALE_HAIR',
        8: 'BODYPART_FEMALE_JAW',
        9: 'BODYPART_FEMALE_TORSO',
        10: 'BODYPART_FEMALE_ARMS',
        11: 'BODYPART_FEMALE_HANDS',
        12: 'BODYPART_FEMALE_LEGS',
        13: 'BODYPART_FEMALE_FEET'
    };

    id = -1;
    type = -1;
    disable = false;
    models = [];
    recol_s = [];
    recol_d = [];
    heads = [];

    static unpack(dat, idx, preload = false) {
        IdentityKitType.dat = dat;
        IdentityKitType.count = idx.readWord();
        IdentityKitType.offsets = [];
        IdentityKitType.cache = [];

        let offset = 2;
        for (let i = 0; i < IdentityKitType.count; i++) {
            IdentityKitType.offsets[i] = offset;
            offset += idx.readWord();
        }

        if (preload) {
            for (let i = 0; i < IdentityKitType.count; i++) {
                IdentityKitType.get(i);
            }
        }
    }

    static load(config) {
        const dat = config.read('idk.dat');
        const idx = config.read('idk.idx');

        IdentityKitType.unpack(dat, idx);
    }

    static loadRaw() {
        const dat = ByteBuffer.fromFile('data/cache/raw/config/idk.dat');
        const idx = ByteBuffer.fromFile('data/cache/raw/config/idk.idx');

        IdentityKitType.unpack(dat, idx);
    }

    static pack() {
        const dat = new ByteBuffer();
        const idx = new ByteBuffer();

        idx.writeWord(IdentityKitType.count);
        dat.writeWord(IdentityKitType.count);

        for (let i = 0; i < IdentityKitType.count; i++) {
            let identityKit;
            if (IdentityKitType.cache[i]) {
                identityKit = IdentityKitType.cache[i];
            } else {
                identityKit = new IdentityKitType(i);
            }

            const identityKitDat = identityKit.encode();
            idx.writeWord(identityKitDat.length);
            dat.write(identityKitDat);
        }

        return { dat, idx };
    }

    static get(id) {
        if (IdentityKitType.cache[id]) {
            return IdentityKitType.cache[id];
        } else {
            return new IdentityKitType(id);
        }
    }

    static find(predicate) {
        return this.cache.find(predicate);
    }

    static filter(predicate) {
        return this.cache.filter(predicate);
    }

    static indexOf(predicate, start = 0) {
        for (let i = start; i < IdentityKitType.count; i++) {
            if (predicate(IdentityKitType.get(i))) {
                return i;
            }
        }

        return -1;
    }

    static toJagConfig() {
        let config = '';

        for (let i = 0; i < IdentityKitType.count; i++) {
            config += IdentityKitType.get(i).toJagConfig() + '\n';
        }

        return config;
    }

    constructor(id = 0, decode = true) {
        this.id = id;
        IdentityKitType.cache[id] = this;

        if (decode) {
            const offset = IdentityKitType.offsets[id];
            if (!offset) {
                return;
            }

            IdentityKitType.dat.front().seek(offset);
            this.#decode();
        }
    }

    #decode() {
        const dat = IdentityKitType.dat;

        while (true) {
            const opcode = dat.readByte();
            if (opcode == 0) {
                break;
            }

            if (opcode == 1) {
                this.type = dat.readByte();
            } else if (opcode == 2) {
                const count = dat.readByte();

                for (let i = 0; i < count; i++) {
                    this.models[i] = dat.readWord();
                }
            } else if (opcode == 3) {
                this.disable = true;
            } else if (opcode >= 40 && opcode < 50) {
                this.recol_s[opcode - 40] = dat.readWord();
            } else if (opcode >= 50 && opcode < 60) {
                this.recol_d[opcode - 50] = dat.readWord();
            } else if (opcode >= 60 && opcode < 70) {
                this.heads[opcode - 60] = dat.readWord();
            } else {
                console.error('Unknown IdentityKitType opcode:', opcode);
            }
        }
    }

    encode() {
        const dat = new ByteBuffer();

        if (this.type != -1) {
            dat.writeByte(1);
            dat.writeByte(this.type);
        }

        if (this.models.length) {
            dat.writeByte(2);
            dat.writeByte(this.models.length);

            for (let i = 0; i < this.models.length; i++) {
                dat.writeWord(this.models[i]);
            }
        }

        if (this.disable) {
            dat.writeByte(3);
        }

        for (let i = 0; i < this.recol_s.length; i++) {
            dat.writeByte(40 + i);
            dat.writeWord(this.recol_s[i]);
        }

        for (let i = 0; i < this.recol_d.length; i++) {
            dat.writeByte(50 + i);
            dat.writeWord(this.recol_d[i]);
        }

        for (let i = 0; i < this.heads.length; i++) {
            dat.writeByte(60 + i);
            dat.writeWord(this.heads[i]);
        }

        dat.writeByte(0);
        return dat.front();
    }

    toJagConfig() {
        let config = `[idk_${this.id}]\n`;

        if (this.type != -1) {
            if (IdentityKitType.BODYPART[this.type]) {
                config += `bodypart=^${IdentityKitType.BODYPART[this.type]}\n`;
            } else {
                config += `bodypart=${this.type}\n`;
            }
        }

        if (this.disable) {
            config += 'disable=yes\n';
        }

        if (this.models.length) {
            for (let i = 0; i < this.models.length; i++) {
                config += `model${i + 1}=model_${this.models[i]}\n`;
            }
        }

        if (this.heads.length) {
            for (let i = 0; i < this.heads.length; i++) {
                config += `head${i + 1}=model_${this.heads[i]}\n`;
            }
        }

        if (this.recol_s.length) {
            for (let i = 0; i < this.recol_s.length; i++) {
                config += `recol${i + 1}s=${this.recol_s[i]}\n`;
                config += `recol${i + 1}d=${this.recol_d[i]}\n`;
            }
        }

        return config;
    }
}
