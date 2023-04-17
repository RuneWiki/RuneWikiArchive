import {} from 'dotenv/config';

import { ModelReader } from '../src/formats/Model.js';
import fs from 'fs';

let models = new ModelReader();

let names = [];
for (let i = 0; i < models.count; ++i) {
    names[i] = i;
}

let items = fs.readdirSync(`${process.env.ASSET_DIR}/objs`);
for (let i = 0; i < items.length; ++i) {
    let item = JSON.parse(fs.readFileSync(`${process.env.ASSET_DIR}/objs/` + items[i]));
    let internal_name = items[i].replace('.json', '');

    if (item.modelIndex) {
        names[item.modelIndex] = 'inv_' + internal_name;
    }

    if (item.maleModel0) {
        names[item.maleModel0] = 'itm_model0m_' + internal_name;
    }

    if (item.femaleModel0) {
        if (!names[item.femaleModel0]) {
            names[item.femaleModel0] = 'itm_model0f_' + internal_name;
        } else {
            names[item.femaleModel0] = 'itm_model0_' + internal_name;
        }
    }

    if (item.maleModel1) {
        names[item.maleModel1] = 'itm_model1m_' + internal_name;
    }

    if (item.femaleModel1) {
        if (!names[item.femaleModel1]) {
            names[item.femaleModel1] = 'itm_model1f_' + internal_name;
        } else {
            names[item.femaleModel1] = 'itm_model1_' + internal_name;
        }
    }

    if (item.maleModel2) {
        names[item.maleModel2] = 'itm_model2m_' + internal_name;
    }

    if (item.femaleModel2) {
        if (!names[item.femaleModel2]) {
            names[item.femaleModel2] = 'itm_model2f_' + internal_name;
        } else {
            names[item.femaleModel2] = 'itm_model2_' + internal_name;
        }
    }

    if (item.maleHeadModelA) {
        names[item.maleHeadModelA] = 'itm_model_headAm_' + internal_name;
    }

    if (item.femaleHeadModelA) {
        if (!names[item.femaleHeadModelA]) {
            names[item.femaleHeadModelA] = 'itm_model_headAf_' + internal_name;
        } else {
            names[item.femaleHeadModelA] = 'itm_model_headA_' + internal_name;
        }
    }

    if (item.maleHeadModelB) {
        names[item.maleHeadModelB] = 'itm_model_headAm_' + internal_name;
    }

    if (item.femaleHeadModelB) {
        if (!names[item.femaleHeadModelB]) {
            names[item.femaleHeadModelB] = 'itm_model_headAf_' + internal_name;
        } else {
            names[item.femaleHeadModelB] = 'itm_model_headA_' + internal_name;
        }
    }
}

let npcs = fs.readdirSync(`${process.env.ASSET_DIR}/npcs`);
for (let i = 0; i < npcs.length; ++i) {
    let npc = JSON.parse(fs.readFileSync(`${process.env.ASSET_DIR}/npcs/` + npcs[i]));
    let internal_name = npcs[i].replace('.json', '');
    if (npc.modelIndices) {
        for (let j = 0; j < npc.modelIndices.length; ++j) {
            names[npc.modelIndices[j]] = 'npc_world_' + internal_name + '_' + j;
        }
    }
    if (npc.headModelIndices) {
        for (let j = 0; j < npc.headModelIndices.length; ++j) {
            names[npc.headModelIndices[j]] = 'npc_chat_' + internal_name + '_' + j;
        }
    }
}

let objects = fs.readdirSync(`${process.env.ASSET_DIR}/locs`);
for (let i = 0; i < objects.length; ++i) {
    let object = JSON.parse(fs.readFileSync(`${process.env.ASSET_DIR}/locs/` + objects[i]));
    let internal_name = objects[i].replace('.json', '');
    if (object.modelIndices) {
        for (let j = 0; j < object.modelIndices.length; ++j) {
            names[object.modelIndices[j]] = 'obj_' + internal_name + '_' + j;
        }
    }
}

import { IdentityKit } from '../src/formats/IdentityKit.js';
for (let i = 0; i < IdentityKit.instances.length; ++i) {
    let idk = IdentityKit.instances[i];
    let name = 'player_';
    let gender = 'male_';
    if (idk.type > 6) {
        gender = 'female_';
    }
    let part = '';
    if (idk.type === 0 || idk.type === 7) {
        part = 'head_';
    } else if (idk.type === 1) {
        part = 'beard_';
    } else if (idk.type === 2 || idk.type === 9) {
        part = 'chest_';
    } else if (idk.type === 3 || idk.type === 10) {
        part = 'arms_';
    } else if (idk.type === 4 || idk.type === 11) {
        part = 'hands_';
    } else if (idk.type === 5 || idk.type === 12) {
        part = 'legs_';
    } else if (idk.type === 6 || idk.type === 13) {
        part = 'feet_';
    }
    for (let j = 0; j < idk.modelIndices.length; ++j) {
        names[idk.modelIndices[j]] = name + gender + part + idk.id + '_' + j;
    }
}

import { SpotAnim } from '../src/formats/SpotAnim.js';
for (let i = 0; i < SpotAnim.instances.length; ++i) {
    let gfx = SpotAnim.instances[i];
    names[gfx.modelIndex] = 'gfx_' + gfx.id;
}

fs.writeFileSync('data/model-names.json', JSON.stringify(names, null, 2));
