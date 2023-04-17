import { ByteBuffer } from '#util/ByteBuffer.js';

export default class ObjectType {
    static dat = null;
    static count = 0;
    static offsets = [];
    static cache = [];

    id = -1;
    model = 0;
    name = '';
    desc = '';
    zoom2d = 2000;
    xan2d = 0;
    yan2d = 0;
    xof2d = 0;
    yof2d = 0;
    opcode9 = false;
    opcode10 = -1;
    stackable = false;
    cost = 1;
    members = false;
    manwear = -1;
    manwearOffsetY = 0;
    manwear2 = -1;
    womanwear = -1;
    womanwearOffsetY = 0;
    womanwear2 = -1;
    ops = [];
    iops = [];
    recol_s = [];
    recol_d = [];
    manwear3 = -1;
    womanwear3 = -1;
    manhead = -1;
    womanhead = -1;
    manhead2 = -1;
    womanhead2 = -1;
    zan2d = 0;
    certlink = -1;
    certtemplate = -1;
    countobj = [];
    countco = [];

    static unpack(dat, idx, preload = false) {
        ObjectType.dat = dat;
        ObjectType.count = idx.readWord();
        ObjectType.offsets = [];
        ObjectType.cache = [];

        let offset = 2;
        for (let i = 0; i < ObjectType.count; i++) {
            ObjectType.offsets[i] = offset;
            offset += idx.readWord();
        }

        if (preload) {
            for (let i = 0; i < ObjectType.count; i++) {
                ObjectType.get(i);
            }
        }
    }

    static load(config) {
        const dat = config.read('obj.dat');
        const idx = config.read('obj.idx');

        ObjectType.unpack(dat, idx);
    }

    static loadRaw() {
        const dat = ByteBuffer.fromFile('data/cache/raw/config/obj.dat');
        const idx = ByteBuffer.fromFile('data/cache/raw/config/obj.idx');

        ObjectType.unpack(dat, idx);
    }

    static pack() {
        const dat = new ByteBuffer();
        const idx = new ByteBuffer();

        idx.writeWord(ObjectType.count);
        dat.writeWord(ObjectType.count);

        for (let i = 0; i < ObjectType.count; i++) {
            let objectType;
            if (ObjectType.cache[i]) {
                objectType = ObjectType.cache[i];
            } else {
                objectType = new ObjectType(i);
            }

            const objectTypeDat = objectType.encode();
            idx.writeWord(objectTypeDat.length);
            dat.write(objectTypeDat);
        }

        return { dat, idx };
    }

    static get(id) {
        if (ObjectType.cache[id]) {
            return ObjectType.cache[id];
        } else if (typeof ObjectType.offsets[id] !== 'undefined') {
            return new ObjectType(id);
        } else {
            return null;
        }
    }

    static getByName(name) {
        for (let i = 0; i < ObjectType.count; i++) {
            if (ObjectType.get(i).name.replaceAll(' ', '_').toLowerCase() == name.toLowerCase()) {
                return ObjectType.get(i);
            }
        }
        return null;
    }

    static find(predicate) {
        for (let i = 0; i < ObjectType.count; i++) {
            if (predicate(ObjectType.get(i))) {
                return ObjectType.get(i);
            }
        }
        return null;
    }

    static filter(predicate) {
        let filtered = [];

        for (let i = 0; i < ObjectType.count; i++) {
            if (predicate(ObjectType.get(i))) {
                filtered.push(ObjectType.get(i));
            }
        }

        return filtered;
    }

    static indexOf(predicate, start = 0) {
        for (let i = start; i < ObjectType.count; i++) {
            if (predicate(ObjectType.get(i))) {
                return i;
            }
        }

        return -1;
    }

    static toJagConfig() {
        let config = '';

        for (let i = 0; i < ObjectType.count; i++) {
            config += ObjectType.get(i).toJagConfig() + '\n';
        }

        return config;
    }

    constructor(id = 0, decode = true) {
        this.id = id;
        ObjectType.cache[id] = this;

        if (decode) {
            const offset = ObjectType.offsets[id];
            if (!offset) {
                return;
            }

            ObjectType.dat.front().seek(offset);
            this.#decode();

            if (this.certtemplate != -1) {
                this.#toCertificate();
            }
        }
    }

    getHighAlchValue() {
        return Math.floor(this.cost * 0.6);
    }

    getLowAlchValue() {
        return Math.floor(this.cost * 0.4);
    }

    #decode() {
        const dat = ObjectType.dat;

        while (true) {
            const opcode = dat.readByte();
            if (opcode == 0) {
                break;
            }

            if (opcode == 1) {
                this.model = dat.readWord();
            } else if (opcode == 2) {
                this.name = dat.readString();
            } else if (opcode == 3) {
                this.desc = dat.readString();
            } else if (opcode == 4) {
                this.zoom2d = dat.readWord();
            } else if (opcode == 5) {
                this.xan2d = dat.readWordSigned();
            } else if (opcode == 6) {
                this.yan2d = dat.readWordSigned();
            } else if (opcode == 7) {
                this.xof2d = dat.readWordSigned();
            } else if (opcode == 8) {
                this.yof2d = dat.readWordSigned();
            } else if (opcode == 9) {
                this.opcode9 = true;
            } else if (opcode == 10) {
                this.opcode10 = dat.readWord();
            } else if (opcode == 11) {
                this.stackable = true;
            } else if (opcode == 12) {
                this.cost = dat.readDWord();
            } else if (opcode == 16) {
                this.members = true;
            } else if (opcode == 23) {
                this.manwear = dat.readWord();
                this.manwearOffsetY = dat.readByteSigned();
            } else if (opcode == 24) {
                this.manwear2 = dat.readWord();
            } else if (opcode == 25) {
                this.womanwear = dat.readWord();
                this.womanwearOffsetY = dat.readByteSigned();
            } else if (opcode == 26) {
                this.womanwear2 = dat.readWord();
            } else if (opcode >= 30 && opcode < 35) {
                this.ops[opcode - 30] = dat.readString();
            } else if (opcode >= 35 && opcode < 40) {
                this.iops[opcode - 35] = dat.readString();
            } else if (opcode == 40) {
                const count = dat.readByte();

                for (let i = 0; i < count; i++) {
                    this.recol_s[i] = dat.readWord();
                    this.recol_d[i] = dat.readWord();
                }
            } else if (opcode == 78) {
                this.manwear3 = dat.readWord();
            } else if (opcode == 79) {
                this.womanwear3 = dat.readWord();
            } else if (opcode == 90) {
                this.manhead = dat.readWord();
            } else if (opcode == 91) {
                this.womanhead = dat.readWord();
            } else if (opcode == 92) {
                this.manhead2 = dat.readWord();
            } else if (opcode == 93) {
                this.womanhead2 = dat.readWord();
            } else if (opcode == 95) {
                this.zan2d = dat.readWord();
            } else if (opcode == 97) {
                this.certlink = dat.readWord();
            } else if (opcode == 98) {
                this.certtemplate = dat.readWord();
            } else if (opcode >= 100 && opcode < 110) {
                this.countobj[opcode - 100] = dat.readWord();
                this.countco[opcode - 100] = dat.readWord();
            } else {
                console.error('Unknown ObjectType opcode:', opcode);
            }
        }
    }

    #toCertificate() {
        let template = new ObjectType(this.certtemplate);
        this.model = template.model;
        this.zoom2d = template.zoom2d;
        this.xan2d = template.xan2d;
        this.yan2d = template.yan2d;
        this.zan2d = template.zan2d;
        this.xof2d = template.xof2d;
        this.yof2d = template.yof2d;
        this.recol_s = template.recol_s;
        this.recol_d = template.recol_d;

        let link = new ObjectType(this.certlink);
        this.name = link.name;
        this.desc = link.desc;
        this.cost = link.cost;

        let article = 'a';
        if (link.name[0] == 'A' || link.name[0] == 'E' || link.name[0] == 'I' || link.name[0] == 'O' || link.name[0] == 'U') {
            article = 'an';
        }
        this.desc = `Swap this note at any bank for ${article} ${link.name}.`;
        this.stackable = true;
    }

    encode() {
        const dat = new ByteBuffer();

        if (this.model != 0 && this.certtemplate == -1) {
            dat.writeByte(1);
            dat.writeWord(this.model);
        }

        if (this.name && this.certlink == -1) {
            dat.writeByte(2);
            dat.writeString(this.name);
        }

        if (this.desc && this.certlink == -1) {
            dat.writeByte(3);
            dat.writeString(this.desc);
        }

        if (this.zoom2d != 2000 && this.certtemplate == -1) {
            dat.writeByte(4);
            dat.writeWord(this.zoom2d);
        }

        if (this.xan2d != 0 && this.certtemplate == -1) {
            dat.writeByte(5);
            dat.writeWord(this.xan2d);
        }

        if (this.yan2d != 0 && this.certtemplate == -1) {
            dat.writeByte(6);
            dat.writeWord(this.yan2d);
        }

        if (this.xof2d != 0 && this.certtemplate == -1) {
            dat.writeByte(7);
            dat.writeWord(this.xof2d);
        }

        if (this.yof2d != 0 && this.certtemplate == -1) {
            dat.writeByte(8);
            dat.writeWord(this.yof2d);
        }

        if (this.opcode9) {
            dat.writeByte(9);
        }

        if (this.opcode10 != -1) {
            dat.writeByte(10);
            dat.writeWord(this.opcode10);
        }

        if (this.stackable && this.certtemplate == -1) {
            dat.writeByte(11);
        }

        if (this.cost != 1 && this.certlink == -1) {
            dat.writeByte(12);
            dat.writeDWord(this.cost);
        }

        if (this.members) {
            dat.writeByte(16);
        }

        if (this.manwear != -1) {
            dat.writeByte(23);
            dat.writeWord(this.manwear);
            dat.writeByte(this.manwearOffsetY);
        }

        if (this.manwear2 != -1) {
            dat.writeByte(24);
            dat.writeWord(this.manwear2);
        }

        if (this.womanwear != -1) {
            dat.writeByte(25);
            dat.writeWord(this.womanwear);
            dat.writeByte(this.womanwearOffsetY);
        }

        if (this.womanwear2 != -1) {
            dat.writeByte(26);
            dat.writeWord(this.womanwear2);
        }

        for (let i = 0; i < 5; i++) {
            if (this.ops[i] != null) {
                dat.writeByte(30 + i);
                dat.writeString(this.ops[i]);
            }
        }

        for (let i = 0; i < 5; i++) {
            if (this.iops[i] != null) {
                dat.writeByte(35 + i);
                dat.writeString(this.iops[i]);
            }
        }

        if (this.recol_s.length && this.certtemplate == -1) {
            dat.writeByte(40);
            dat.writeByte(this.recol_s.length);

            for (let i = 0; i < this.recol_s.length; i++) {
                dat.writeWord(this.recol_s[i]);
                dat.writeWord(this.recol_d[i]);
            }
        }

        if (this.manwear3 != -1) {
            dat.writeByte(78);
            dat.writeWord(this.manwear3);
        }

        if (this.womanwear3 != -1) {
            dat.writeByte(79);
            dat.writeWord(this.womanwear3);
        }

        if (this.manhead != -1) {
            dat.writeByte(90);
            dat.writeWord(this.manhead);
        }

        if (this.womanhead != -1) {
            dat.writeByte(91);
            dat.writeWord(this.womanhead);
        }

        if (this.manhead2 != -1) {
            dat.writeByte(92);
            dat.writeWord(this.manhead2);
        }

        if (this.womanhead2 != -1) {
            dat.writeByte(93);
            dat.writeWord(this.womanhead2);
        }

        if (this.zan2d != 0) {
            dat.writeByte(95);
            dat.writeWord(this.zan2d);
        }

        if (this.certlink != -1) {
            dat.writeByte(97);
            dat.writeWord(this.certlink);
        }

        if (this.certtemplate != -1) {
            dat.writeByte(98);
            dat.writeWord(this.certtemplate);
        }

        for (let i = 0; i < this.countobj.length; i++) {
            dat.writeByte(100 + i);
            dat.writeWord(this.countobj[i]);
            dat.writeWord(this.countco[i]);
        }

        dat.writeByte(0);
        return dat.front();
    }

    toJagConfig() {
        let config;

        if (this.certlink != -1) {
            config = `[cert_obj_${this.id}]\n`;
            config += `certlink=obj_${this.certlink}\n`;
            config += `certtemplate=obj_${this.certtemplate}\n`;
            return config;
        } else {
            config = `[obj_${this.id}]\n`;
        }

		if (this.name) {
            config += `name=${this.name}\n`;
		}

		if (this.desc) {
            config += `desc=${this.desc}\n`;
		}

		if (this.model != 0) {
            config += `model=model_${this.model}\n`;
		}

		if (this.manwear != -1) {
            config += `manwear=model_${this.manwear}`;

			if (this.manwearOffsetY != 0) {
                config += `,${this.manwearOffsetY}`;
			}

            config += '\n';
		}

		if (this.manwear2 != -1) {
            config += `manwear2=model_${this.manwear2}\n`;
		}

		if (this.manwear3 != -1) {
            config += `manwear3=model_${this.manwear3}\n`;
		}

		if (this.womanwear != -1) {
            config += `womanwear=model_${this.womanwear}`;

			if (this.womanwearOffsetY != 0) {
                config += `,${this.womanwearOffsetY}`;
			}

            config += '\n';
		}

		if (this.womanwear2 != -1) {
            config += `womanwear2=model_${this.womanwear2}\n`;
		}

		if (this.womanwear3 != -1) {
            config += `womanwear3=model_${this.womanwear3}\n`;
		}

		if (this.manhead != -1) {
            config += `manhead=model_${this.manhead}\n`;
		}

		if (this.manhead2 != -1) {
            config += `manhead2=model_${this.manhead2}\n`;
		}

		if (this.womanhead != -1) {
            config += `womanhead=model_${this.womanhead}\n`;
		}

		if (this.womanhead2 != -1) {
            config += `womanhead2=model_${this.womanhead2}\n`;
		}

		if (this.cost != 1) {
            config += `cost=${this.cost}\n`;
		}

		if (this.zoom2d != 2000) {
            config += `2dzoom=${this.zoom2d}\n`;
		}

		if (this.xof2d != 0) {
            config += `2dxof=${this.xof2d}\n`;
		}

		if (this.yof2d != 0) {
            config += `2dyof=${this.yof2d}\n`;
		}

		if (this.xan2d != 0) {
            config += `2dxan=${this.xan2d}\n`;
		}

		if (this.yan2d != 0) {
            config += `2dyan=${this.yan2d}\n`;
		}

		if (this.zan2d != 0) {
            config += `2dzan=${this.zan2d}\n`;
		}

		if (this.stackable) {
            config += `stackable=yes\n`;
		}

		if (this.members) {
            config += `members=yes\n`;
		}

        for (let i = 0; i < this.countobj.length; ++i) {
            if (this.countobj[i] == 0) {
                continue;
            }

            config += `count${i + 1}=obj_${this.countobj[i]},${this.countco[i]}\n`;
        }

        for (let i = 0; i < this.ops.length; ++i) {
            if (this.ops[i] == null) {
                continue;
            }

            config += `op${i + 1}=${this.ops[i]}\n`;
        }

        for (let i = 0; i < this.iops.length; ++i) {
            if (this.iops[i] == null) {
                continue;
            }

            config += `iop${i + 1}=${this.iops[i]}\n`;
        }

        for (let i = 0; i < this.recol_s.length; ++i) {
            config += `recol${i + 1}s=${this.recol_s[i]}\n`;
            config += `recol${i + 1}d=${this.recol_d[i]}\n`;
        }

        return config;
    }
}
