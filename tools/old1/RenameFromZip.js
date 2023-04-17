import { ZipArchive } from 'utility.js';
import fs from 'fs';

let files = fs.readdirSync('dump/jar');
for (let i = 0; i < files.length; ++i) {
    console.log('Processing', files[i]);

    try {
        let name = files[i].split('.');
        let ext = name[name.length - 1];
        ext = 'jar';

        let zip = new ZipArchive('dump/jar/' + files[i]);
        fs.utimesSync('dump/jar/' + files[i], zip.files[0].lastModified, zip.files[0].lastModified);

        // let datetime = new Date('2005-05-17T08:00:00.00Z');
        // fs.utimesSync('dump/jar/' + files[i], datetime, datetime);

        name = name.slice(0, name.length - 1);
        if (name.length > 1 && name.indexOf('src') === -1) {
            name = name.slice(0, name.length - 1);
        }
        name = name.join('.');

        // if (name.indexOf('.') === -1) {
            // datetime = datetime.toISOString().split('T');
            // let datetime = fs.statSync('dump/jar/' + files[i]).mtime.toISOString().split('T');
            let datetime = zip.files[0].lastModified.toISOString().split('T');
            let date = datetime[0];
            let time = datetime[1].split('.')[0].replaceAll(':', '-'); // '.' + time +
            fs.renameSync('dump/jar/' + files[i], 'dump/jar/' + 'mapview' + '.' + date + '.' + time + '.' + ext);
        // }
    } catch (err) {
        console.log(err);
    }
}
