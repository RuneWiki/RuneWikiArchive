import { ByteBuffer, ZipArchive } from 'utility.js';
import fs from 'fs';
import { exec } from 'child_process';

const GZIP_HEADER = new Uint8Array([0x1F, 0x8B]);

function convertPack200(path, type = 0) {
    return new Promise((res, rej) => {
        let client = new ByteBuffer(fs.readFileSync(`${path}/main_file_cache.dat${type}`)).prepend(GZIP_HEADER);
        let name = 'runescape';
        if (type === 3) {
            name = 'runescape_gl';
        } else if (type === 5) {
            name = 'lib_gl';
        }
        fs.writeFileSync(`${path}/temp.${name}.jar`, client.raw);
        exec(`unpack200 ${path}/temp.${name}.jar dump/jar/${name}.jar`, () => {
            fs.unlinkSync(`${path}/temp.${name}.jar`);
            res(true);
        });
    });
}

async function convert(path) {
    if (fs.existsSync(`${path}/main_file_cache.dat0`)) {
        await convertPack200(path, 0);
    }
    if (fs.existsSync(`${path}/main_file_cache.dat3`)) {
        await convertPack200(path, 3);
    }
    if (fs.existsSync(`${path}/main_file_cache.dat5`)) {
        await convertPack200(path, 5);
    }

    let files = fs.readdirSync('dump/jar');
    for (let i = 0; i < files.length; ++i) {
        console.log('Processing', files[i]);
        let name = files[i].split('.');
        let ext = name[name.length - 1];

        let zip = new ZipArchive('dump/jar/' + files[i]);
        fs.utimesSync('dump/jar/' + files[i], zip.files[0].lastModified, zip.files[0].lastModified);

        name = name.slice(0, name.length - 1);
        if (name.length > 1 && name.indexOf('src') === -1) {
            name = name.slice(0, name.length - 1);
        }
        name = name.join('.');

        if (name.indexOf('.') === -1) {
            let datetime = zip.files[0].lastModified.toISOString().split('T');
            let date = datetime[0];
            let time = datetime[1].split('.')[0].replaceAll(':', '-');
            let folder = 'jar';
            if (name === 'runescape') {
                folder = 'runescape';
            } else if (name === 'runescape_gl') {
                folder = 'runescape_gl';
            } else if (name === 'lib_gl') {
                folder = 'lib_gl';
            }
            fs.renameSync('dump/jar/' + files[i], 'dump/' + folder + '/' + name + '.' + date + '.' + time + '.' + ext);
        }
    }
}

async function processDirectory(path) {
    let files = fs.readdirSync(path);

    let converted = [];
    for (let i = 0; i < files.length; ++i) {
        if (files[i].indexOf('rsmap') !== -1 || files[i].indexOf('classic') !== -1 || files[i].indexOf('armies') !== -1) {
            continue;
        }

        let isDir = fs.lstatSync(path + '/' + files[i]).isDirectory();
        if (!isDir && files[i].indexOf('main_file_cache') !== -1 && converted.indexOf(path) === -1) {
            console.log(path);
            try {
                converted.push(path);
                await convert(path);
            } catch (err) {
                console.log(err);
            }
        } else if (isDir) {
            await processDirectory(path + '/' + files[i]);
        }
    }
}

async function main() {
    await processDirectory('cache/clients');
}

main();
