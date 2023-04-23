import { ByteBuffer } from '#util/ByteBuffer.js';

export default class NpcType {
    static dat = null;
    static count = 0;
    static offsets = [];
    static cache = [];

    id = -1;
    models = [];
    name = '';
    desc = '';
    size = 1;
    readyanim = -1;
    disposeAlpha = false;
    walkanim = -1;
    walkanim_b = -1;
    walkanim_r = -1;
    walkanim_l = -1;
    ops = [];
    recol_s = [];
    recol_d = [];
    heads = [];
    opcode90 = -1;
    opcode91 = -1;
    opcode92 = -1;
    visonmap = true;
    vislevel = -1;
    resizew = 128;
    resizeh = 128;
    //
    drawpriority = false;
    ambient = 0;
    contrast = 0;
    headicon = -1; // not an official name
    turnspeed = 32;
    multivarbit = -1;
    multivar = -1;
    multinpc = [];
    active = true;

    // read dat/idx from config archive
    static unpack(dat, idx, preload = false) {
        NpcType.dat = dat;
        NpcType.count = idx.readWord();
        NpcType.offsets = [];
        NpcType.cache = [];

        let offset = 2;
        for (let i = 0; i < NpcType.count; i++) {
            NpcType.offsets[i] = offset;
            offset += idx.readWord();
        }

        if (preload) {
            for (let i = 0; i < NpcType.count; i++) {
                NpcType.get(i);
            }
        }
    }

    static load(config) {
        const dat = config.read('npc.dat');
        const idx = config.read('npc.idx');

        NpcType.unpack(dat, idx);
    }

    static loadRaw() {
        const dat = ByteBuffer.fromFile('data/cache/raw/config/npc.dat');
        const idx = ByteBuffer.fromFile('data/cache/raw/config/npc.idx');

        NpcType.unpack(dat, idx);
    }

    static pack() {
        const dat = new ByteBuffer();
        const idx = new ByteBuffer();

        idx.writeWord(NpcType.count);
        dat.writeWord(NpcType.count);

        for (let i = 0; i < NpcType.count; i++) {
            let npcType;
            if (NpcType.cache[i]) {
                npcType = NpcType.cache[i];
            } else {
                npcType = new NpcType(i);
            }

            const npcTypeDat = npcType.encode();
            idx.writeWord(npcTypeDat.length);
            dat.write(npcTypeDat);
        }

        return { dat, idx };
    }

    static get(id) {
        if (NpcType.cache[id]) {
            return NpcType.cache[id];
        } else if (typeof NpcType.offsets[id] !== 'undefined') {
            return new NpcType(id);
        } else {
            return null;
        }
    }

    static getByName(name) {
        for (let i = 0; i < NpcType.count; i++) {
            if (NpcType.get(i).name.toLowerCase() == name.toLowerCase()) {
                return NpcType.get(i);
            }
        }
        return null;
    }

    static find(predicate) {
        for (let i = 0; i < NpcType.count; i++) {
            if (predicate(NpcType.get(i))) {
                return NpcType.get(i);
            }
        }
        return null;
    }

    static filter(predicate) {
        let filtered = [];

        for (let i = 0; i < NpcType.count; i++) {
            if (predicate(NpcType.get(i))) {
                filtered.push(NpcType.get(i));
            }
        }

        return filtered;
    }

    static indexOf(predicate, start = 0) {
        for (let i = start; i < NpcType.count; i++) {
            if (predicate(NpcType.get(i))) {
                return i;
            }
        }

        return -1;
    }

    static toJagConfig() {
        let config = '';

        for (let i = 0; i < NpcType.count; i++) {
            config += NpcType.get(i).toJagConfig() + '\n';
        }

        return config;
    }

    constructor(id = 0, decode = true, addToCache = true) {
        this.id = id;

        if (decode) {
            const offset = NpcType.offsets[id];
            if (!offset) {
                return;
            }

            NpcType.dat.front().seek(offset);
            this.#decode();
        }

        if (addToCache) {
            NpcType.cache[id] = this;
        }
    }

    #decode() {
        const dat = NpcType.dat;

        while (true) {
            const opcode = dat.readByte();
            if (opcode == 0) {
                break;
            }

            if (opcode == 1) {
                const count = dat.readByte();

                for (let i = 0; i < count; i++) {
                    this.models[i] = dat.readWord();
                }
            } else if (opcode == 2) {
                this.name = dat.readString();
            } else if (opcode == 3) {
                this.desc = dat.readString();
            } else if (opcode == 12) {
                this.size = dat.readByteSigned();
            } else if (opcode == 13) {
                this.readyanim = dat.readWord();
            } else if (opcode == 14) {
                this.walkanim = dat.readWord();
            } else if (opcode == 16) {
                this.disposeAlpha = true;
            } else if (opcode == 17) {
                this.walkanim = dat.readWord();
                this.walkanim_b = dat.readWord();
                this.walkanim_r = dat.readWord();
                this.walkanim_l = dat.readWord();
            } else if (opcode >= 30 && opcode < 40) {
                this.ops[opcode - 30] = dat.readString();
            } else if (opcode == 40) {
                const count = dat.readByte();

                for (let i = 0; i < count; i++) {
                    this.recol_s[i] = dat.readWord();
                    this.recol_d[i] = dat.readWord();
                }
            } else if (opcode == 60) {
                const count = dat.readByte();

                for (let i = 0; i < count; i++) {
                    this.heads[i] = dat.readWord();
                }
            } else if (opcode == 90) {
                this.opcode90 = dat.readWord();
            } else if (opcode == 91) {
                this.opcode91 = dat.readWord();
            } else if (opcode == 92) {
                this.opcode92 = dat.readWord();
            } else if (opcode == 93) {
                this.visonmap = false;
            } else if (opcode == 95) {
                this.vislevel = dat.readWord();
            } else if (opcode == 97) {
                this.resizew = dat.readWord();
            } else if (opcode == 98) {
                this.resizeh = dat.readWord();
            } else if (opcode == 99) {
                this.drawpriority = true;
            } else if (opcode == 100) {
                this.ambient = dat.readByte();
            } else if (opcode == 101) {
                this.contrast = dat.readByte();
            } else if (opcode == 102) {
                this.headicon = dat.readWord();
            } else if (opcode == 103) {
                this.turnspeed = dat.readWord();
            } else if (opcode == 106) {
                this.multivarbit = dat.readWord();
                if (this.multivarbit == 65535) {
                    this.multivarbit = -1;
                }

                this.multivar = dat.readWord();
                if (this.multivar == 65535) {
                    this.multivar = -1;
                }

                this.multinpc = [];

                let count = dat.readByte();
                for (let i = 0; i <= count; i++) {
                    this.multinpc[i] = dat.readWord();

                    if (this.multinpc[i] == 65535) {
                        this.multinpc[i] = -1;
                    }
                }
            } else if (opcode == 107) {
                this.active = false;
            } else {
                console.error('Unknown NpcType opcode:', opcode);
            }
        }
    }

    encode() {
        const dat = new ByteBuffer();

        if (this.models.length) {
            dat.writeByte(1);
            dat.writeByte(this.models.length);

            for (let i = 0; i < this.models.length; i++) {
                dat.writeWord(this.models[i]);
            }
        }

        if (this.name) {
            dat.writeByte(2);
            dat.writeString(this.name);
        }

        if (this.desc) {
            dat.writeByte(3);
            dat.writeString(this.desc);
        }

        if (this.size != 1) {
            dat.writeByte(12);
            dat.writeByte(this.size);
        }

        if (this.readyanim != -1) {
            dat.writeByte(13);
            dat.writeWord(this.readyanim);
        }

        if (this.walkanim != -1 && this.walkanim_b == -1 && this.walkanim_r == -1 && this.walkanim_l == -1) {
            dat.writeByte(14);
            dat.writeWord(this.walkanim);
        }

        if (this.disposeAlpha) {
            dat.writeByte(16);
        }

        if (this.walkanim_b != -1 || this.walkanim_r != -1 || this.walkanim_l != -1) {
            dat.writeByte(17);
            dat.writeWord(this.walkanim);
            dat.writeWord(this.walkanim_b);
            dat.writeWord(this.walkanim_r);
            dat.writeWord(this.walkanim_l);
        }

        for (let i = 0; i < 10; i++) {
            if (this.ops[i]) {
                dat.writeByte(30 + i);
                dat.writeString(this.ops[i]);
            }
        }

        if (this.recol_s.length) {
            dat.writeByte(40);
            dat.writeByte(this.recol_s.length);

            for (let i = 0; i < this.recol_s.length; i++) {
                dat.writeWord(this.recol_s[i]);
                dat.writeWord(this.recol_d[i]);
            }
        }

        if (this.heads.length) {
            dat.writeByte(60);
            dat.writeByte(this.heads.length);

            for (let i = 0; i < this.heads.length; i++) {
                dat.writeWord(this.heads[i]);
            }
        }

        if (this.opcode90 != -1) {
            dat.writeByte(90);
            dat.writeWord(this.opcode90);
        }

        if (this.opcode91 != -1) {
            dat.writeByte(91);
            dat.writeWord(this.opcode91);
        }

        if (this.opcode92 != -1) {
            dat.writeByte(92);
            dat.writeWord(this.opcode92);
        }

        if (!this.visonmap) {
            dat.writeByte(93);
        }

        if (this.vislevel != -1) {
            dat.writeByte(95);
            dat.writeWord(this.vislevel);
        }

        if (this.resizew != 128) {
            dat.writeByte(97);
            dat.writeWord(this.resizew);
        }

        if (this.resizeh != 128) {
            dat.writeByte(98);
            dat.writeWord(this.resizeh);
        }

        dat.writeByte(0);
        return dat.front();
    }

    toJagConfig() {
        let config = `[npc_${this.id}]\n`;

        if (this.name) {
            config += `name=${this.name}\n`;
        }

        if (this.desc) {
            config += `desc=${this.desc}\n`;
        }

        for (let i = 0; i < this.models.length; ++i) {
            config += `model${i + 1}=model_${this.models[i]}\n`;
        }

        for (let i = 0; i < this.heads.length; ++i) {
            config += `head${i + 1}=model_${this.heads[i]}\n`;
        }

        if (this.readyanim != -1) {
            config += `readyanim=seq_${this.readyanim}\n`;
        }

        if (this.walkanim != -1) {
            config += `walkanim=seq_${this.walkanim}\n`;
        }

        if (this.walkanim_b != -1) {
            config += `walkanim_b=seq_${this.walkanim_b}\n`;
        }

        if (this.walkanim_r != -1) {
            config += `walkanim_r=seq_${this.walkanim_r}\n`;
        }

        if (this.walkanim_l != -1) {
            config += `walkanim_l=seq_${this.walkanim_l}\n`;
        }

        if (this.size != 1) {
            config += `size=${this.size}\n`;
        }

        if (this.resizew != 128) {
            config += `resizew=${this.resizew}\n`;
        }

        if (this.resizeh != 128) {
            config += `resizeh=${this.resizeh}\n`;
        }

        for (let i = 0; i < this.recol_s.length; ++i) {
            config += `recol${i + 1}s=${this.recol_s[i]}\n`;
            config += `recol${i + 1}d=${this.recol_d[i]}\n`;
        }

        for (let i = 0; i < this.ops.length; ++i) {
            if (this.ops[i] == null) {
                continue;
            }

            config += `op${i + 1}=${this.ops[i]}\n`;
        }

        if (this.vislevel != -1) {
            config += `vislevel=${this.vislevel}\n`;
        }

        if (!this.visonmap) {
            config += `visonmap=no\n`;
        }

        if (this.drawpriority) {
            config += `drawpriority=yes\n`;
        }

        if (this.ambient) {
            config += `ambient=${this.ambient}\n`;
        }

        if (this.contrast) {
            config += `contrast=${this.contrast}\n`;
        }

        if (this.headicon != -1) {
            config += `headicon=${this.headicon}\n`;
        }

        if (this.turnspeed !== 32) {
            config += `turnspeed=${this.turnspeed}\n`;
        }

        if (this.multivarbit !== -1 || this.multivar !== -1) {
            if (this.multivarbit != -1) {
                config += `multivar=varbit_${this.multivarbit}\n`;
            }

            if (this.multivar != -1) {
                config += `multivar=var_${this.multivar}\n`;
            }

            for (let i = 0; i < this.multinpc.length; i++) {
                if (this.multinpc[i] == -1) {
                    continue;
                }

                config += `multinpc=${i},npc_${this.multinpc[i]}\n`;
            }
        }

        if (!this.active) {
            config += `active=no\n`;
        }

        return config;
    }
}
