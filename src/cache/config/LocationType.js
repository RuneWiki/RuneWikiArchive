import { ByteBuffer } from '#util/ByteBuffer.js';

export default class LocationType {
    static dat = null;
    static count = 0;
    static offsets = [];
    static cache = [];

	static WALL_STRAIGHT = 0;
	static WALL_DIAGONALCORNER = 1;
	static WALL_L = 2;
	static WALL_SQUARECORNER = 3;

	static WALLDECOR_STRAIGHT = 4;
	static WALLDECOR_STRAIGHT_OFFSET = 5;
	static WALLDECOR_DIAGONAL_NOOFFSET = 6;
	static WALLDECOR_DIAGONAL_OFFSET = 7;
	static WALLDECOR_DIAGONAL_BOTH = 8;

	static WALL_DIAGONAL = 9;

	static CENTREPIECE_STRAIGHT = 10;
	static CENTREPIECE_DIAGONAL = 11;

	static ROOF_STRAIGHT = 12;
	static ROOF_DIAGONAL_WITH_ROOFEDGE = 13;
	static ROOF_DIAGONAL = 14;
	static ROOF_L_CONCAVE = 15;
	static ROOF_L_CONVEX = 16;
	static ROOF_FLAT = 17;

	static ROOFEDGE_STRAIGHT = 18;
	static ROOFEDGE_DIAGONALCORNER = 19;
	static ROOFEDGE_L = 20;
	static ROOFEDGE_SQUARECORNER = 21;

	static GROUNDDECOR = 22;

    // reverse lookup for toJagConfig
    static SHAPE = {
        0: 'WALL_STRAIGHT',
        1: 'WALL_DIAGONALCORNER',
        2: 'WALL_L',
        3: 'WALL_SQUARECORNER',
        9: 'WALL_DIAGONAL',

        4: 'WALLDECOR_STRAIGHT',
        5: 'WALLDECOR_STRAIGHT_OFFSET',
        6: 'WALLDECOR_DIAGONAL_NOOFFSET',
        7: 'WALLDECOR_DIAGONAL_OFFSET',
        8: 'WALLDECOR_DIAGONAL_BOTH',

        10: 'CENTREPIECE_STRAIGHT',
        11: 'CENTREPIECE_DIAGONAL',

        12: 'ROOF_STRAIGHT',
        13: 'ROOF_DIAGONAL_WITH_ROOFEDGE',
        14: 'ROOF_DIAGONAL',
        15: 'ROOF_L_CONCAVE',
        16: 'ROOF_L_CONVEX',
        17: 'ROOF_FLAT',

        18: 'ROOFEDGE_STRAIGHT',
        19: 'ROOFEDGE_DIAGONALCORNER',
        20: 'ROOFEDGE_L',
        21: 'ROOFEDGE_SQUARECORNER',

        22: 'GROUNDDECOR'
    };

    id = -1;
    models = [];
    shapes = [];
    name = '';
    desc = '';
    width = 1;
    length = 1;
    blockwalk = true;
    blockrange = true;
    interactable = false;
    hillskew = false;
    sharelight = false;
    occlude = false;
    anim = -1;
    disposeAlpha = false;
    walloff = 16;
    ambient = 0;
    contrast = 0;
    ops = [];
    recol_s = [];
    recol_d = [];
    mapfunction = -1;
    mirror = false;
    active = true;
    resizex = 128;
    resizey = 128;
    resizez = 128;
    mapscene = -1;
    blocksides = 0;
    xoff = 0;
    yoff = 0;
    zoff = 0;
    forcedecor = false;

    static unpack(dat, idx, preload = false) {
        LocationType.dat = dat;
        LocationType.count = idx.readWord();
        LocationType.offsets = [];
        LocationType.cache = [];

        let offset = 2;
        for (let i = 0; i < LocationType.count; i++) {
            LocationType.offsets[i] = offset;
            offset += idx.readWord();
        }

        if (preload) {
            for (let i = 0; i < LocationType.count; i++) {
                LocationType.get(i);
            }
        }
    }

    static load(config) {
        const dat = config.read('loc.dat');
        const idx = config.read('loc.idx');

        LocationType.unpack(dat, idx);
    }

    static loadRaw(force = false) {
        if (!LocationType.count || force) {
            const dat = ByteBuffer.fromFile('data/cache/raw/config/loc.dat');
            const idx = ByteBuffer.fromFile('data/cache/raw/config/loc.idx');

            LocationType.unpack(dat, idx);
        }
    }

    static pack() {
        const dat = new ByteBuffer();
        const idx = new ByteBuffer();

        idx.writeWord(LocationType.count);
        dat.writeWord(LocationType.count);

        for (let i = 0; i < LocationType.count; i++) {
            let locationType;
            if (LocationType.cache[i]) {
                locationType = LocationType.cache[i];
            } else {
                locationType = new LocationType(i);
            }

            const locationTypeDat = locationType.encode();
            idx.writeWord(locationTypeDat.length);
            dat.write(locationTypeDat);
        }

        return { dat, idx };
    }

    static get(id) {
        if (LocationType.cache[id]) {
            return LocationType.cache[id];
        } else {
            return new LocationType(id);
        }
    }

    static getByName(name) {
        for (let i = 0; i < LocationType.count; i++) {
            if (LocationType.get(i).name.toLowerCase() == name.toLowerCase()) {
                return LocationType.get(i);
            }
        }
        return null;
    }

    static find(predicate) {
        for (let i = 0; i < LocationType.count; i++) {
            if (predicate(LocationType.get(i))) {
                return LocationType.get(i);
            }
        }
        return null;
    }

    static filter(predicate) {
        let filtered = [];

        for (let i = 0; i < LocationType.count; i++) {
            if (predicate(LocationType.get(i))) {
                filtered.push(LocationType.get(i));
            }
        }

        return filtered;
    }

    static indexOf(predicate, start = 0) {
        for (let i = start; i < LocationType.count; i++) {
            if (predicate(LocationType.get(i))) {
                return i;
            }
        }

        return -1;
    }

    static toJagConfig() {
        let config = '';

        for (let i = 0; i < LocationType.count; i++) {
            config += LocationType.get(i).toJagConfig() + '\n';
        }

        return config;
    }

    constructor(id = 0, decode = true) {
        this.id = id;
        LocationType.cache[id] = this;

        if (decode) {
            const offset = LocationType.offsets[id];
            if (!offset) {
                return;
            }

            LocationType.dat.front().seek(offset);
            this.#decode();
        }
    }

    #decode() {
        const dat = LocationType.dat;

        let lastOpcode = -1;
        let interactive = -1;
        while (true) {
            const opcode = dat.readByte();
            if (opcode == 0) {
                break;
            }

            if (opcode == 1) {
                const count = dat.readByte();

                for (let i = 0; i < count; i++) {
                    this.models[i] = dat.readWord();
                    this.shapes[i] = dat.readByte();
                }
            } else if (opcode == 2) {
                this.name = dat.readString();
            } else if (opcode == 3) {
                this.desc = dat.readString();
            } else if (opcode == 5) {
                let count = dat.readByte();
                dat.seek(count * 2);
            } else if (opcode == 14) {
                this.width = dat.readByte();
            } else if (opcode == 15) {
                this.length = dat.readByte();
            } else if (opcode == 17) {
                this.blockwalk = false;
            } else if (opcode == 18) {
                this.blockrange = false;
            } else if (opcode == 19) {
                interactive = dat.readByte();

                if (interactive == 1) {
                    this.interactable = true;
                }
            } else if (opcode == 21) {
                this.hillskew = true;
            } else if (opcode == 22) {
                this.sharelight = true;
            } else if (opcode == 23) {
                this.occlude = true;
            } else if (opcode == 24) {
                this.anim = dat.readWord();

                if (this.anim == 65535) {
                    this.anim = -1;
                }
            } else if (opcode == 25) {
                this.disposeAlpha = true;
            } else if (opcode == 27) {
            } else if (opcode == 28) {
                this.walloff = dat.readByte();
            } else if (opcode == 29) {
                this.ambient = dat.readByteSigned();
            } else if (opcode == 39) {
                this.contrast = dat.readByteSigned();
            } else if (opcode >= 30 && opcode < 35) {
                this.ops[opcode - 30] = dat.readString();
            } else if (opcode == 40) {
                const count = dat.readByte();

                for (let i = 0; i < count; i++) {
                    this.recol_s[i] = dat.readWord();
                    this.recol_d[i] = dat.readWord();
                }
            } else if (opcode == 41) {
                let count = dat.readByte();
                dat.seek(count * 4);
            } else if (opcode == 42) {
                let count = dat.readByte();
                dat.seek(count);
            } else if (opcode == 60) {
                this.mapfunction = dat.readWord();
            } else if (opcode == 62) {
                this.mirror = true;
            } else if (opcode == 64) {
                this.active = false;
            } else if (opcode == 65) {
                this.resizex = dat.readWord();
            } else if (opcode == 66) {
                this.resizey = dat.readWord();
            } else if (opcode == 67) {
                this.resizez = dat.readWord();
            } else if (opcode == 68) {
                this.mapscene = dat.readWord();
            } else if (opcode == 69) {
                this.blocksides = dat.readByte();
            } else if (opcode == 70) {
                this.xoff = dat.readWordSigned();
            } else if (opcode == 71) {
                this.yoff = dat.readWordSigned();
            } else if (opcode == 72) {
                this.zoff = dat.readWordSigned();
            } else if (opcode == 73) {
                this.forcedecor = true;
            } else if (opcode == 74) {
            } else if (opcode == 75) {
                dat.readByte();
            } else if (opcode == 77 || opcode == 92) {
                dat.readWord();
                dat.readWord();

                if (opcode == 92) {
                    dat.readWord();
                }

                let count = dat.readByte();
                dat.seek((count + 1) * 2);
            } else if (opcode == 78) {
                dat.readWord();
                dat.readByte();
            } else if (opcode == 79) {
                dat.readWord();
                dat.readWord();
                dat.readByte();

                let count = dat.readByte();
                dat.seek(count * 2);
            } else if (opcode == 81) {
                dat.readByte();
            } else if (opcode == 82) {
            } else if (opcode == 88) {
            } else if (opcode == 89) {
            } else if (opcode == 90) {
            } else if (opcode == 91) {
            } else if (opcode == 93) {
                dat.readWord();
            } else if (opcode == 94) {
            } else if (opcode == 95) {
            } else if (opcode == 96) {
            } else if (opcode == 97) {
            } else if (opcode == 98) {
            } else if (opcode == 99) {
                dat.readByte();
                dat.readWord();
            } else if (opcode == 100) {
                dat.readByte();
                dat.readWord();
            } else if (opcode == 101) {
                dat.readByte();
            } else if (opcode == 102) {
                dat.readWord();
            } else if (opcode == 249) {
                let count = dat.readByte();

                for (let i = 0; i < count; i++) {
                    let isString = dat.readByte() == 1;
                    dat.readSWord();
                    if (isString) {
                        dat.readString();
                    } else {
                        dat.readDWord();
                    }
                }
            } else {
                console.error('Unknown LocationType opcode:', opcode, lastOpcode);
            }

            lastOpcode = opcode;
        }

        if (interactive == -1) {
            this.interactable = false;

            if ((this.shapes.length && this.shapes[0] == LocationType.CENTREPIECE_STRAIGHT) || this.ops.length) {
                this.interactable = true;
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
                dat.writeByte(this.shapes[i]);
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

        if (this.width) {
            dat.writeByte(14);
            dat.writeByte(this.width);
        }

        if (this.length) {
            dat.writeByte(15);
            dat.writeByte(this.length);
        }

        if (!this.blockwalk) {
            dat.writeByte(17);
        }

        if (!this.blockrange) {
            dat.writeByte(18);
        }

        if (this.interactable) {
            dat.writeByte(19);
            dat.writeByte(1); // is there any more logic to this?
        }

        if (this.hillskew) {
            dat.writeByte(21);
        }

        if (this.sharelight) {
            dat.writeByte(22);
        }

        if (this.occlude) {
            dat.writeByte(23);
        }

        if (this.anim != -1) {
            dat.writeByte(24);
            dat.writeWord(this.anim);
        }

        if (this.disposeAlpha) {
            dat.writeByte(25);
        }

        if (this.walloff != 16) {
            dat.writeByte(28);
            dat.writeByte(this.walloff);
        }

        if (this.ambient != 0) {
            dat.writeByte(29);
            dat.writeByte(this.ambient);
        }

        if (this.contrast != 0) {
            dat.writeByte(39);
            dat.writeByte(this.contrast);
        }

        for (let i = 0; i < 5; i++) {
            if (this.ops[i] != null) {
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

        if (this.mapfunction != -1) {
            dat.writeByte(60);
            dat.writeWord(this.mapfunction);
        }

        if (this.mirror) {
            dat.writeByte(62);
        }

        if (!this.active) {
            dat.writeByte(64);
        }

        if (this.resizex != 128) {
            dat.writeByte(65);
            dat.writeWord(this.resizex);
        }

        if (this.resizey != 128) {
            dat.writeByte(66);
            dat.writeWord(this.resizey);
        }

        if (this.resizez != 128) {
            dat.writeByte(67);
            dat.writeWord(this.resizez);
        }

        if (this.mapscene != -1) {
            dat.writeByte(68);
            dat.writeWord(this.mapscene);
        }

        if (this.blocksides != 0) {
            dat.writeByte(69);
            dat.writeByte(this.blocksides);
        }

        if (this.xoff != 0) {
            dat.writeByte(70);
            dat.writeWord(this.xoff);
        }

        if (this.yoff != 0) {
            dat.writeByte(71);
            dat.writeWord(this.yoff);
        }

        if (this.zoff != 0) {
            dat.writeByte(72);
            dat.writeWord(this.zoff);
        }

        if (this.forcedecor) {
            dat.writeByte(73);
        }

        dat.writeByte(0);
        return dat.front();
    }

    toJagConfig() {
        let config = `[loc_${this.id}]\n`;

        if (this.name) {
            config += `name=${this.name}\n`;
        }

        if (this.desc) {
            config += `desc=${this.desc}\n`;
        }

        for (let i = 0; i < this.models.length; ++i) {
            if (this.shapes[i] == LocationType.CENTREPIECE_STRAIGHT) {
                // this is the default
                config += `model${i + 1}=model_${this.models[i]}\n`;
            } else {
                config += `model${i + 1}=model_${this.models[i]},^${LocationType.SHAPE[this.shapes[i]]}\n`;
            }
        }

        if (this.width != 1) {
            config += `width=${this.width}\n`;
        }

        if (this.length != 1) {
            config += `length=${this.length}\n`;
        }

        if (!this.blockwalk) {
            config += `blockwalk=no\n`;
        }

        if (!this.blockrange) {
            config += `blockrange=no\n`;
        }

        if (this.hillskew) {
            config += `hillskew=yes\n`;
        }

        if (this.occlude) {
            config += `occlude=yes\n`;
        }

        if (this.anim != -1) {
            config += `anim=seq_${this.anim}\n`;
        }

        if (this.sharelight) {
            config += `sharelight=yes\n`;
        }

        if (this.ambient != 0) {
            config += `ambient=${this.ambient}\n`;
        }

        if (this.contrast != 0) {
            config += `contrast=${this.contrast}\n`;
        }

        if (this.mapfunction != -1) {
            config += `mapfunction=${this.mapfunction}\n`;
        }

        if (this.mapscene != -1) {
            config += `mapscene=${this.mapscene}\n`;
        }

        if (this.mirror) {
            config += `mirror=yes\n`;
        }

        if (!this.active) {
            config += `active=no\n`;
        }

        if (this.resizex != 128) {
            config += `resizex=${this.resizex}\n`;
        }

        if (this.resizey != 128) {
            config += `resizey=${this.resizey}\n`;
        }

        if (this.resizez != 128) {
            config += `resizez=${this.resizez}\n`;
        }

        if (this.blocksides != 0) {
            config += `blocksides=${this.blocksides}\n`;
        }

        if (this.xoff != 0) {
            config += `xoff=${this.xoff}\n`;
        }

        if (this.yoff != 0) {
            config += `yoff=${this.yoff}\n`;
        }

        if (this.zoff != 0) {
            config += `zoff=${this.zoff}\n`;
        }

        if (this.forcedecor) {
            config += `forcedecor=yes\n`;
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

        return config;
    }
}
