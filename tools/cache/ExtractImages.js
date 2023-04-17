import fs from 'fs';
import FileArchive from '#cache/FileArchive.js';
import Image from '#cache/Image.js';
import ImageNames from '#enum/ImageNames.js';
import { FileStore } from '#formats/FileStore.js';

const cache = new FileStore('dump/packed/289');

let title = new FileArchive(cache.read(0, 1, false));
// let title = FileArchive.fromFile('data/cache/title');

fs.mkdirSync('dump/title', { recursive: true });
for (let i = 0; i < title.files.length; i++) {
    let file = title.files[i];

    if (file.name.endsWith('.dat') && !file.name.startsWith('index')) {
        let filename = file.name.slice(0, -4);

        if (filename == 'b12' || filename == 'p11' || filename == 'p12' || filename == 'q8' || filename == 'runes') {
            fs.mkdirSync(`dump/title/${filename}`, { recursive: true });

            for (let i = 0; i < 100; i++) {
                let image = new Image(title, filename, i);

                let converted = await image.convert();
                if (converted) {
                    fs.writeFileSync(`dump/title/${filename}/${i}.png`, await image.convert());
                } else {
                    break;
                }
            }
        } else {
            let image = new Image(title, filename);

            let converted = await image.convert();
            if (converted) {
                if (image.jpeg) {
                    fs.writeFileSync(`dump/title/${filename}.jpg`, converted);
                } else {
                    fs.writeFileSync(`dump/title/${filename}.png`, converted);
                }
            }
        }
    }
}

let media = new FileArchive(cache.read(0, 4, false));
// let media = FileArchive.fromFile('data/cache/media');

fs.mkdirSync('dump/media', { recursive: true });
for (let i = 0; i < media.files.length; i++) {
    let file = media.files[i];
    if (!file || !file.name) {
        console.log('skipping', file);
        continue;
    }

    if (file.name.endsWith('.dat') && !file.name.startsWith('index')) {
        let filename = file.name.slice(0, -4);

        if (ImageNames[filename]) {
            fs.mkdirSync(`dump/media/${filename}`, { recursive: true });

            for (let i = 0; i < 100; i++) {
                let image = new Image(media, filename, i);

                let converted = await image.convert();
                if (converted) {
                    let name = ImageNames[filename][i] ?? i;

                    fs.writeFileSync(`dump/media/${filename}/${name}.png`, converted);
                } else {
                    break;
                }
            }
        } else {
            let image = new Image(media, filename);

            let converted = await image.convert();
            if (converted) {
                fs.writeFileSync(`dump/media/${filename}.png`, converted);
            }
        }
    }
}

let textures = new FileArchive(cache.read(0, 6, false));
// let textures = FileArchive.fromFile('data/cache/textures');

fs.mkdirSync('dump/textures', { recursive: true });
for (let i = 0; i < textures.files.length; i++) {
    let file = textures.files[i];

    if (file.name.endsWith('.dat') && !file.name.startsWith('index')) {
        let filename = file.name.slice(0, -4);
        let image = new Image(textures, filename);

        let converted = await image.convert();
        if (converted) {
            let name = ImageNames['textures'][filename] ?? i;

            fs.writeFileSync(`dump/textures/${name}.png`, converted);
        }
    }
}
