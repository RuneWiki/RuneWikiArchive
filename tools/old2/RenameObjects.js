import {} from 'dotenv/config';
import fs from 'fs';

let objects = [];

let files = fs.readdirSync(`data/src/locs/`);

function internalName(name) {
    return name.trim().replaceAll(' ', '_').replaceAll('/', '_').replaceAll('(', '_').replaceAll(')', '').replaceAll("'", '').replaceAll('.', '').replaceAll('+', '_').replaceAll('&', '_').replaceAll('-', '_').replaceAll('__', '_').toLowerCase();
}

// load and name objects
for (let i = 0; i < files.length; ++i) {
    let file = JSON.parse(fs.readFileSync(`data/src/locs/` + files[i]));
    objects[file.id] = file;

    if (file.name) {
        objects[file.id].internal_name = internalName(file.name);
        objects[file.id].counter = 1;
    }
}

// count duplicates
for (let i = 0; i < objects.length; ++i) {
    if (objects[i].name) {
        let others = objects.filter(x => x.id > i && x.internal_name === objects[i].internal_name);
        // if (objects[i].id === 1727 || objects[i].id === 1730) {
        //     console.log(others.length, objects[i].internal_name);
        // }
        if (others.length > 0) {
            others.map(other => {
                other.counter++;
            });
            objects[i].has_more = true;
        }
    }
}

// rename duplicates
for (let i = 0; i < objects.length; ++i) {
    if (objects[i].counter > 1 || objects[i].has_more) {
        objects[i].internal_name += '_' + objects[i].counter;
    }
    delete objects[i].counter;
    delete objects[i].has_more;
}

// rename files!
objects.map(object => {
    if (!object.internal_name) { // || (object.id !== 1727 && object.id !== 1730)
        return;
    }

    // console.log(object.id, object.internal_name, object.counter);
    if (!fs.existsSync(`data/src/locs/` + object.internal_name + '.json')) {
        fs.renameSync(`data/src/locs/` + object.id + '.json', `data/src/locs/` + object.internal_name + '.json');
    } else {
        console.log(object.internal_name, object.id);
    }
});
