import { ByteBuffer } from 'utility.js';
import fs from 'fs';

ByteBuffer.setGlobalEndianness(false);

const ConstantPoolTypes = {
    // major.minor > 45.3
    UTF8: 1,
    Integer: 3,
    Float: 4,
    Long: 5,
    Double: 6,
    Class: 7,
    String: 8,
    FieldRef: 9,
    MethodRef: 10,
    InterfaceMethodRef: 11,
    NameAndType: 12,
    // major.minor > 51.0
    MethodHandle: 15,
    MethodType: 16,
    InvokeDynamic: 18,
    // major.minor > 53.0
    Module: 19,
    Package: 20,
    // major.minor > 55.0
    Dynamic: 17,

    // helper functions
    NameFor: (value) => Object.keys(ConstantPoolTypes)[Object.values(ConstantPoolTypes).indexOf(value)]
};

const ClassAccessFlags = {
    Public: 0x1,
    Private: 0x2,
    Protected: 0x4,
    Static: 0x8,
    Final: 0x10,
    Volatile: 0x40,
    Transient: 0x80,
    Synthetic: 0x1000,
    Enum: 0x4000,

    // helper functions
    NameFor: (value) => Object.keys(ClassAccessFlags)[Object.values(ClassAccessFlags).indexOf(value)]
};

const MethodAccessFlags = {
    Public: 0x1,
    Private: 0x2,
    Protected: 0x4,
    Static: 0x8,
    Final: 0x10,
    Synchronized: 0x20,
    Bridge: 0x40,
    VarArgs: 0x80,
    Native: 0x100,
    Abstract: 0x400,
    Strict: 0x800,
    Synthetic: 0x1000,

    // helper functions
    NameFor: (value) => Object.keys(MethodAccessFlags)[Object.values(MethodAccessFlags).indexOf(value)]
};

const Descriptors = {
    Byte: 'B',
    Char: 'C',
    Double: 'D',
    Float: 'F',
    Int: 'I',
    Long: 'J',
    ClassRef: 'L',
    Short: 'S',
    Boolean: 'Z',
    ArrayRef: '[',
    Void: 'V',

    // helper functions
    NameFor: (value) => Object.keys(Descriptors)[Object.values(Descriptors).indexOf(value)]
};

class ClassReader {
    constructor(path) {
        let stream = new ByteBuffer(fs.readFileSync(path));

        this.magic = stream.readDWord(); // 0xCAFEBABE
        this.minor = stream.readWord();
        this.major = stream.readWord();

        let constant_pool_count = stream.readWord();
        this.constant_pool = [];
        for (let i = 1; i < constant_pool_count; ++i) {
            let tag = stream.readByte();
            let info = null;

            switch (tag) {
                case ConstantPoolTypes.UTF8: { // 1
                    let length = stream.readWord();
                    info = stream.readString(length, 'utf8');
                } break;
                case ConstantPoolTypes.Integer: // 3
                    info = stream.readDWord();
                    break;
                case ConstantPoolTypes.Float: // 4
                    info = stream.readFloat();
                    break;
                case ConstantPoolTypes.Long: // 5
                    info = stream.readQWord();
                    break;
                case ConstantPoolTypes.Double: // 6
                    info = stream.readDouble();
                    break;
                case ConstantPoolTypes.Class: // 7
                    info = stream.readWord();
                    break;
                case ConstantPoolTypes.String: // 8
                    info = stream.readWord();
                    break;
                case ConstantPoolTypes.FieldRef: // 9
                    info = { field: stream.readWord(), type: stream.readWord() };
                    break;
                case ConstantPoolTypes.MethodRef: // 10
                    info = { method: stream.readWord(), type: stream.readWord() };
                    break;
                case ConstantPoolTypes.NameAndType: // 12
                    info = { name: stream.readWord(), type: stream.readWord() };
                    break;
                default:
                    console.error('Unmatched tag value', tag);
                    process.exit(1);
            }

            this.constant_pool[i] = { tag, info };

            // these 8-byte datatypes seem to skip the next index
            if (tag === ConstantPoolTypes.Long || tag === ConstantPoolTypes.Double) {
                i++;
            }
        }

        this.access_flags = stream.readWord();
        this.this_class = stream.readWord();
        this.super_class = stream.readWord();

        let interfaces_count = stream.readWord();
        this.interfaces = [];
        for (let i = 0; i < interfaces_count; ++i) {
            this.interfaces[i] = stream.readWord();
        }

        let fields_count = stream.readWord();
        this.fields = [];
        for (let i = 0; i < fields_count; ++i) {
            let field = {};
            field.access_flags = stream.readWord();
            field.name_index = stream.readWord();
            field.descriptor_index = stream.readWord();
            let attributes_count = stream.readWord();
            field.attributes = [];
            for (let j = 0; j < attributes_count; ++j) {
                let attribute = {};
                attribute.name_index = stream.readWord();
                let attribute_length = stream.readDWord();
                attribute.info = stream.read(attribute_length);
                field.attributes[j] = attribute;
            }
            this.fields[i] = field;
        }

        let methods_count = stream.readWord();
        this.methods = [];
        for (let i = 0; i < methods_count; ++i) {
            let method = {};
            method.access_flags = stream.readWord();
            method.name_index = stream.readWord();
            method.descriptor_index = stream.readWord();
            let attributes_count = stream.readWord();
            method.attributes = [];
            for (let j = 0; j < attributes_count; ++j) {
                let attribute = {};
                attribute.name_index = stream.readWord();
                let attribute_length = stream.readDWord();
                attribute.info = stream.read(attribute_length);
                method.attributes[j] = attribute;
            }
            this.methods[i] = method;
        }

        let attributes_count = stream.readWord();
        this.attributes = [];
        for (let i = 0; i < attributes_count; ++i) {
            let attribute = {};
            attribute.name_index = stream.readWord();
            let attribute_length = stream.readDWord();
            attribute.info = stream.read(attribute_length);
            this.attributes[i] = attribute;
        }
    }

    getConstant(index) {
        return this.constant_pool[index].info;
    }

    printConstantPool() {
        let output = 'Constant pool:\n';
        for (let i = 1; i < this.constant_pool.length; ++i) {
            if (!this.constant_pool[i]) {
                continue;
            }

            let tag = this.constant_pool[i].tag;
            let info = this.constant_pool[i].info;
            let value = null;
            switch (tag) {
                case ConstantPoolTypes.String:
                case ConstantPoolTypes.Class:
                    value = this.getConstant(info);
                    break;
                case ConstantPoolTypes.FieldRef:
                    value = this.getConstant(this.getConstant(info.field)) + '.' + this.getConstant(this.getConstant(info.type).name) + ':' + this.getConstant(this.getConstant(info.type).type);
                    break;
                case ConstantPoolTypes.MethodRef:
                    value = this.getConstant(this.getConstant(info.method)) + '.' + this.getConstant(this.getConstant(info.type).name) + ':' + this.getConstant(this.getConstant(info.type).type);
                    break;
                case ConstantPoolTypes.NameAndType:
                    value = this.getConstant(info.name) + ':' + this.getConstant(info.type);
                    break;
            }

            output += `#${i} = ${ConstantPoolTypes.NameFor(tag)} `;
            if ((tag === ConstantPoolTypes.String || tag === ConstantPoolTypes.Class) && typeof info !== 'object') {
                output += '#';
            }
            if (typeof info !== 'object') {
                output += `${info}`;
            } else {
                output += `#${Object.values(info)[0]}:#${Object.values(info)[1]}`;
            }
            if (value !== null) {
                output += ' // ' + value;
            }
            output += '\n';
        }
        return output;
    }

    parseClassAccessFlags(access_flags) {
        let value = '';
        if (access_flags & ClassAccessFlags.Public) {
            value += 'public';
        }
        if (access_flags & ClassAccessFlags.Private) {
            value += 'private';
        }
        if (access_flags & ClassAccessFlags.Protected) {
            value += 'protected';
        }
        if (access_flags & ClassAccessFlags.Static) {
            value += ' static';
        }
        if (access_flags & ClassAccessFlags.Final) {
            value += ' final';
        }
        if (access_flags & ClassAccessFlags.Volatile) {
            value += ' volatile';
        }
        return value;
    }

    parseMethodReturn(descriptor) {
        let output = '';
        let type = descriptor.split(')')[1];
        output += Descriptors.NameFor(type).toLowerCase();
        return output;
    }

    parseMethodParam(descriptor) {
        descriptor = descriptor.replaceAll('/', '.').substr(1, descriptor.indexOf(')') - 1);
        let output = '';
        let offset = 0;
        let types = [];
        while (offset < descriptor.length) {
            let type = null;
            switch (descriptor[offset++]) {
                case Descriptors.ClassRef:
                    type = descriptor.substr(offset, descriptor.indexOf(';', offset) - 1);
                    offset += type.length + 1;
                    break;
            }
            if (type) {
                types.push(type);
            }
        }
        for (let i = 0; i < types.length; ++i) {
            output += types[i];
            if (i < types.length - 1) {
                output += ', ';
            }
        }
        return output;
    }

    decompileMethod(index) {
        let output = '';
        let method = this.methods[index];
        output += this.parseClassAccessFlags(method.access_flags) + ' ';
        output += this.parseMethodReturn(this.getConstant(method.descriptor_index)) + ' ';
        output += this.getConstant(method.name_index);
        output += '(' + this.parseMethodParam(this.getConstant(method.descriptor_index)) + ')';
        return output;
    }
}

let reader = new ClassReader('dump/signlink.class');
console.log(reader.decompileMethod(0));
