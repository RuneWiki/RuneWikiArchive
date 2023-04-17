import { ByteBuffer } from '#util/ByteBuffer.js';

export default class SequenceBase {
    static instances = [];

    length = 0;
    transformTypes = [];
    groupLabels = [];

    static unpack(head, type, label) {
        const total = head.readWord();
        const count = head.readWord();

        for (let i = 0; i < total; i++) {
            let id = head.readWord();
            let length = head.readByte();

            let transformTypes = [];
            let groupLabels = [];
            for (let j = 0; j < length; j++) {
                transformTypes[j] = type.readByte();
                let groupCount = label.readByte();

                groupLabels[j] = [];
                for (let k = 0; k < groupCount; k++) {
                    groupLabels[j][k] = label.readByte();
                }
            }

            let base = new SequenceBase();
            base.length = length;
            base.transformTypes = transformTypes;
            base.groupLabels = groupLabels;
            SequenceBase.instances[id] = base;
        }
    }

    static load(config) {
        const head = config.read('base_head.dat');
        const type = config.read('base_type.dat');
        const label = config.read('base_label.dat');

        this.unpack(head, type, label);
    }

    static loadRaw() {
        const head = ByteBuffer.fromFile('data/cache/raw/models/base_head.dat');
        const type = ByteBuffer.fromFile('data/cache/raw/models/base_type.dat');
        const label = ByteBuffer.fromFile('data/cache/raw/models/base_label.dat');

        this.unpack(head, type, label);
    }

    static get(id) {
        return this.instances[id];
    }
}
