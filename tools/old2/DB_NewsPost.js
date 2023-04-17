import { v4 as uuid } from 'uuid';
import { NewsPost } from '../db.js';

async function main() {
    await NewsPost.query().insert({
        guid: uuid(),
        type_id: 2,
        title: 'Test Post 1',
        content: 'This is a test post.'
    });
}
main();