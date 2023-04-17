import fs from 'fs';
import child_process from 'child_process';
import zlib from 'zlib';
import { decompressBz2 } from '#util/Bzip2.js';

export default class Packet {
    static crctable = new Int32Array(256);

    static {
        for (let i = 0; i < 256; i++) {
            let crc = i;

            for (let j = 0; j < 8; j++) {
                if ((crc & 1) == 1) {
                    crc = crc >>> 1 ^ 0xEDB88320;
                } else {
                    crc >>>= 1;
                }
            }

            Packet.crctable[i] = crc;
        }
    }

    static fromFile(path) {
        return new Packet(fs.readFileSync(path));
    }

    static crc32(src, length = src.pos, offset = 0) {
        if (src instanceof Packet) {
            src = src.gdata(length, offset, false);
        }

        let crc = 0xFFFFFFFF;

        for (let i = offset; i < length; i++) {
            crc = crc >>> 8 ^ Packet.crctable[(crc ^ src[i]) & 0xFF];
        }

        return ~crc;
    }

    static bzip2(src, offset, length, prependLength = true) {
        if (src instanceof Packet) {
            src = src.data;
        }

        let path = `dump/${Date.now()}.tmp`;

        fs.writeFileSync(path, src.slice(offset, offset + length));
        child_process.execSync(`java -jar JagCompress.jar bz2 ${path}`);
        fs.unlinkSync(path);
    
        let compressed = Packet.fromFile(path + '.bz2');
        fs.unlinkSync(path + '.bz2');
        if (prependLength) {
            // replace BZip2 header
            compressed.p4(src.length);
        } else {
            // remove BZip2 header
            compressed.pos += 4;
            compressed = compressed.gdata();
        }

        return compressed;
    }

    static gzip(src, offset, length) {
        if (src instanceof Packet) {
            src = src.data;
        }

        let path = `dump/${Date.now()}.tmp`;

        fs.writeFileSync(path, src.slice(offset, offset + length));
        child_process.execSync(`java -jar JagCompress.jar gz ${path}`);
        fs.unlinkSync(path);

        let compressed = Packet.fromFile(path + '.gz');
        fs.unlinkSync(path + '.gz');

        return compressed;
    }

    data = null;
    pos = 0;

    constructor(src) {
        if (src instanceof Buffer) {
            this.data = src;
        } else if (src instanceof Packet) {
            this.data = src.data;
        } else if (typeof src === 'string') {
            this.data = Buffer.from(src, 'hex');
        } else {
            this.data = src;
        }

        this.data = new Uint8Array(this.data);
        this.pos = 0;
    }

    get length() {
        return this.data.length;
    }

    get available() {
        return this.data.length - this.pos;
    }

    resize(length) {
        if (this.data.length < length) {
            this.data = new Uint8Array(Buffer.concat([this.data, Buffer.alloc(length - this.data.length)]));
        }
    }

    ensure(capacity) {
        if (this.available < capacity) {
            this.resize(capacity - this.available + this.length);
        }
    }

    toFile(path) {
        fs.writeFileSync(path, this.gdata(this.length, 0, false));
    }

    getcrc() {
        return Packet.crc32(this);
    }

    addcrc() {
        let crc = this.getcrc();
        this.p4(crc);
        return crc;
    }

    checkcrc() {
        this.pos -= 4;
        let storedCrc = this.g4();
        let thisCrc = Packet.crc32(this, this.length - this.pos, this.pos);
        return storedCrc === thisCrc;
    }

    prepend(raw) {
        this.data = new Uint8Array(Buffer.concat([raw, this.data]));
    }

    gunzip() {
        return zlib.gunzipSync(this.data);
    }

    bunzip2(prepend = true) {
        return decompressBz2(this.data, prepend);
    }

    // getters

    g1() {
        return this.data[this.pos++];
    }

    g1b() {
        return this.data[this.pos++] << 24 >> 24;
    }

    g2() {
        return ((this.data[this.pos++] << 8) | this.data[this.pos++]) >>> 0;
    }

    g2s() {
        return (this.data[this.pos++] << 8) | this.data[this.pos++];
    }

    g3() {
        return ((this.data[this.pos++] << 16) | (this.data[this.pos++] << 8) | this.data[this.pos++]) >>> 0;
    }

    g4() {
        return ((this.data[this.pos++] << 24) | (this.data[this.pos++] << 16) | (this.data[this.pos++] << 8) | this.data[this.pos++]) >>> 0;
    }

    g4s() {
        return (this.data[this.pos++] << 24) | (this.data[this.pos++] << 16) | (this.data[this.pos++] << 8) | this.data[this.pos++];
    }

    g8() {
        let a = this.g4();
        let b = this.g4();
        return (BigInt(a) << 32n) | BigInt(b);
    }

    gjstr() {
        let start = this.pos;
        while (this.data[this.pos++] !== 10) {}
        return this.data.slice(start, this.pos - 1).toString();
    }

    // 0 to 32767
    gsmart() {
        let value = this.data[this.pos];
        return value < 0x80 ? this.g1() : this.g2() - 0x8000;
    }

    // -16384 to 16383
    gsmarts() {
        let value = this.data[this.pos];
        return value < 0x80 ? this.g1() - 0x40 : this.g2() - 0xC000;
    }

    gdata(length = this.available, offset = this.pos, advance = true) {
        let data = this.data.slice(offset, offset + length);

        if (advance) {
            this.pos += length;
        }

        return data;
    }

    gPacket(length = this.length, offset = this.pos, advance = true) {
        return new Packet(this.gdata(length, offset, advance));
    }

    gbool() {
        return this.g1() === 1;
    }

    // putters

    p1(value) {
        this.ensure(1);
        this.data[this.pos++] = value;
    }

    p2(value) {
        this.ensure(2);
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p3(value) {
        this.ensure(3);
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p4(value) {
        this.ensure(4);
        if (typeof value === 'bigint') {
            value = Number(value);
        }

        this.data[this.pos++] = value >> 24;
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p8(value) {
        this.ensure(8);
        this.p4(value >> 32n);
        this.p4(value & 0xFFFFFFFFn);
    }

    pjstr(str) {
        this.ensure(str.length + 1);
        this.data.set(Buffer.from(str), this.pos);
        this.pos += str.length;
        this.data[this.pos++] = 10;
    }

    psmart(value) {
        if (value < 0x80) {
            this.p1(value);
        } else {
            this.p2(value + 0x8000);
        }
    }

    psmarts(value) {
        if (value < 0x80) {
            this.p1(value + 0x40);
        } else {
            this.p2(value + 0xC000);
        }
    }

    pdata(src, advance = true) {
        this.ensure(src.length);
        if (src instanceof Packet) {
            src = src.data;
        }

        this.data.set(src, this.pos);

        if (advance) {
            this.pos += src.length;
        }
    }

    psize1(length) {
        this.data[this.pos - length - 1] = length;
    }

    psize2(length) {
        this.data[this.pos - length - 2] = length >> 8;
        this.data[this.pos - length - 1] = length;
    }

    psize4(length) {
        this.data[this.pos - length - 4] = length >> 24;
        this.data[this.pos - length - 3] = length >> 16;
        this.data[this.pos - length - 2] = length >> 8;
        this.data[this.pos - length - 1] = length;
    }

    pbool(value) {
        this.p1(value ? 1 : 0);
    }
}
