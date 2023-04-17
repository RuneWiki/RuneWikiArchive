import { ByteBuffer, ZipArchive } from 'utility.js';
import ClassReader from './ClassReader.js';
import fs from 'fs';
import path from 'path';

let jar = new ZipArchive('dump/jar/runescape664.jar');

let list = jar.filterFiles('.class');
let classes = [];

let found = [];
// read all files into memory, parse them (does not edit anything in this pass)
for (let i = 0; i < list.length; ++i) {
    try {
        let name = list[i].name;
        let lastModified = list[i].lastModified;
        let raw = jar.extractInMemory(list[i].name);
        let reader = new ClassReader(new ByteBuffer(raw));
        if (!reader.this_class || !reader.this_class.length) {
            console.log('Warning: Failed to read', name);
            continue;
        }
        let md5 = ByteBuffer.md5(raw);
        classes.push({ name, lastModified, reader, md5 });
        let find = reader.constant_pool.filter(x => typeof x.info === 'string' && x.info.indexOf('jagex') !== -1);
        if (find) {
            found.push(...find);
        }
    } catch (ex) {
        console.error(ex);
        // process.exit(1);
    }
}

console.log(found);

// process all class files
// rename classes
// let classCounter = 1;
// classes = classes.map((x) => {
//     x.reader.original = x.reader.class_name;
//     if (x.reader.class_name.length < 3) {
//         x.reader.class_name = `Class${classCounter++}`;
//         if (x.reader.package_name.length) {
//             x.reader.this_class = x.reader.package_name + '.' + x.reader.class_name;
//         } else {
//             x.reader.this_class = x.reader.class_name;
//         }
//     }
//     return x;
// });

// rename all super references
// classes = classes.map((x) => {
//     if (x.reader.super_class.includes('java')) {
//         return x;
//     }
//     x.reader.super_class = classes.filter(y => x.reader.super_class === y.reader.original)[0].reader.class_name;
//     return x;
// });

// rename all fields
// classes = classes.map((x) => {
//     let fieldCounter = 1;
//     for (let j = 0; j < x.reader.fields.length; ++j) {
//         x.reader.fields[j].original = x.reader.fields[j].name;
//         x.reader.fields[j].name = `field${fieldCounter++}`;
//     }
//     return x;
// });

// rename all methods
// classes = classes.map((x) => {
//     let methodCounter = 1;
//     for (let j = 0; j < x.reader.methods.length; ++j) {
//         x.reader.methods[j].original = x.reader.methods[j].name;
//         if (x.reader.methods[j].name.length < 3) {
//             x.reader.methods[j].name = `method${methodCounter++}`;
//         }
//     }
//     return x;
// });

// rename all descriptor references
// classes = classes.map((x) => {
//     for (let j = 0; j < x.reader.methods.length; ++j) {
//         if (x.reader.methods[j].descriptor.return_type.length < 3 && x.reader.methods[j].descriptor.return_type.length > 0) {
//             let match = classes.filter((y) => y.name.endsWith(`${x.reader.methods[j].descriptor.return_type}.class`))[0];
//             x.reader.methods[j].descriptor.return_type = match.reader.class_name;
//         }
//         for (let k = 0; k < x.reader.methods[j].descriptor.arg_types.length; ++k) {
//             if (x.reader.methods[j].descriptor.arg_types[k].length < 3 && x.reader.methods[j].descriptor.arg_types[k].length > 0) {
//                 // TODO: should eventually replace arrays as well
//                 let match = classes.filter((y) => y.name.endsWith(`${x.reader.methods[j].descriptor.arg_types[k]}.class`))[0];
//                 x.reader.methods[j].descriptor.arg_types[k] = match.reader.class_name;
//             }
//         }
//     }
//     return x;
// });

// rename all method references

// rename all field references
// classes = classes.map((x) => {
//     for (let j = 0; j < x.reader.fields.length; ++j) {
//         let type = x.reader.fields[j].descriptor.replaceAll('[]', '');
//         if (type.length < 3) {
//             let match = classes.filter((y) => y.name.endsWith(`${type}.class`))[0];
//             if (!match) {
//                 continue;
//             }
//             x.reader.fields[j].descriptor = x.reader.fields[j].descriptor.replace(type, match.reader.class_name);
//         }
//     }
//     return x;
// });

// classes.map((x) => {
//     let dest = x.reader.this_class.replaceAll('.', '/') + '.java';
//     let dirname = path.dirname(dest);
//     // TODO: may be incorrect on multi-depth packages
//     if (dirname !== '.') {
//         fs.mkdirSync('dump/extracted/' + dirname, { recursive: true});
//         fs.writeFileSync('dump/extracted/' + dirname + '/' + path.basename(dest), x.reader.decompile());
//     } else {
//         fs.writeFileSync('dump/extracted/' + path.basename(dest), x.reader.decompile());
//     }
// });
// fs.writeFileSync('dump/classes.json', JSON.stringify(classes, null, 2));
