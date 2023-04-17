import {} from 'dotenv/config';

import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);
ByteBuffer.setGlobalTerminator('\n');

import fs from 'fs';

function serializeItems(instances) {
    console.log('Serializing Object definitions');

    let idx = new ByteBuffer();
    let dat = new ByteBuffer();

    let count = instances.length;

    idx.writeWord(count);
    dat.writeWord(count);

    instances.map(x => {
        let start = dat.offset;

        if (typeof x.modelIndices !== 'undefined') {
            dat.writeByte(1);
            dat.writeByte(x.modelIndices.length);
            for (let n = 0; n < x.modelIndices.length; ++n) {
                dat.writeWord(x.modelIndices[n]);
                dat.writeByte(x.modelTypes[n]);
            }
        }

        if (typeof x.name !== 'undefined') {
            dat.writeByte(2);
            dat.writeStringTerminated(x.name);
        }

        if (typeof x.description !== 'undefined') {
            dat.writeByte(3);
            dat.writeStringTerminated(x.description);
        }

        if (x.sizeX !== 1) {
            dat.writeByte(14);
            dat.writeByte(x.sizeX);
        }

        if (x.sizeZ !== 1) {
            dat.writeByte(15);
            dat.writeByte(x.sizeZ);
        }

        if (x.hasCollision === false) {
            dat.writeByte(17);
        }

        if (x.isSolid === false) {
            dat.writeByte(18);
        }

        if (typeof x.interactable !== 'undefined') {
            dat.writeByte(19);
            dat.writeByte(x.interactable);
        }

        if (x.adjustToTerrain === true) {
            dat.writeByte(21);
        }

        if (x.delayShading === true) {
            dat.writeByte(22);
        }

        if (x.culls === true) {
            dat.writeByte(23);
        }

        if (typeof x.animationIndex !== 'undefined') {
            dat.writeByte(24);
            dat.writeWord(x.animationIndex);
        }

        if (x.disposeAlpha === true) {
            dat.writeByte(25);
        }

        if (typeof x.thickness !== 'undefined') {
            dat.writeByte(28);
            dat.writeByte(x.thickness);
        }

        if (typeof x.brightness !== 'undefined') {
            dat.writeByte(29);
            dat.writeByte(x.brightness);
        }

        if (typeof x.actions !== 'undefined') {
            for (let i = 0; i < x.actions.length; ++i) {
                if (!x.actions[i]) {
                    continue;
                }

                dat.writeByte(30 + i);
                dat.writeStringTerminated(x.actions[i]);
            }
        }

        if (typeof x.specular !== 'undefined') {
            dat.writeByte(39);
            dat.writeByte(x.specular);
        }

        if (typeof x.newColors !== 'undefined') {
            dat.writeByte(40);
            dat.writeByte(x.newColors.length);
            for (let i = 0; i < x.newColors.length; ++i) {
                dat.writeWord(x.oldColors[i]);
                dat.writeWord(x.newColors[i]);
            }
        }

        if (typeof x.mapfunction !== 'undefined') {
            dat.writeByte(60);
            dat.writeWord(x.mapfunction);
        }

        if (x.rotateCounterClockwise === true) {
            dat.writeByte(62);
        }

        if (x.hasShadow === false) {
            dat.writeByte(64);
        }

        if (typeof x.scaleX !== 'undefined') {
            dat.writeByte(65);
            dat.writeWord(x.scaleX);
        }

        if (typeof x.scaleY !== 'undefined') {
            dat.writeByte(66);
            dat.writeWord(x.scaleY);
        }

        if (typeof x.scaleZ !== 'undefined') {
            dat.writeByte(67);
            dat.writeWord(x.scaleZ);
        }

        if (typeof x.mapscene !== 'undefined') {
            dat.writeByte(68);
            dat.writeWord(x.mapscene);
        }

        if (typeof x.interactionSideFlags !== 'undefined') {
            dat.writeByte(69);
            dat.writeByte(x.interactionSideFlags);
        }

        if (typeof x.translateX !== 'undefined') {
            dat.writeByte(70);
            dat.writeWord(x.translateX);
        }

        if (typeof x.translateY !== 'undefined') {
            dat.writeByte(71);
            dat.writeWord(x.translateY);
        }

        if (typeof x.translateZ !== 'undefined') {
            dat.writeByte(72);
            dat.writeWord(x.translateZ);
        }

        if (x.obstructsGround === true) {
            dat.writeByte(73);
        }

        dat.writeByte(0); // end of NPC

        // record size in idx
        let end = dat.offset;
        idx.writeWord(end - start);
    });

    console.log('Serialized Object definitions');
    return { idx, dat };
}

let files = fs.readdirSync(`${process.env.ASSET_DIR}/locs/`);
let instances = [];
files.map(x => {
    instances.push(JSON.parse(fs.readFileSync(`${process.env.ASSET_DIR}/locs/` + x)));
});
instances.sort((a, b) => a.id - b.id);

let npc = serializeItems(instances);

fs.writeFileSync('data/src/lostcity/loc.idx', npc.idx.raw);
fs.writeFileSync('data/src/lostcity/loc.dat', npc.dat.raw);
