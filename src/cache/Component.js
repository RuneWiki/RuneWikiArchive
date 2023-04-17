import { ByteBuffer } from '#util/ByteBuffer.js';

export default class Component {
    static TYPE_PARENT = 0;
    static TYPE_UNUSED = 1;
    static TYPE_INVENTORY = 2;
    static TYPE_RECT = 3;
    static TYPE_TEXT = 4;
    static TYPE_SPRITE = 5;
    static TYPE_MODEL = 6;
    static TYPE_INVENTORY_TEXT = 7;

    static NO_BUTTON = 0;
    static BUTTON = 1;
    static TARGET_BUTTON = 2;
    static CLOSE_BUTTON = 3;
    static TOGGLE_BUTTON = 4;
    static SELECT_BUTTON = 5;
    static PAUSE_BUTTON = 6;

    static dat = null;
    static count = 0;
    static instances = [];
    static ids = [];

    static unpack(data) {
        Component.count = data.readWord();

        let parent = -1;
        while (data.available) {
            let id = data.readWord();
            if (id === 65535) {
                parent = data.readWord();
                id = data.readWord();
            }

            let i = {
                id,
                parent,
                type: data.readByte(),
                buttonType: data.readByte(),
                contentType: data.readWord(),
                width: data.readWord(),
                height: data.readWord(),
                hoverParentIndex: data.readByte()
            };

            if (i.hoverParentIndex !== 0) {
                i.hoverParentIndex = ((i.hoverParentIndex - 1) << 8) + data.readByte();
            } else {
                i.hoverParentIndex = -1;
            }

            let comparatorCount = data.readByte();
            if (comparatorCount > 0) {
                i.scriptCompareType = [];
                i.scriptCompareValue = [];
                for (let n = 0; n < comparatorCount; ++n) {
                    i.scriptCompareType[n] = data.readByte();
                    i.scriptCompareValue[n] = data.readWord();
                }
            }

            let scriptCount = data.readByte();
            if (scriptCount > 0) {
                i.script = [];
                for (let script = 0; script < scriptCount; ++script) {
                    let opcodeCount = data.readWord();
                    i.script[script] = [];
                    for (let opcode = 0; opcode < opcodeCount; ++opcode) {
                        i.script[script][opcode] = data.readWord();
                    }
                }
            }

            if (i.type === Component.TYPE_PARENT) {
                i.scrollHeight = data.readWord();
                i.hidden = data.readBoolean();
                let n = data.readByte();
                i.children = [];
                i.childX = [];
                i.childY = [];
                for (let m = 0; m < n; ++m) {
                    i.children[m] = data.readWord();
                    i.childX[m] = data.readWordSigned();
                    i.childY[m] = data.readWordSigned();
                }
            }

            if (i.type === Component.TYPE_UNUSED) {
                i.unusedInt = data.readWord();
                i.unusedBoolean = data.readBoolean();
            }

            if (i.type === Component.TYPE_INVENTORY) {
                i.inventoryIndices = [];
                i.inventoryAmount = [];

                i.inventoryDummy = data.readBoolean();
                i.inventoryHasOptions = data.readBoolean();
                i.inventoryIsUsable = data.readBoolean();
                i.inventoryMarginX = data.readByte();
                i.inevntoryMarginY = data.readByte();
                i.inventoryOffsetX = [];
                i.inventoryOffsetY = [];
                i.inventorySprite = [];

                for (let n = 0; n < 20; ++n) {
                    if (data.readBoolean()) {
                        i.inventoryOffsetX[n] = data.readWordSigned();
                        i.inventoryOffsetY[n] = data.readWordSigned();
                        i.inventorySprite[n] = data.readString();
                    }
                }

                i.inventoryOptions = [];
                for (let n = 0; n < 5; ++n) {
                    i.inventoryOptions[n] = data.readString();
                    if (i.inventoryOptions[n].length === 0) {
                        delete i.inventoryOptions[n];
                    }
                }
            }

            if (i.type === Component.TYPE_RECT) {
                i.fill = data.readBoolean();
            }

            if (i.type === Component.TYPE_TEXT || i.type === Component.TYPE_UNUSED) {
                i.center = data.readBoolean();
                i.font = data.readByte();
                i.shadow = data.readBoolean();
            }

            if (i.type === Component.TYPE_TEXT) {
                i.text = data.readString();
                i.activeText = data.readString();
                if (i.activeText.length === 0) {
                    delete i.activeText;
                }
            }

            if (i.type === Component.TYPE_UNUSED || i.type === Component.TYPE_RECT || i.type === Component.TYPE_TEXT) {
                i.color = data.readDWord();
            }

            if (i.type === Component.TYPE_RECT || i.type === Component.TYPE_TEXT) {
                i.colorEnabled = data.readDWord();
                i.hoverColor = data.readDWord();
            }

            if (i.type === Component.TYPE_SPRITE) {
                i.image = data.readString();
                i.activeImage = data.readString();
                if (i.activeImage.length === 0) {
                    delete i.activeImage;
                }
            }

            if (i.type === Component.TYPE_MODEL) {
                let temp = data.readByte();
                if (temp !== 0) {
                    i.modelDisabled = ((temp - 1) << 8) + data.readByte();
                }

                temp = data.readByte();
                if (temp !== 0) {
                    i.modelEnabled = ((temp - 1) << 8) + data.readByte();
                }

                temp = data.readByte();
                if (temp !== 0) {
                    i.seqId = ((temp - 1) << 8) + data.readByte();
                } else {
                    i.seqId = -1;
                }

                temp = data.readByte();
                if (temp !== 0) {
                    i.activeSeqId = ((temp - 1) << 8) + data.readByte();
                } else {
                    i.activeSeqId = -1;
                }

                i.modelZoom = data.readWord();
                i.modelEyePitch = data.readWord();
                i.modelYaw = data.readWord();
            }

            if (i.type === Component.TYPE_INVENTORY_TEXT) {
                i.inventoryIndices = [];
                i.inventoryAmount = [];

                i.center = data.readBoolean();
                i.font = data.readByte();
                i.shadow = data.readBoolean();
                i.color = data.readDWord();

                i.inventoryMarginX = data.readWordSigned();
                i.inventoryMarginY = data.readWordSigned();
                i.inventoryHasOptions = data.readBoolean();

                i.inventoryOptions = [];
                for (let n = 0; n < 5; ++n) {
                    i.inventoryOptions[n] = data.readString();
                    if (i.inventoryOptions[n].length === 0) {
                        delete i.inventoryOptions[n];
                    }
                }
            }

            if (i.buttonType === Component.TARGET_BUTTON || i.type === Component.TYPE_INVENTORY) {
                i.optionCircumfix = data.readString();
                i.optionSuffix = data.readString();
                i.optionFlags = data.readWord();
            }

            if (i.buttonType === Component.BUTTON || i.buttonType === Component.TOGGLE_BUTTON ||
                i.buttonType === Component.SELECT_BUTTON || i.buttonType === Component.PAUSE_BUTTON) {
                i.option = data.readString();
                if (i.option.length === 0) {
                    if (i.buttonType === Component.BUTTON) {
                        i.option = "Ok";
                    } else if (i.buttonType === Component.TOGGLE_BUTTON) {
                        i.option = "Select";
                    } else if (i.buttonType === Component.SELECT_BUTTON) {
                        i.option = "Select";
                    } else if (i.buttonType === Component.PAUSE_BUTTON) {
                        i.option = "Continue";
                    }
                }
            }

            Component.instances[id] = i;
        }

        // let tracks = {};
        // let music = Component.instances[4262];
        // for (let i = 0; i < music.children.length; i++) {
        //     let child = Component.instances[music.children[i]];
        //     if (child.type != 4 || !child.script) {
        //         continue;
        //     }

        //     let safeName = child.text.replaceAll(' ', '_').replaceAll('-', '').toLowerCase();
        //     let varp = child.script[0][1];
        //     let bit = child.script[0][2];
        //     tracks[safeName] = { name: child.text, varp, bit };
        // }
        // fs.writeFileSync('tracks.json', JSON.stringify(tracks, null, 2));
    }

    static load(inter) {
        const data = archive.read('data');

        this.unpack(data);
    }

    static loadRaw() {
        const data = ByteBuffer.fromFile('data/cache/raw/interface/data');

        this.unpack(data);
    }

    static get(id) {
        return Component.instances[id];
    }
}
