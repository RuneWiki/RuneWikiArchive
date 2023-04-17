import {} from 'dotenv/config';
import fs from 'fs';

let items = [];

let files = fs.readdirSync(`${process.env.ASSET_DIR}/objs`);

// load and name items
for (let i = 0; i < files.length; ++i) {
    let file = JSON.parse(fs.readFileSync(`${process.env.ASSET_DIR}/objs/` + files[i]));
    items[file.id] = file;

    if (file.name) {
        items[file.id].internal_name = file.name.replaceAll(' ', '_').replaceAll('/', '_').replaceAll('(', '_').replaceAll(')', '').replaceAll("'", '').replaceAll('.', '').replaceAll('__', '_').toLowerCase();
        items[file.id].counter = 1;
    }
}

// identify stack items
for (let i = 0; i < items.length; ++i) {
    if (items[i].stackId) {
        for (let j = 0; j < items[i].stackId.length; ++j) {
            items[items[i].stackId[j]].internal_name = 'stack_' + items[i].internal_name + '_' + items[i].stackAmount[j];
        }
    }
}

// count duplicates
for (let i = 0; i < items.length; ++i) {
    if (items[i].name) {
        let others = items.filter(x => x.name === items[i].name && x.id > i);
        if (others.length > 0) {
            others.map(other => {
                other.counter++;
            });
            items[i].has_more = true;
        }
    }
}

// rename duplicates
for (let i = 0; i < items.length; ++i) {
    if (items[i].counter > 1 || items[i].has_more) {
        items[i].internal_name += '_' + items[i].counter;
    }
    delete items[i].counter;
    delete items[i].has_more;
}

// rename certs
for (let i = 0; i < items.length; ++i) {
    if (items[i].linkedId) {
        items[i].internal_name = 'cert_' + items[items[i].linkedId].internal_name;
    }
}

// rename files!
items.map(item => {
    if (!item.internal_name) {
        return;
    }

    if (!fs.existsSync(`${process.env.ASSET_DIR}/objs/` + item.internal_name + '.json')) {
        fs.renameSync(`${process.env.ASSET_DIR}/objs/` + item.id + '.json', `${process.env.ASSET_DIR}/objs/` + item.internal_name + '.json');
    } else {
        console.log(item.internal_name, item.id);
    }
});
