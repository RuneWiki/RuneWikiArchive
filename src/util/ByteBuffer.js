import crc32 from 'crc-32';
import crypto from 'crypto';
import fs from 'fs';

BigInt.prototype.toJSON = function () { return this.toString(); };

// https://gist.github.com/nphyx/5c19ef4cdb9774d87e0d
DataView.prototype.getUint24 = function (pos) {
    return (this.getUint16(pos) << 8) + this.getUint8(pos + 2);
};

DataView.prototype.setUint24 = function (pos, val) {
    this.setUint16(pos, val >> 8);
    this.setUint8(pos + 2, val & ~4294967040); // this "magic number" masks off the first 16 bits
};

const BITMASK = [
    0,
    0x1, 0x3, 0x7, 0xF,
    0x1F, 0x3F, 0x7F, 0xFF,
    0x1FF, 0x3FF, 0x7FF, 0xFFF,
    0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF,
    0x1FFFF, 0x3FFFF, 0x7FFFF, 0xFFFFF,
    0x1FFFFF, 0x3FFFFF, 0x7FFFFF, 0xFFFFFF,
    0x1FFFFFF, 0x3FFFFFF, 0x7FFFFFF, 0xFFFFFFF,
    0x1FFFFFFF, 0x3FFFFFFF, 0x7FFFFFFF, 0xFFFFFFFF
];

let GLOBAL_ENDIANNESS = false;
let GLOBAL_TERMINATOR = '\n';

export class ByteBuffer {
    #buffer;
    #view;

    static fromFile(path) {
        return new ByteBuffer(fs.readFileSync(path));
    }

    static fromHex(str) {
        return new ByteBuffer(Buffer.from(str.replaceAll(' ', ''), 'hex'));
    }

    static crc32(buf) {
        if (buf.raw) {
            buf = buf.raw;
        }

        return crc32.buf(buf);
    }

    static whirlpool(buf) {
        return crypto.createHash('whirlpool').update(buf).digest('hex').toString();
    }

    static md5(buf) {
        return crypto.createHash('md5').update(buf).digest('hex').toString();
    }

    static alloc(capacity, fill = 0) {
        let stream = new ByteBuffer(new Uint8Array(capacity));
        if (fill) {
            for (let i = 0; i < capacity; i++) {
                stream.raw[i] = fill;
            }
        }
        return stream;
    }

    static setGlobalEndianness(endianness) {
        GLOBAL_ENDIANNESS = endianness;
    }

    static setGlobalTerminator(terminator) {
        GLOBAL_TERMINATOR = terminator;
    }

    constructor(source, endianness = GLOBAL_ENDIANNESS) {
        // bit-writing
        this.bitOffset = 0;

        if (!source) {
            this.#buffer = new Uint8Array().buffer;
            this.raw = new Uint8Array(this.#buffer);
            this.#view = new DataView(this.#buffer);
            this.offset = 0;
            this.endianness = endianness;
            return;
        }

        if (ArrayBuffer.isView(source)) {
            source = new Uint8Array(source).buffer;
        }

        this.#buffer = source;
        this.raw = new Uint8Array(source);
        this.#view = new DataView(source);
        this.offset = 0;
        this.endianness = endianness;
    }

    clear() {
        this.raw.fill(0);
        this.offset = 0;
    }

    toString() {
        return Buffer.from(this.raw).toString();
    }

    indexOf(val, start) {
        return this.raw.indexOf(val, start);
    }

    toHex() {
        return Buffer.from(this.raw).toString('hex').toUpperCase();
    }

    toFile(path) {
        fs.writeFileSync(path, this.raw);
    }

    setBigEndian() {
        this.endianness = false;
        return this;
    }

    setLittleEndian() {
        this.endianness = true;
        return this;
    }

    prepend(data) {
        if (data.raw) {
            data = data.raw;
        }

        let temp = new Uint8Array(this.length + data.length);
        temp.set(data, 0);
        temp.set(this.raw, data.length);
        return new ByteBuffer(temp, this.endianness);
    }

    append(bytes) {
        if (bytes <= 0) {
            throw new RangeError(`Invalid number of bytes ${bytes}`);
        }

        const data = new Uint8Array(this.length + bytes);
        data.set(this.raw, 0);
        this.#buffer = data.buffer;
        this.raw = data;
        this.#view = new DataView(data.buffer);
        return this;
    }

    // getters

    get buffer() {
        return this.#buffer;
    }

    get view() {
        return this.#view;
    }

    get length() {
        return this.#buffer.byteLength;
    }

    get available() {
        return this.length - this.offset;
    }

    get availableBits() {
        return (this.length * 8) - this.bitOffset;
    }

    // offset-related functions

    front() {
        this.offset = 0;
        this.bitOffset = 0;
        return this;
    }

    back() {
        this.offset = this.length;
        return this;
    }

    seek(bytes = 1) {
        bytes = Number(bytes);
        this.offset += bytes;
        return this;
    }

    align(boundary) {
        this.offset = (this.offset + boundary - 1) & -boundary;
        return this;
    }

    static calcAlign(value, boundary) {
        return (value + boundary - 1) & -boundary;
    }

    alignWith(boundary, fill) {
        if (boundary === 0) {
            return;
        }
        let start = this.offset;
        this.align(boundary);
        let end = this.offset;
        this.offset = start;
        if (end - start <= 0) {
            return;
        }
        let gap = new ByteBuffer(new Uint8Array(end - start));
        for (let i = 0; i < gap.length; ++i) {
            gap.writeByte(fill);
        }
        this.write(gap.raw);
    }

    // read-related functions

    slice(begin = this.offset, end = this.length) {
        return new ByteBuffer(this.#buffer.slice(begin, end), this.endianness);
    }

    read(bytes = this.available) {
        bytes = Number(bytes);
        const value = this.slice(this.offset, this.offset + bytes);
        this.seek(bytes);
        return value;
    }

    readBytes(bytes = this.available) {
        return this.read(bytes).raw;
    }

    readBoolean() {
        return this.readByte() === 1;
    }

    /// SWTOR
    readNumber() {
        let value = this.readByte();
        if (value < 0xC0 || value > 0xCF) {
            return value;
        }

        let positive = (value & 0b1000) > 0;
        let length = (value & 0b111) + 1;

        // read N bytes as *big* endian
        value = 0n;
        for (let i = 0; i < length; i++) {
            value = (value << 8n) | BigInt(this.readByte());
        }

        // add negative sign
        if (!positive) {
            value = -value;
        }
        return value;
    }

    /// RS
    // -16384 to 16383
    readSmartSigned() {
        let i = this.peekByte();
        if (i < 0x80) {
            return this.readByte() - 0x40;
        } else {
            return this.readWord() - 0xC000;
        }
    }

    // 0 to 32768
    readSmart() {
        let i = this.peekByte();
        if (i < 0x80) {
            return this.readByte();
        } else {
            return this.readWord() - 0x8000;
        }
    }

    /// Back to normal

    readString(terminator = GLOBAL_TERMINATOR) {
        const start = this.offset;
        for (; this.available && this.peekByte() !== terminator.charCodeAt(0); ++this.offset) { }
        let length = this.offset - start;
        if (!length) {
            this.seek(1);
            return '';
        }
        this.front().seek(start);
        const str = new TextDecoder('ascii').decode(this.read(length).view);
        this.seek(1);
        return str;
    }

    readArray(type, count) {
        let values = [];
        for (let i = 0; i < count; ++i) {
            values.push(this['read' + type]());
        }
        return values;
    }

    // write-related functions

    write(data) {
        if (data.raw) {
            data = data.raw;
        }
        if (this.available < data.length) {
            this.append(data.length - this.available);
        }
        this.raw.set(data, this.offset);
        this.seek(data.length);
        return this;
    }

    writeByteLength(length) {
        this.raw[this.offset - length - 1] = length;
        return this;
    }

    writeWordLength(length) {
        this.raw[this.offset - length - 2] = length >> 8;
        this.raw[this.offset - length - 1] = length;
        return this;
    }

    writeBytes(data) {
        this.write(data);
        return this;
    }

    writeBytesLen(data, type = 'DWord') {
        this['write' + type](data.length);
        this.write(data);
        return this;
    }

    writeString(str, terminator = GLOBAL_TERMINATOR) {
        for (let i = 0; i < str.length; ++i) {
            this.writeByte(str.charCodeAt(i));
        }
        this.writeByte(terminator.charCodeAt(0));
        return this;
    }

    writeBoolean(value) {
        this.writeByte(value);
        return this;
    }

    /// RS
    // -16384 to 16383
    writeSmartSigned(value) {
        if (value < 0x80) {
            this.writeByte(value + 0x40);
        } else {
            this.writeWord(value + 0xC000);
        }
    }

    // 0 to 32768
    writeSmart(value) {
        if (value < 0x80) {
            this.writeByte(value);
        } else {
            this.writeWord(value + 0x8000);
        }
    }

    // bit-level access

    accessBits() {
        this.bitOffset = this.offset << 3;
    }

    setBits(n, value) {
        let bytePos = this.bitOffset >>> 3;
        let remaining = 8 - (this.bitOffset & 7);
        this.bitOffset += n;

        // grow if necessary
        if (bytePos + 1 > this.length) {
            this.append((bytePos + 1) - this.length);
        }

        for (; n > remaining; remaining = 8) {
            this.raw[bytePos] &= ~BITMASK[remaining];
            this.raw[bytePos++] |= (value >>> (n - remaining)) & BITMASK[remaining];
            n -= remaining;

            // grow if necessary
            if (bytePos + 1 > this.length) {
                this.append((bytePos + 1) - this.length);
            }
        }

        if (n == remaining) {
            this.raw[bytePos] &= ~BITMASK[remaining];
            this.raw[bytePos] |= value & BITMASK[remaining];
        } else {
            this.raw[bytePos] &= ~BITMASK[n] << (remaining - n);
            this.raw[bytePos] |= (value & BITMASK[n]) << (remaining - n);
        }
        // this.accessBytes(); // just in case mixed bit/byte access occurs
    }

    getBits(n) {
        let bytePos = this.bitOffset >> 3;
        let remaining = 8 - (this.bitOffset & 7);
        let value = 0;
        this.bitOffset += n;

        for (; n > remaining; remaining = 8) {
            value += (this.raw[bytePos++] & BITMASK[remaining]) << (n - remaining);
            n -= remaining;
        }

        if (n == remaining) {
            value += this.raw[bytePos] & BITMASK[remaining];
        } else {
            value += (this.raw[bytePos] >> (remaining - n)) & BITMASK[n];
        }

        // this.accessBytes(); // just in case mixed bit/byte access occurs
        return value;
    }

    seekBits(n) {
        this.bitOffset += n;
    }

    peekBits(n) {
        let value = this.getBits(n);
        this.seekBits(-n);
        return value;
    }

    // similar to align() for bits
    accessBytes() {
        this.offset = (this.bitOffset + 7) >>> 3;
    }
}

const reader = function (method, bytes) {
    return function (endianness = null) {
        if (bytes > this.available) {
            throw new Error(`Cannot read ${bytes} byte(s), ${this.available} available`);
        }

        const value = this.view[method](this.offset, endianness ?? this.endianness);
        this.seek(bytes);
        return value;
    };
};

const peeker = function (method, bytes) {
    return function (endianness = null) {
        if (bytes > this.available) {
            throw new Error(`Cannot read ${bytes} byte(s), ${this.available} available`);
        }

        let order = this.endianness;
        if (endianness != null) {
            order = endianness;
        }
        const value = this.view[method](this.offset, order);
        return value;
    };
};

const seeker = function (method, bytes) {
    return function (offset, endianness = null) {
        if (bytes > this.available) {
            throw new Error(`Cannot read ${bytes} byte(s), ${this.available} available`);
        }

        let order = this.endianness;
        if (endianness != null) {
            order = endianness;
        }
        const value = this.view[method](offset, order);
        return value;
    };
};

const writer = function (method, bytes) {
    return function (value, endianness = null) {
        if (bytes > this.available) {
            this.append(bytes - this.available);
        }

        let order = this.endianness;
        if (endianness != null) {
            order = endianness;
        }
        if (bytes === 8 && method === 'setBigUint64') {
            value = BigInt(value);
        } else {
            value = Number(value);
        }
        this.view[method](this.offset, value, order);
        this.seek(bytes);
        return this;
    };
};

// readers
ByteBuffer.prototype.readByteSigned = reader('getInt8', 1);
ByteBuffer.prototype.readByte = reader('getUint8', 1);
ByteBuffer.prototype.readWordSigned = reader('getInt16', 2);
ByteBuffer.prototype.readWord = reader('getUint16', 2);
ByteBuffer.prototype.readSWord = reader('getUint24', 3);
ByteBuffer.prototype.readDWordSigned = reader('getInt32', 4);
ByteBuffer.prototype.readDWord = reader('getUint32', 4);
ByteBuffer.prototype.readQWordSigned = reader('getBigInt64', 8);
ByteBuffer.prototype.readQWord = reader('getBigUint64', 8);
ByteBuffer.prototype.readFloat = reader('getFloat32', 4);
ByteBuffer.prototype.readDouble = reader('getFloat64', 8);

// peekers
ByteBuffer.prototype.peekByte = peeker('getUint8', 1);
ByteBuffer.prototype.peekDWord = peeker('getUint32', 4);

// seekers
ByteBuffer.prototype.readQWordAt = seeker('getBigUint64', 8);

// writers
ByteBuffer.prototype.writeByte = writer('setUint8', 1);
ByteBuffer.prototype.writeWord = writer('setUint16', 2);
ByteBuffer.prototype.writeSWord = writer('setUint24', 3);
ByteBuffer.prototype.writeDWord = writer('setUint32', 4);
ByteBuffer.prototype.writeQWord = writer('setBigUint64', 8);
ByteBuffer.prototype.writeFloat = writer('setFloat32', 4);
ByteBuffer.prototype.writeDouble = writer('setFloat64', 8);
