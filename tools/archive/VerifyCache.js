import { FileStore } from '#formats/FileStore.js';
import { ByteBuffer } from '#util/ByteBuffer.js';

export function verifyCache(cache) {
    // check store 0
    const totalArchives = cache.archives.length - 1;
    const archivesCount = cache.archives.filter(x => x).length;
    const archivesMissing = cache.archives.filter(x => !x).length;

    if (cache.archives.length && archivesMissing) {
        console.log(`Store 0 (Archives): Missing ${archivesMissing}/${totalArchives} (${(archivesCount / totalArchives * 100).toFixed(2)}%)`);
    }

    // check store 1
    const models = cache.models.filter(x => x.version !== -1);
    const totalModels = models.length;
    let modelsCount = 0;
    let modelsMissing = 0;
    let modelsBadCrc = 0;
    models.forEach(model => {
        const file = cache.read(1, model.id);
        if (!file) {
            modelsMissing++;
            // console.log(`Missing model ${model.id}`);
            return;
        }

        modelsCount++;

        const crc = ByteBuffer.crc32(file.slice(0, file.length - 2));
        if (crc != model.crc) {
            modelsBadCrc++;
            // console.log(`Bad CRC for model ${i}: ${crc} != ${model.crc}`);
            return;
        }
    });

    if (totalModels) {
        console.log(`Store 1 (Models): Missing ${modelsMissing}/${totalModels} (${(modelsCount / totalModels * 100).toFixed(2)}%)${modelsBadCrc ? ` (${modelsBadCrc} bad CRC)` : ''}`);
    }

    // check store 2
    const anims = cache.anims.filter(x => x.version !== -1);
    const totalAnims = anims.length;
    let animsCount = 0;
    let animsMissing = 0;
    let animsBadCrc = 0;
    anims.forEach(anim => {
        const file = cache.read(2, anim.id);
        if (!file) {
            animsMissing++;
            // console.log(`Missing anim ${anim.id}`);
            return;
        }

        animsCount++;

        const crc = ByteBuffer.crc32(file.slice(0, file.length - 2));
        if (crc != anim.crc) {
            animsBadCrc++;
            // console.log(`Bad CRC for anim ${i}: ${crc} != ${anim.crc}`);
            return;
        }
    });

    if (totalAnims) {
        console.log(`Store 2 (Animations): Missing ${animsMissing}/${totalAnims} (${(animsCount / totalAnims * 100).toFixed(2)}%)${animsBadCrc ? ` (${animsBadCrc} bad CRC)` : ''}`);
    }

    // check store 3
    const midis = cache.midis.filter(x => x.version !== -1);
    const totalMidis = midis.length;
    let midisCount = 0;
    let midisMissing = 0;
    let midisBadCrc = 0;
    midis.forEach(midi => {
        const file = cache.read(3, midi.id);
        if (!file) {
            midisMissing++;
            // console.log(`Missing midi ${midi.id}`);
            return;
        }

        midisCount++;

        const crc = ByteBuffer.crc32(file.slice(0, file.length - 2));
        if (crc != midi.crc) {
            midisBadCrc++;
            // console.log(`Bad CRC for midi ${i}: ${crc} != ${midi.crc}`);
            return;
        }
    });

    if (totalMidis) {
        console.log(`Store 3 (Midis): Missing ${midisMissing}/${totalMidis} (${(midisCount / totalMidis * 100).toFixed(2)}%)${midisBadCrc ? ` (${midisBadCrc} bad CRC)` : ''}`);
    }

    // check store 4
    const maps = cache.rawMaps.filter(x => x.version !== -1);
    const totalMaps = maps.length;
    let mapsCount = 0;
    let mapsMissing = 0;
    let mapsBadCrc = 0;
    maps.forEach(map => {
        const file = cache.read(4, map.id);
        if (!file) {
            mapsMissing++;
            // console.log(`Missing map ${map.id}`);
            return;
        }

        mapsCount++;

        const crc = ByteBuffer.crc32(file.slice(0, file.length - 2));
        if (crc != map.crc) {
            mapsBadCrc++;
            // console.log(`Bad CRC for map ${i}: ${crc} != ${map.crc}`);
            return;
        }
    });

    if (totalMaps) {
        console.log(`Store 4 (Maps): Missing ${mapsMissing}/${totalMaps} (${(mapsCount / totalMaps * 100).toFixed(2)}%)${mapsBadCrc ? ` (${mapsBadCrc} bad CRC)` : ''}`);
    }

    // print statistics
    const totalCount = archivesCount + modelsCount + animsCount + midisCount + mapsCount;
    const totalMissing = archivesMissing + modelsMissing + animsMissing + midisMissing + mapsMissing;
    const totalLength = totalArchives + totalModels + totalAnims + totalMidis + totalMaps;

    console.log(`Missing ${totalMissing} files out of ${totalLength} total (${(totalCount / totalLength * 100).toFixed(2)}%)`);
}

if (process.argv.length > 2) {
    verifyCache(new FileStore(process.argv[2]));
}
