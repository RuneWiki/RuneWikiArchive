export class FloorDef {
    instances = [];

    static unpack(dat, textures) {
        const flo = new FloorDef();
        flo.count = dat.readWord();
        for (let id = 0; id < flo.count; ++id) {
            let i = { id };
            while (true) {
                let opcode = dat.readByte();

                if (opcode === 0) {
                    break;
                }

                switch (opcode) {
                    case 1:
                        i.rgb = dat.readSWord() >>> 0;
                        break;
                    case 2:
                        i.textureIndex = dat.readByte();
                        i.texture = textures[i.textureIndex];
                        i.rgb = i.texture.average;
                        break;
                    case 3:
                        i.opcode3 = true;
                        break;
                    case 5:
                        i.occlude = false;
                        break;
                    case 6:
                        i.name = dat.readString();
                        break;
                    case 7:
                        i.rgb = dat.readSWord() >>> 0;
                        break;
                    default:
                        console.error('Unknown opcode ' + opcode);
                        return;
                }
            }

            flo.instances[id] = i;
        }

        return flo;
    }

    get(id) {
        return this.instances[id];
    }
}
