import {} from 'dotenv/config';
import fs from 'fs';

let items = [];

let files = fs.readdirSync(`${process.env.ASSET_DIR}/objs`);

// load items
for (let i = 0; i < files.length; ++i) {
    let file = JSON.parse(fs.readFileSync(`${process.env.ASSET_DIR}/objs/` + files[i]));
    items[file.id] = file;
    items[file.id].internal_name = files[i].replace('.json', '');
    items[file.id].file_name = files[i];
}

// rename certs if they're out of date
items.map(item => {
    if (!item.notedId) {
        return;
    }

    items[item.notedId].internal_name = item.internal_name = 'cert_' + item.internal_name;
    if (!fs.existsSync(`${process.env.ASSET_DIR}/objs/` + items[item.notedId].internal_name + '.json')) {
        fs.renameSync(`${process.env.ASSET_DIR}/objs/` + items[item.notedId].file_name, `${process.env.ASSET_DIR}/objs/` + items[item.notedId].internal_name + '.json');
    }
});
