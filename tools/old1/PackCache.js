import { ByteBuffer, RandomAccessFile } from "utility.js";
import { FileStore } from '../util/FileStore.js';

ByteBuffer.setGlobalEndianness(false);

import fs from 'fs';
import { FileArchive } from "../util/FileArchive.js";

const archives = fs.readdirSync('cache/raw/archives');
const model = fs.readdirSync('cache/raw/model');
const anim = fs.readdirSync('cache/raw/anim');
const midi = fs.readdirSync('cache/raw/midi');
const map = fs.readdirSync('cache/raw/map');
const idxNames = [
    'archives',
    'model',
    'anim',
    'midi',
    'map',
];
const revisions = archives.filter(x => x.startsWith('1.')).flatMap(x => x.substring(2));

if (fs.existsSync('cache/packed')) {
    fs.rmSync('cache/packed', { recursive: true, force: true });
}
fs.mkdirSync('cache/packed', { recursive: true });

for (let i = 0; i < revisions.length; ++i) {
    const revision = revisions[i];
    console.log(`${revision}:`);

    const path = `cache/packed/${revision}`;
    fs.mkdirSync(path);

    let store = new FileStore(path, false, true);

    // write idx0 archives
    let archive = archives.filter(x => x.endsWith(revision));
    for (let j = 0; j < archive.length; ++j) {
        store.write(0, j + 1, new ByteBuffer(fs.readFileSync(`cache/raw/archives/${archive[j]}`)));
    }

    let versionlist = new FileArchive(new ByteBuffer(fs.readFileSync(`cache/raw/archives/5.${revision}`)));

    for (let j = 1; j <= 4; ++j) {
        const idxName = idxNames[j];
        let crcsRaw = versionlist.read(`${idxName}_crc`);
        let versionsRaw = versionlist.read(`${idxName}_version`);

        let count = Math.ceil(versionsRaw.length / 2);
        let missing = 0;
        for (let k = 0; k < count; ++k) {
            let crc = crcsRaw.readDWord();
            let _unknown = versionsRaw.readByte();
            let version = versionsRaw.readByte();

            if (fs.existsSync(`cache/raw/${idxName}/${crc}`)) {
                store.write(j, k, new ByteBuffer(fs.readFileSync(`cache/raw/${idxName}/${crc}`)), false, version);
            } else {
                missing++;
            }
        }

        console.log(`Missing ${missing} ${idxName}s`);
    }

    // write idx1-4 entries

    process.exit(0);
    console.log();
}
