import { ByteBuffer } from 'utility.js';

function lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

ByteBuffer.setGlobalEndianness(false);

// TODO: Static initializers
// TODO: Method bytecode to source code
// TODO: Bytecode deobfuscation

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
    Final: 0x10,
    Super: 0x20,
    Interface: 0x200,
    Abstract: 0x400,
    Synthetic: 0x1000,
    Annotation: 0x2000,
    Enum: 0x4000,

    // helper functions
    NameFor: (value) => Object.keys(ClassAccessFlags)[Object.values(ClassAccessFlags).indexOf(value)]
};

const FieldAccessFlags = {
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
    NameFor: (value) => Object.keys(FieldAccessFlags)[Object.values(FieldAccessFlags).indexOf(value)]
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

const Opcodes = {
    nop: 0,

    // push null ref onto stack
    aconst_null: 1,

    // load int value onto stack
    iconst_m1: 2, // -1
    iconst_0: 3,
    iconst_1: 4,
    iconst_2: 5,
    iconst_3: 6,
    iconst_4: 7,
    iconst_5: 8,

    // push long value onto stack
    lconst_0: 9,
    lconst_1: 10,

    // push float value onto stack
    fconst_0: 11, // 0.0
    fconst_1: 12, // 1.0
    fconst_2: 13, // 2.0

    // push double value onto stack
    dconst_0: 14, // 0.0
    dconst_1: 15, // 1.0

    bipush: 16,
    sipush: 17,
    ldc: 18,
    ldc_w: 19,
    ldc2_w: 20,
    iload: 21,
    lload: 22,
    fload: 23,
    dload: 24,
    aload: 25,

    // load int value from local variable
    iload_0: 26,
    iload_1: 27,
    iload_2: 28,
    iload_3: 29,

    // load long value from local variable
    lload_0: 30,
    lload_1: 31,
    lload_2: 32,
    lload_3: 33,

    // load float value from local variable
    fload_0: 34,
    fload_1: 35,
    fload_2: 36,
    fload_3: 37,

    // load double value from local variable
    dload_0: 38,
    dload_1: 39,
    dload_2: 40,
    dload_3: 41,

    // load reference onto stack from local variable
    aload_0: 42,
    aload_1: 43,
    aload_2: 44,
    aload_3: 45,

    // load int from array
    iaload: 46,

    // load long from array
    laload: 47,

    // load float from array
    faload: 48,

    // load double from array
    daload: 49,

    // load reference onto stack from array
    aaload: 50,

    // load byte or boolean from array
    baload: 51,

    // load char from array
    caload: 52,

    // load short from array
    saload: 52,

    // store int into local variable
    istore: 54,

    lstore: 55,

    fstore: 56,

    dstore: 57,

    astore: 58,

    istore_0: 59,
    istore_1: 60,
    istore_2: 61,
    istore_3: 62,

    lstore_0: 63,
    lstore_1: 64,
    lstore_2: 65,
    lstore_3: 66,

    fstore_0: 67,
    fstore_1: 68,
    fstore_2: 69,
    fstore_3: 70,

    dstore_0: 71,
    dstore_1: 72,
    dstore_2: 73,
    dstore_3: 74,

    astore_0: 75,
    astore_1: 76,
    astore_2: 77,
    astore_3: 78,

    iastore: 79,

    lastore: 80,

    fastore: 81,

    dastore: 82,

    aastore: 83,

    bastore: 84,

    castore: 85,

    sastore: 86,

    pop: 87,

    pop2: 88,

    dup: 89,

    dup_x1: 90,

    dup_x2: 91,

    dup2: 92,

    dup2_x1: 93,

    dup2_x2: 94,

    swap: 95,

    iadd: 96,
    ladd: 97,
    fadd: 98,
    dadd: 99,

    isub: 100,
    lsub: 101,
    fsub: 102,
    dsub: 103,

    imul: 104,
    lmul: 105,
    fmul: 106,
    dmul: 107,

    idiv: 108,
    ldiv: 109,
    fdiv: 110,
    ddiv: 111,

    irem: 112,
    lrem: 113,
    frem: 114,
    drem: 115,

    ineg: 116,
    lneg: 117,
    fneg: 118,
    dneg: 119,

    ishl: 120,
    lshl: 121,

    ishr: 122,
    lshr: 123,

    iushr: 124,
    lushr: 125,

    iand: 126,
    land: 127,

    ior: 128,
    lor: 129,

    ixor: 130,
    lxor: 131,

    iinc: 132,

    i2l: 133,
    i2f: 134,
    i2d: 135,

    l2i: 136,
    l2f: 137,
    l2d: 138,

    f2i: 139,
    f2l: 140,
    f2d: 141,

    d2i: 142,
    d2l: 143,
    d2f: 144,

    i2b: 145,
    i2c: 146,
    i2s: 147,

    lcmp: 148,
    fcmpl: 149,
    fcmpg: 150,
    dcmpl: 151,
    dcmpg: 152,

    ifeq: 153,
    ifne: 154,
    iflt: 155,
    ifge: 156,
    ifgt: 157,
    ifle: 158,

    if_icmpeq: 159,
    if_icmpne: 160,
    if_icmplt: 161,
    if_icmpge: 162,
    if_icmpgt: 163,
    if_icmple: 164,
    if_acmpeq: 165,
    if_acmpne: 166,

    goto: 167,
    jsr: 168,
    ret: 169,

    tableswitch: 170,

    lookupswitch: 171,

    ireturn: 172,
    lreturn: 173,
    freturn: 174,
    dreturn: 175,
    areturn: 176,
    return: 177,

    getstatic: 178,
    putstatic: 179,

    getfield: 180,
    putfield: 181,

    invokevirtual: 182,
    invokespecial: 183,
    invokestatic: 184,
    invokeinterface: 185,
    invokedynamic: 186,

    new: 187,

    newarray: 188,
    anewarray: 189,

    arraylength: 190,

    athrow: 191,

    checkcast: 192,

    instanceof: 193,

    monitorenter: 194,
    monitorexit: 195,

    wide: 196,

    multianewarray: 197,

    ifnull: 198,

    ifnonnull: 199,

    goto_w: 200,

    jsr_w: 201,

    // debugging opcodes
    breakpoint: 0xCA,
    impdep1: 0xFE,
    impdep2: 0xFF,

    NameFor: (value) => Object.keys(Opcodes)[Object.values(Opcodes).indexOf(value)]
};

// <init> = constructor
// <clinit> = static initializer
export default class ClassReader {
    constructor(stream) {
        let magic = stream.readDWord(); // 0xCAFEBABE
        if (magic !== 0xCAFEBABE) {
            console.error('Not a class file');
            // process.exit(1);
            return;
        }

        this.major = 0;
        this.minor = stream.readWord();
        this.major = stream.readWord();
        if (this.major > 45 || this.minor > 3) {
            console.error('Class version too new, only 45.3 is fully supported. Got', this.major, this.minor);
            // process.exit(1);
            // return;
        }

        let constant_pool_count = stream.readWord();
        this.constant_pool = [{ tag: 0, info: null }];
        for (let i = 1; i < constant_pool_count; ++i) {
            if (stream.available < 1) {
                return;
            }

            let tag = stream.readByte();
            let info = null;

            switch (tag) {
                case ConstantPoolTypes.UTF8:
                    info = stream.readString(stream.readWord(), 'utf8');
                    break;
                case ConstantPoolTypes.Integer:
                    info = stream.readDWord();
                    break;
                case ConstantPoolTypes.Float:
                    info = stream.readFloat();
                    break;
                case ConstantPoolTypes.Long:
                    info = stream.readQWord();
                    break;
                case ConstantPoolTypes.Double:
                    info = stream.readDouble();
                    break;
                case ConstantPoolTypes.Class:
                    info = stream.readWord();
                    break;
                case ConstantPoolTypes.String:
                    info = stream.readWord();
                    break;
                case ConstantPoolTypes.FieldRef:
                    info = { field: stream.readWord(), type: stream.readWord() };
                    break;
                case ConstantPoolTypes.MethodRef:
                    info = { method: stream.readWord(), type: stream.readWord() };
                    break;
                case ConstantPoolTypes.NameAndType:
                    info = { name: stream.readWord(), type: stream.readWord() };
                    break;
            }

            this.constant_pool[i] = { tag, info };

            // these 8-byte datatypes seem to skip the next index
            if (tag === ConstantPoolTypes.Long || tag === ConstantPoolTypes.Double) {
                i++;
            }
        }

        if (stream.available < 1) {
            return;
        }

        this.access_flags = this.classAccessFlags(stream.readWord());

        this.this_class = stream.readWord();
        if (this.this_class < this.constant_pool.length) {
            this.this_class = this.getConstant(this.getConstant(this.this_class));
            if (this.this_class) {
                this.this_class = this.this_class.replaceAll('/', '.');
                this.class_name = this.this_class.substr(this.this_class.lastIndexOf('.') + 1);
                this.package_name = this.this_class.substr(0, this.this_class.lastIndexOf('.'));
            }
        } else {
            return;
        }

        this.super_class = stream.readWord();
        if (this.super_class < this.constant_pool.length) {
            this.super_class = this.getConstant(this.getConstant(this.super_class)).replaceAll('/', '.');
        } else {
            return;
        }

        let interfaces_count = stream.readWord();
        this.interfaces = [];
        for (let i = 0; i < interfaces_count; ++i) {
            this.interfaces[i] = this.getConstant(this.getConstant(stream.readWord())).replaceAll('/', '.');
        }

        let fields_count = stream.readWord();
        this.fields = [];
        for (let i = 0; i < fields_count; ++i) {
            let field = {};
            field.access_flags = this.classAccessFlags(stream.readWord());
            field.name = this.getConstant(stream.readWord());
            field.descriptor = this.parseFieldDescriptor(this.getConstant(stream.readWord()));
            field.attributes = this.readAttributes(stream);
            this.fields.push(field);
        }

        let methods_count = stream.readWord();
        this.methods = [];
        for (let i = 0; i < methods_count; ++i) {
            let method = {};
            method.access_flags = this.methodAccessFlags(stream.readWord());
            method.name = this.getConstant(stream.readWord());
            method.description = this.getConstant(stream.readWord());
            method.descriptor = this.parseMethodDescriptor(method.description);
            method.attributes = this.readAttributes(stream);
            this.methods.push(method);
        }

        this.attributes = this.readAttributes(stream);

        if (stream.available) {
            console.error('Warning: class not completely read', stream.available, 'bytes remaining');
        }

        // parse code
        for (let i = 0; i < this.methods.length; ++i) {
            let method = this.methods[i];
            let attribute = method.attributes.filter(x => x.name === 'Code')[0];
            let code = [];
            if (!attribute) {
                continue;
            }
            while (attribute.bytecode.available) {
                code.push(this.readOpcode(attribute.bytecode, false, attribute.aligned));
            }
            attribute.code = code;
            delete attribute.bytecode;
        }

        this.output = [];
    }

    getConstant(index) {
        let constant = this.constant_pool[index];
        return constant !== undefined ? constant.info : constant;
    }

    readAttributes(stream) {
        let attributes_count = stream.readWord();
        let attributes = [];
        for (let i = 0; i < attributes_count; ++i) {
            let attribute = {};
            attribute.name = this.getConstant(stream.readWord());
            if (stream.offset % 4 === 0) {
                attribute.aligned = true;
            }
            let data = stream.read(stream.readDWord());
            switch (attribute.name) {
                case 'Code': {
                    attribute.max_stack = data.readWord();
                    attribute.max_locals = data.readWord();
                    attribute.bytecode = data.read(data.readDWord());
                    let exception_table_length = data.readWord();
                    attribute.exceptions = [];
                    for (let j = 0; j < exception_table_length; ++j) {
                        let exception = {};
                        exception.start_pc = data.readWord();
                        exception.end_pc = data.readWord();
                        exception.handler_pc = data.readWord();
                        exception.catch_type = this.getConstant(data.readWord());
                        if (typeof exception.catch_type !== 'string') {
                            exception.catch_type = this.getConstant(exception.catch_type);
                        }
                        if (exception.catch_type) {
                            exception.catch_type = exception.catch_type.replaceAll('/', '.');
                        }
                        attribute.exceptions.push(exception);
                    }
                    attribute.attributes = this.readAttributes(data);
                } break;
                case 'ConstantValue':
                    attribute.info = this.getConstant(data.readWord());
                    break;
                case 'Exceptions': {
                } break;
                case 'LineNumberTable': {
                    let line_number_table_length = data.readWord();
                    attribute.info = [];
                    for (let j = 0; j < line_number_table_length; ++j) {
                        attribute.info.push({ start_pc: data.readWord(), line_number: data.readWord() });
                    }
                } break;
                case 'SourceFile':
                    attribute.info = this.getConstant(data.readWord());
                    break;
                case 'Synthetic':
                    break;
                default:
                    console.log(attribute.name, 'attribute not handled');
                    break;
            }
            attributes.push(attribute);
        }
        return attributes;
    }

    classAccessFlags(access_flags) {
        let output = '';
        for (let i = 0; i < Object.values(ClassAccessFlags).length; ++i) {
            if (access_flags & Object.values(ClassAccessFlags)[i]) {
                output += ClassAccessFlags.NameFor(Object.values(ClassAccessFlags)[i]) + ' ';
            }
        }
        return output.trimEnd().toLowerCase();
    }

    methodAccessFlags(access_flags) {
        let output = '';
        for (let i = 0; i < Object.values(MethodAccessFlags).length; ++i) {
            if (access_flags & Object.values(MethodAccessFlags)[i]) {
                output += MethodAccessFlags.NameFor(Object.values(MethodAccessFlags)[i]) + ' ';
            }
        }
        return output.trimEnd().toLowerCase();
    }

    parseDescriptor(descriptor) {
        let type = Descriptors.NameFor(descriptor[0]);
        let ref = null;
        if (type === 'ClassRef') {
            ref = descriptor.substring(1, descriptor.indexOf(';')).replaceAll('/', '.');
        }
        return { type, ref };
    }

    parseFieldDescriptor(descriptor) {
        let output = '';
        let types = [];
        for (let i = 0; i < descriptor.length; ++i) {
            let entry = this.parseDescriptor(descriptor.slice(i));
            if (entry.type === 'ClassRef') {
                i += 1 + entry.ref.length + 1;
            }
            types.push(entry);
        }
        for (let i = 0; i < types.length; ++i) {
            let type = types[i].type;
            if (type === 'ClassRef') {
                output += types[i].ref;
            } else if (type !== 'ArrayRef') {
                output += type.toLowerCase();
            }
        }
        let arrays = types.filter(x => x.type === 'ArrayRef');
        for (let i = 0; i < arrays.length; ++i) {
            output += '[]';
        }
        return output;
    }

    parseMethodDescriptor(descriptor) {
        let first = descriptor.split(')')[0].slice(1);

        let pre_types = [];
        for (let i = 0; i < first.length; ++i) {
            let entry = this.parseDescriptor(first.slice(i));
            if (entry.type === 'ClassRef') {
                i += entry.ref.length + 1;
            }
            pre_types.push(entry);
        }
        let arg_types = [];
        let is_array = false;
        for (let i = 0; i < pre_types.length; ++i) {
            let type = '';
            if (pre_types[i].type === 'ClassRef') {
                type = pre_types[i].ref;
            } else if (pre_types[i].type === 'ArrayRef') {
                is_array = true;
                continue;
            } else if (pre_types[i].type) {
                type = pre_types[i].type.toLowerCase();
            }
            if (is_array) {
                type += '[]';
                is_array = false;
            }
            arg_types.push(type);
        }

        let return_type = this.parseFieldDescriptor(descriptor.split(')')[1]);
        return { arg_types, return_type };
    }

    readOpcode(stream, wide = false, aligned = false) {
        let opcode = stream.readByte();
        let output = Opcodes.NameFor(opcode) + '.';
        switch (opcode) {
            case Opcodes.bipush: // wide does not apply
            case Opcodes.ldc: // wide does not apply
            case Opcodes.iload:
            case Opcodes.lload:
            case Opcodes.fload:
            case Opcodes.dload:
            case Opcodes.aload:
            case Opcodes.istore:
            case Opcodes.lstore:
            case Opcodes.fstore:
            case Opcodes.dstore:
            case Opcodes.astore:
            case Opcodes.ret:
            case Opcodes.aret: {
                if (wide) {
                    output += stream.readWord();
                } else {
                    output += stream.readByte();
                }
            } break;
            case Opcodes.sipush:
            case Opcodes.ldc_w:
            case Opcodes.ldc2_w:
            case Opcodes.getstatic:
            case Opcodes.putstatic:
            case Opcodes.getfield:
            case Opcodes.putfield:
            case Opcodes.invokevirtual:
            case Opcodes.invokespecial:
            case Opcodes.invokestatic:
            case Opcodes.new:
            case Opcodes.anewarray:
            case Opcodes.checkcast: {
                output += stream.readWord();
            } break;
            case Opcodes.ifeq:
            case Opcodes.ifne:
            case Opcodes.iflt:
            case Opcodes.ifge:
            case Opcodes.ifgt:
            case Opcodes.ifle:
            case Opcodes.if_icmpeq:
            case Opcodes.if_icmpne:
            case Opcodes.if_icmplt:
            case Opcodes.if_icmpge:
            case Opcodes.if_icmpgt:
            case Opcodes.if_icmple:
            case Opcodes.if_acmpeq:
            case Opcodes.if_acmpne:
            case Opcodes.goto:
            case Opcodes.jsr:
            case Opcodes.ifnull:
            case Opcodes.ifnonnull: {
                output += stream.readWord();
            } break;
            case Opcodes.goto_w:
            case Opcodes.jsr_w: {
                output = stream.readDWord();
            } break;
            case Opcodes.iinc: {
                output += stream.readByte() + '.' + stream.readByte();
            } break;
            case Opcodes.invokedynamic: {
                output += stream.readWord();
                stream.seek(2);
            } break;
            case Opcodes.multianewarray: {
                output += stream.readWord() + '.' + stream.readByte();
            } break;
            case Opcodes.invokeinterface: {
                output += stream.readWord() + '.' + stream.readByte();
                stream.seek(1);
            } break;
            case Opcodes.wide: {
                output = this.readOpcode(stream, true);
            } break;
            case Opcodes.tableswitch: {
                if (aligned) {
                    stream.align(4);
                }
                let defaultByte = stream.readDWord();
                let low = stream.readDWord();
                let high = stream.readDWord();
                let count = high - low + 1;
                output = 'tableswitch.' + defaultByte + '-' + count;
                for (let i = 0; i < count; ++i) {
                    output += stream.readDWord();
                    if (i < count - 1) {
                        output += '-';
                    }
                }
            } break;
            case Opcodes.lookupswitch: {
                // TODO
                if (aligned) {
                    stream.align(4);
                }
                console.error('lookupswitch');
                process.exit(1);
            } break;
            default:
                break;
        }
        return output;
    }

    decompile2() {
        let output = '';
        let tabs = '\t';

        // create package identifier
        if (this.package_name) {
            output += 'package ' + this.package_name + ';\n\n';
        }

        // define imports
        let imports = [];
        // generate imports for super class
        imports.push(this.super_class);
        // generate imports for interfaces
        for (let i = 0; i < this.interfaces.length; ++i) {
            if (imports.includes(this.interfaces[i])) {
                continue;
            }
            imports.push(this.interfaces[i]);
        }
        // generate imports for fields
        let fields = this.fields.filter(x => x.descriptor.includes('.'));
        for (let i = 0; i < fields.length; ++i) {
            if (imports.includes(fields[i].descriptor)) {
                continue;
            }
            imports.push(fields[i].descriptor);
        }
        // generate imports for methods
        // arg types for methods
        let methods_arg = this.methods.filter(x => x.descriptor.arg_types.includes('.'));
        for (let i = 0; i < methods_arg.length; ++i) {
            for (let j = 0; j < methods_arg.descriptor.arg_types.length; ++j) {
                if (imports.includes(methods_arg[i].descriptor.arg_types[j])) {
                    continue;
                }
                imports.push(methods_arg[i].descriptor.arg_types[j]);
            }
        }
        // return types for methods
        let methods = this.methods.filter(x => x.descriptor.return_type.includes('.'));
        for (let i = 0; i < methods.length; ++i) {
            if (imports.includes(methods[i].descriptor.return_type)) {
                continue;
            }
            imports.push(methods[i].descriptor.return_type);
        }
        // write imports
        imports.sort();
        for (let i = 0; i < imports.length; ++i) {
            if (imports[i].startsWith('java.lang')) {
                continue;
            }
            output += 'import ' + imports[i] + ';\n';
        }
        output += '\n';

        // write class definition
        output += this.access_flags + ' class ' + this.class_name;
        if (this.interfaces.length) {
            output += ' implements ';
            for (let i = 0; i < this.interfaces.length; ++i) {
                output += this.interfaces[i];
                if (i < this.interfaces.length - 1) {
                    output += ',';
                }
            }
        }
        output += ' {\n';

        // write methods
        for (let i = 0; i < this.methods.length; ++i) {
            output += '\n';
            let method = this.methods[i];
            let name = method.name;
            let type = method.descriptor.return_type + ' ';
            if (name === '<init>') {
                name = this.class_name;
                type = '';
            } else if (name === '<clinit>') {
                // todo: static initializers
                continue;
            }
            output += tabs + method.access_flags + ' ' + type + name + '() {\n';
            tabs = '\t\t';
            for (let j = 0; j < method.attributes[0].code.length; ++j) {
                let instruction = method.attributes[0].code[j];
                if (instruction.startsWith('return.')) {
                    output += tabs + 'return;\n';
                } else {
                    output += tabs + '// ' + instruction + '\n';
                }
            }
            tabs = '\t';
            output += tabs + '}\n';
        }

        // write field definitions
        for (let i = 0; i < this.fields.length; ++i) {
            let field = this.fields[i];
            let name = field.name;
            let type = field.descriptor;
            let access_flags = field.access_flags + ' ';
            if (!field.access_flags) {
                access_flags = '';
            }
            output += tabs + access_flags + type + ' ' + name + ';\n';
        }

        output += '}\n';
        return output;
    }

    writeLine(tabs, text) {
        this.output.push({ tabs, text });
    }

    editLine(line, text, tabs = null) {
        this.output[line].text = text;
        if (tabs !== null) {
            this.output[line].tabs = tabs;
        }
    }

    decompilePackage(tabs) {
        if (this.package_name.length) {
            this.writeLine(tabs, `package ${this.package_name};`);
            this.writeLine(tabs, '');
        }
    }

    decompileImports(tabs) {
        let imports = [];
        // generate imports for super class
        imports.push(this.super_class);
        // generate imports for interfaces
        for (let i = 0; i < this.interfaces.length; ++i) {
            if (imports.includes(this.interfaces[i])) {
                continue;
            }
            imports.push(this.interfaces[i]);
        }
        // generate imports for fields
        let fields = this.fields.filter(x => x.descriptor.includes('.'));
        for (let i = 0; i < fields.length; ++i) {
            if (imports.includes(fields[i].descriptor)) {
                continue;
            }
            imports.push(fields[i].descriptor);
        }
        // generate imports for methods
        // arg types for methods
        let methods_arg = this.methods.filter(x => x.descriptor.arg_types); // todo: filter for '.' only
        for (let i = 0; i < methods_arg.length; ++i) {
            for (let j = 0; j < methods_arg[i].descriptor.arg_types.length; ++j) {
                if (!methods_arg[i].descriptor.arg_types[j].includes('.') || imports.includes(methods_arg[i].descriptor.arg_types[j])) {
                    continue;
                }
                imports.push(methods_arg[i].descriptor.arg_types[j]);
            }
        }
        // return types for methods
        let methods = this.methods.filter(x => x.descriptor.return_type.includes('.'));
        for (let i = 0; i < methods.length; ++i) {
            if (imports.includes(methods[i].descriptor.return_type)) {
                continue;
            }
            imports.push(methods[i].descriptor.return_type);
        }
        // write imports
        imports.sort();
        let imported = false;
        for (let i = 0; i < imports.length; ++i) {
            if (imports[i].startsWith('java.lang') || (!this.package_name && !imports[i].includes('.'))) {
                continue;
            }
            this.writeLine(tabs, `import ${imports[i]};`);
            imported = true;
        }
        if (imported) {
            this.writeLine(tabs, '');
        }
    }

    describeArgType(type) {
        let name = lowercaseFirstLetter(type.replaceAll('[]', ''));
        if (type.includes('[]')) {
            name += 'Array';
        }
        return name;
    }

    decompileCode(local, instructions, read = 0, operations = []) {
        let instruction = instructions[operations.length];
        let params = instruction.split('.')[1];

        let more = false;
        switch (instruction.split('.')[0]) {
        case 'athrow':
            operations.push('throw');
            break;
        case 'new':
            operations.push('new');
            break;
        case 'return':
            operations.push('return');
            break;
        case 'ldc': {
            let ref = this.getConstant(params);
            if (!ref) {
                break;
            }
            operations.push(ref);
        } break;
        case 'ldc_w': {
            let ref = this.getConstant(params);
            if (!ref) {
                break;
            }
            operations.push(ref);
        } break;
        case 'ldc2': {
            let ref = this.getConstant(params);
            if (!ref) {
                break;
            }
            operations.push(ref);
        } break;
        case 'ldc2_w': {
            let ref = this.getConstant(params);
            if (!ref) {
                break;
            }
            operations.push(ref);
        } break;
        case 'invokestatic': {
            let ref = this.getConstant(params);
            operations.push(this.getConstant(this.getConstant(ref.type).name));
        } break;
        case 'invokespecial': {
            let ref = this.getConstant(params);
            operations.push(this.getConstant(this.getConstant(ref.type).name));
        } break;
        case 'invokevirtual': {
            let ref = this.getConstant(params);
            operations.push(this.getConstant(this.getConstant(ref.type).name));
        } break;
        case 'invokedynamic': {
            let ref = this.getConstant(params);
            operations.push(this.getConstant(this.getConstant(ref.type).name));
        } break;
        case 'invokeinterface': {
            let ref = this.getConstant(params);
            operations.push(this.getConstant(this.getConstant(ref.type).name));
        } break;
        case 'iload_0':
            operations.push(local[0]);
            break;
        case 'iload_1':
            operations.push(local[1]);
            break;
        case 'iload_2':
            operations.push(local[2]);
            break;
        case 'iload_3':
            operations.push(local[3]);
            break;
        case 'ifeq':
            operations.push('if (X == Y)');
            break;
        case 'ifne':
            operations.push('if (X != Y)');
            break;
        case 'ifge':
            operations.push('if (X >= Y)');
            break;
        case 'ifgt':
            operations.push('if (X > Y)');
            break;
        case 'ifle':
            operations.push('if (X <= Y)');
            break;
        case 'iflt':
            operations.push('if (X < Y)');
            break;
        case 'ifnonnull':
            operations.push('if (X != null)');
            break;
        case 'ifnull':
            operations.push('if (X == null)');
            break;
        case 'if_icmpeq':
            operations.push('if (X == Y)');
            break;
        case 'if_icmpne':
            operations.push('if (X != Y)');
            break;
        case 'if_acmpne':
            operations.push('if (X != Y)');
            break;
        case 'if_acmpeq':
            operations.push('if (X == Y)');
            break;
        case 'if_icmpge':
            operations.push('if (X >= Y)');
            break;
        case 'if_icmpgt':
            operations.push('if (X > Y)');
            break;
        case 'if_icmple':
            operations.push('if (X <= Y)');
            break;
        case 'if_icmplt':
            operations.push('if (X < Y)');
            break;
        case 'putfield': {
            let ref = this.getConstant(params);
            operations.push(this.getConstant(this.getConstant(ref.type).name));
        } break;
        case 'getfield': {
            let ref = this.getConstant(params);
            operations.push(this.getConstant(this.getConstant(ref.type).name));
        } break;
        case 'putstatic': {
            let ref = this.getConstant(params);
            operations.push(this.getConstant(this.getConstant(ref.type).name));
        } break;
        case 'getstatic': {
            let ref = this.getConstant(params);
            operations.push(this.getConstant(this.getConstant(ref.type).name));
        } break;
        case 'monitorenter':
            operations.push('synchronized (X) {');
            break;
        case 'monitorexit':
            operations.push('}');
            break;
        case 'aload_0':
            operations.push(local[0]);
            break;
        case 'astore': {
            let ref = this.getConstant(params);
            if (!ref) {
                break;
            }
            operations.push(ref.name);
        } break;
        case 'i2l':
        case 'f2l':
        case 'd2l':
            operations.push('(long)');
            break;
        case 'i2f':
        case 'l2f':
        case 'd2f':
            operations.push('(float)');
            break;
        case 'i2d':
        case 'l2d':
        case 'f2d':
            operations.push('(double)');
            break;
        case 'l2i':
        case 'f2i':
        case 'd2i':
            operations.push('(int)');
            break;
        case 'i2b':
            operations.push('(byte)');
            break;
        case 'i2c':
            operations.push('(char)');
            break;
        case 'i2s':
            operations.push('(short)');
            break;
        case 'bipush':
        case 'sipush':
            operations.push(params);
            break;
        case 'aconst_null':
            operations.push('null');
            break;
        case 'lconst_0':
            operations.push('0L');
            break;
        case 'lconst_1':
            operations.push('1L');
            break;
        case 'iconst_m1':
            operations.push('-1');
            break;
        case 'iconst_0':
            operations.push('0');
            break;
        case 'iconst_1':
            operations.push('1');
            break;
        case 'iconst_2':
            operations.push('2');
            break;
        case 'iconst_3':
            operations.push('3');
            break;
        case 'iconst_4':
            operations.push('4');
            break;
        case 'iconst_5':
            operations.push('5');
            break;
        case 'iand':
            operations.push('X & Y');
            break;
        case 'ior':
            operations.push('X | Y');
            break;
        case 'irem':
            operations.push('X % Y');
            break;
        case 'ishr':
            operations.push('X << Y');
            break;
        case 'iushr':
            operations.push('X <<< Y');
            break;
        case 'ishl':
            operations.push('X >> Y');
            break;
        case 'ixor':
            operations.push('X ^ Y');
            break;
        case 'iadd':
        case 'dadd':
            operations.push('X + Y');
            break;
        case 'isub':
        case 'dsub':
            operations.push('X - Y');
            break;
        case 'idiv':
        case 'ddiv':
            operations.push('X / Y');
            break;
        case 'imul':
        case 'dmul':
            operations.push('X * Y');
            break;
        case 'ireturn':
            operations.push('return X');
            break;
        case 'checkcast': {
            let ref = this.getConstant(params);
            operations.push(this.getConstant(ref));
        } break;
        default:
            operations.push('TODO');
            break;
        }

        if (more) {
            let next = this.decompileCode(local, instruction, operations);
            operations = next.operations;
        }

        return { read, operations };
    }

    decompileMethods(tabs) {
        this.writeLine(tabs, '');
        for (let i = 0; i < this.methods.length; ++i) {
            let method = this.methods[i];
            let name = method.name;
            let type = method.descriptor.return_type;
            if (name === '<init>') {
                name = this.class_name;
                type = '';
            } else if (name === '<clinit>') {
                // todo: static initializers
                continue;
            } else if (type.includes('.')) {
                type = method.descriptor.return_type.split('.');
                type = type[type.length - 1];
                type += ' ';
            } else {
                type += ' ';
            }
            let args = '';
            method.descriptor.arg_names = [];
            for (let j = 0; j < method.descriptor.arg_types.length; ++j) {
                let arg_type = method.descriptor.arg_types[j];
                if (arg_type.includes('.')) {
                    arg_type = method.descriptor.arg_types[j].split('.');
                    arg_type = arg_type[arg_type.length - 1];
                }
                let arg_name = `${this.describeArgType(arg_type)}_${j}`;
                method.descriptor.arg_names[j] = arg_name;
                let arg = `${arg_type} ${arg_name}`;
                if (j < method.descriptor.arg_types.length - 1) {
                    arg += ', ';
                }
                args += arg;
            }
            if (method.access_flags.length) {
                method.access_flags += ' ';
            }
            this.writeLine(tabs, `// ${method.description}`);
            this.writeLine(tabs++, `${method.access_flags}${type}${name}(${args}) {`);
            for (let j = 0; j < method.attributes[0].code.length; ++j) {
                let instruction = method.attributes[0].code[j];
                this.writeLine(tabs, `// ---- ${instruction}`);
                let decompiled = this.decompileCode(method.descriptor.arg_names, method.attributes[0].code.slice(j));
                let line = '';
                for (let k = 0; k < decompiled.operations.length; ++k) {
                    line += '// ' + decompiled.operations[k] + ' ';
                }
                this.writeLine(tabs, line);
                let operations = decompiled.operations.length;
                if (operations > 0) {
                    operations--;
                }
                j += operations;
            }
            this.writeLine(--tabs, '}');
            this.writeLine(tabs, '');
        }
    }

    decompileFields(tabs, renameFields = true) {
        this.writeLine(tabs, '// field definitions');
        for (let i = 0; i < this.fields.length; ++i) {
            let field = this.fields[i];
            let type = field.descriptor;
            if (type.includes('.')) {
                type = type.split('.');
                type = type[type.length - 1];
            }
            let name = field.name;
            if (renameFields) {
                name = `${this.describeArgType(type)}_${i}`;
            }
            let access_flags = field.access_flags + ' ';
            if (!field.access_flags) {
                access_flags = '';
            }
            this.writeLine(tabs, access_flags + type + ' ' + name + ';');
        }
        this.writeLine(tabs, '');
    }

    decompileClass(tabs) {
        let hasSuper = this.access_flags.includes('super');
        if (hasSuper) {
            this.access_flags = this.access_flags.replace('super', '').trim();
        }
        let classLine = this.access_flags + ' class ' + this.class_name;
        // classes may implicitly extend Object
        if (hasSuper && this.super_class !== 'java.lang.Object') {
            if (this.super_class.includes('.')) {
                this.super_class = this.super_class.slice(this.super_class.lastIndexOf('.') + 1);
            }
            classLine += ' extends ' + this.super_class;
        }
        if (this.interfaces.length) {
            classLine += ' implements ';
            for (let i = 0; i < this.interfaces.length; ++i) {
                if (this.interfaces[i].includes('.')) {
                    this.interfaces[i] = this.interfaces[i].slice(this.interfaces[i].lastIndexOf('.') + 1);
                }
                classLine += this.interfaces[i];
                if (i < this.interfaces.length - 1) {
                    classLine += ', ';
                }
            }
        }
        classLine += ' {';
        this.writeLine(tabs++, classLine);
        this.decompileMethods(tabs);
        this.decompileFields(tabs--);
        this.writeLine(tabs, '}');
    }

    decompile() {
        let text = '';
        let tabs = 0;

        this.decompilePackage(tabs);

        this.decompileImports(tabs);

        this.decompileClass(tabs);

        for (let i = 0; i < this.output.length; ++i) {
            for (let j = 0; j < this.output[i].tabs; ++j) {
                text += '\t';
            }
            text += this.output[i].text + '\n';
        }
        return text;
    }
}
