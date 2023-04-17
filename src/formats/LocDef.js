export class LocDef {
	static WALL_STRAIGHT = 0;
	static WALL_DIAGONALCORNER = 1;
	static WALL_L = 2;
	static WALL_SQUARECORNER = 3;
	static WALL_DIAGONAL = 9;

	static WALLDECOR_STRAIGHT_XOFFSET = 4;
	static WALLDECOR_STRAIGHT_ZOFFSET = 5;
	static WALLDECOR_DIAGONAL_XOFFSET = 6;
	static WALLDECOR_DIAGONAL_ZOFFSET = 7;
	static WALLDECOR_DIAGONAL_BOTH = 8;

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

	static CENTREPIECE_STRAIGHT = 10;
	static CENTREPIECE_DIAGONAL = 11;
	static GROUNDDECOR = 22;

    instances = [];

    static unpack(dat, mapscene, mapfunction) {
        const loc = new LocDef();
        loc.count = dat.readWord();
        for (let id = 0; id < loc.count; ++id) {
            let i = {
                id,
                hasCollision: true, isSolid: true, hasShadow: true,
                sizeX: 1, sizeZ: 1
            };

            while (true) {
                let opcode = dat.readByte();

                if (opcode === 0) {
                    break;
                }

                switch (opcode) {
                case 1: {
                    let count = dat.readByte();
                    i.modelIndices = [];
                    i.modelTypes = [];
                    for (let n = 0; n < count; ++n) {
                        i.modelIndices[n] = dat.readWord();
                        i.modelTypes[n] = dat.readByte();
                    }
                } break;
                case 2: {
                    i.name = dat.readString();
                } break;
                case 3: {
                    i.description = dat.readString();
                } break;
                case 5: {
                    // new opcode
                    let count = dat.readByte();
                    i.modelIndices = [];
                    i.modelTypes = [];
                    for (let n = 0; n < count; ++n) {
                        i.modelIndices[n] = dat.readWord();
                        i.modelTypes[n] = 10;
                    }
                } break;
                case 14: {
                    i.sizeX = dat.readByte();
                } break;
                case 15: {
                    i.sizeZ = dat.readByte();
                } break;
                case 17: {
                    i.hasCollision = false;
                } break;
                case 18: {
                    i.isSolid = false;
                } break;
                case 19: {
                    i.interactable = dat.readBoolean();
                } break;
                case 21: {
                    i.adjustToTerrain = true;
                } break;
                case 22: {
                    i.delayShading = true;
                } break;
                case 23: {
                    i.culls = true;
                } break;
                case 24: {
                    i.animationIndex = dat.readWord();
                    if (i.animationIndex === 65535) {
                        delete i.animationIndex;
                    }
                } break;
                case 25: {
                    i.disposeAlpha = true;
                } break;
                case 28: {
                    i.thickness = dat.readByte();
                } break;
                case 29: {
                    i.brightness = dat.readByteSigned();
                } break;
                case 30:
                case 31:
                case 32:
                case 33:
                case 34:
                case 35:
                case 36:
                case 37:
                case 38: {
                    if (!i.options) {
                        i.actions = [];
                    }

                    i.actions[opcode - 30] = dat.readString();
                } break;
                case 39: {
                    i.specular = dat.readByteSigned();
                } break;
                case 40: {
                    let count = dat.readByte();
                    i.oldColors = [];
                    i.newColors = [];
                    for (let n = 0; n < count; ++n) {
                        i.oldColors[n] = dat.readWord();
                        i.newColors[n] = dat.readWord();
                    }
                } break;
                case 60: {
                    i.mapfunction = dat.readWord();
                    i.mapfunctionImage = mapfunction[i.mapfunction];
                } break;
                case 62: {
                    i.rotateCounterClockwise = true;
                } break;
                case 64: {
                    i.hasShadow = false;
                } break;
                case 65: {
                    i.scaleX = dat.readWord();
                } break;
                case 66: {
                    i.scaleY = dat.readWord();
                } break;
                case 67: {
                    i.scaleZ = dat.readWord();
                } break;
                case 68: {
                    i.mapscene = dat.readWord();
                    i.mapsceneImage = mapscene[i.mapscene];
                } break;
                case 69: {
                    i.interactionSideFlags = dat.readByte();
                } break;
                case 70: {
                    i.translateX = dat.readWordSigned();
                } break;
                case 71: {
                    i.translateY = dat.readWordSigned();
                } break;
                case 72: {
                    i.translateZ = dat.readWordSigned();
                } break;
                case 73: {
                    i.obstructsGround = true;
                } break;
                case 74:
                    // new opcode
                    i.hollow = false;
                    break;
                case 75:
                    // new opcode
                    i.supportItems = dat.readByte();
                    break;
                case 77: {
                    // new opcode
                    i.varbit = dat.readWord();
                    if (i.varbit === 65535) {
                        i.varbit = -1;
                    }
                    i.varp = dat.readWord();
                    if (i.varp === 65535) {
                        i.varp = -1;
                    }
                    let count = dat.readByte();
                    i.morphisms = [];
                    for (let n = 0; n <= count; ++n) {
                        i.morphisms[n] = dat.readWord();
                        if (i.morphisms[n] === 65535) {
                            i.morphisms[n] = -1;
                        }
                    }
                } break;
                default:
                    console.error('Unknown opcode ' + opcode);
                    return;
                }
            }

            loc.instances[id] = i;
        }

        return loc;
    }

    get(id) {
        return this.instances[id];
    }

    filter(name) {
        return this.instances.filter(x => x.name === name);
    }
}