import fs from 'fs';

fs.readdirSync('view/news').filter(file => file.endsWith('.html') && file.startsWith('newsitem')).forEach(file => {
    let id = file.substring('newsitem_cgi_id_'.length, file.length - 5);

    fs.renameSync(`view/news/${file}`, `view/news/post${id}.ejs`);
});
