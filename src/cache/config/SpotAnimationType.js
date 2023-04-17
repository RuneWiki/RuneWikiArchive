import { ByteBuffer } from '#util/ByteBuffer.js';

export default class SpotAnimationType {
    static dat = null;
    static count = 0;
    static offsets = [];
    static cache = [];

    id = -1;
    model = 0;
    anim = -1;
    disposeAlpha = false;
    resizeh = 128;
    resizev = 128;
    rotation = 0;
    ambient = 0;
    contrast = 0;
    recol_s = [];
    recol_d = [];

    static unpack(dat, idx, preload = false) {
        SpotAnimationType.dat = dat;
        SpotAnimationType.count = idx.readWord();
        SpotAnimationType.offsets = [];
        SpotAnimationType.cache = [];

        let offset = 2;
        for (let i = 0; i < SpotAnimationType.count; i++) {
            SpotAnimationType.offsets[i] = offset;
            offset += idx.readWord();
        }

        if (preload) {
            for (let i = 0; i < SpotAnimationType.count; i++) {
                SpotAnimationType.get(i);
            }
        }
    }

    static load(config) {
        const dat = config.read('spotanim.dat');
        const idx = config.read('spotanim.idx');

        SpotAnimationType.unpack(dat, idx);
    }

    static loadRaw() {
        const dat = ByteBuffer.fromFile('data/cache/raw/config/spotanim.dat');
        const idx = ByteBuffer.fromFile('data/cache/raw/config/spotanim.idx');

        SpotAnimationType.unpack(dat, idx);
    }

    static pack() {
        const dat = new ByteBuffer();
        const idx = new ByteBuffer();

        idx.writeWord(SpotAnimationType.count);
        dat.writeWord(SpotAnimationType.count);

        for (let i = 0; i < SpotAnimationType.count; i++) {
            let spotAnimation;
            if (SpotAnimationType.cache[i]) {
                spotAnimation = SpotAnimationType.cache[i];
            } else {
                spotAnimation = new SpotAnimationType(i);
            }

            const spotAnimationDat = spotAnimation.encode();
            idx.writeWord(spotAnimationDat.length);
            dat.write(spotAnimationDat);
        }

        return { dat, idx };
    }

    static get(id) {
        if (SpotAnimationType.cache[id]) {
            return SpotAnimationType.cache[id];
        } else {
            return new SpotAnimationType(id);
        }
    }

    static toJagConfig() {
        let config = '';

        for (let i = 0; i < SpotAnimationType.count; i++) {
            config += SpotAnimationType.get(i).toJagConfig() + '\n';
        }

        return config;
    }

    constructor(id = 0, decode = true) {
        this.id = id;
        SpotAnimationType.cache[id] = this;

        if (decode) {
            const offset = SpotAnimationType.offsets[id];
            if (!offset) {
                return;
            }

            SpotAnimationType.dat.front().seek(offset);
            this.#decode();
        }
    }

    #decode() {
        const dat = SpotAnimationType.dat;

        while (true) {
            const opcode = dat.readByte();
            if (opcode == 0) {
                break;
            }

            if (opcode == 1) {
                this.model = dat.readWord();
            } else if (opcode == 2) {
                this.anim = dat.readWord();
            } else if (opcode == 3) {
                this.disposeAlpha = true;
            } else if (opcode == 4) {
                this.resizeh = dat.readWord();
            } else if (opcode == 5) {
                this.resizev = dat.readWord();
            } else if (opcode == 6) {
                this.rotation = dat.readWord();
            } else if (opcode == 7) {
                this.ambient = dat.readByte();
            } else if (opcode == 8) {
                this.contrast = dat.readByte();
            } else if (opcode >= 40 && opcode < 50) {
                this.recol_s[opcode - 40] = dat.readWord();
            } else if (opcode >= 50 && opcode < 60) {
                this.recol_d[opcode - 50] = dat.readWord();
            } else {
                console.error('Unknown SpotAnimationType opcode:', opcode);
            }
        }
    }

    encode() {
        const dat = new ByteBuffer();

        if (this.model != -1) {
            dat.writeByte(1);
            dat.writeWord(this.model);
        }

        if (this.anim != -1) {
            dat.writeByte(2);
            dat.writeWord(this.anim);
        }

        if (this.disposeAlpha) {
            dat.writeByte(3);
        }

        if (this.resizeh != 128) {
            dat.writeByte(4);
            dat.writeWord(this.resizeh);
        }

        if (this.resizev != 128) {
            dat.writeByte(5);
            dat.writeWord(this.resizev);
        }

        if (this.rotation != 0) {
            dat.writeByte(6);
            dat.writeWord(this.rotation);
        }

        if (this.ambient != 0) {
            dat.writeByte(7);
            dat.writeByte(this.ambient);
        }

        if (this.contrast != 0) {
            dat.writeByte(8);
            dat.writeByte(this.contrast);
        }

        for (let i = 0; i < this.recol_s.length; i++) {
            dat.writeByte(40 + i);
            dat.writeWord(this.recol_s[i]);
        }

        for (let i = 0; i < this.recol_d.length; i++) {
            dat.writeByte(50 + i);
            dat.writeWord(this.recol_d[i]);
        }

        dat.writeByte(0);
        return dat.front();
    }

    toJagConfig() {
        let config = `[spotanim_${this.id}]\n`;

		if (this.model != 0) {
            config += `model=model_${this.model}\n`;
		}

		if (this.anim != -1) {
            config += `anim=seq_${this.anim}\n`;
		}

        if (this.resizeh != 128) {
            config += `resizeh=${this.resizeh}\n`;
		}

		if (this.resizev != 128) {
            config += `resizev=${this.resizev}\n`;
		}

		if (this.rotation != 0) {
            config += `rotation=${this.rotation}\n`;
		}

		if (this.ambient != 0) {
            config += `ambient=${this.ambient}\n`;
		}

		if (this.contrast != 0) {
            config += `contrast=${this.contrast}\n`;
		}

        for (let i = 0; i < this.recol_s.length; ++i) {
            config += `recol${i + 1}s=${this.recol_s[i]}\n`;
            config += `recol${i + 1}d=${this.recol_d[i]}\n`;
		}

        return config;
    }
}
