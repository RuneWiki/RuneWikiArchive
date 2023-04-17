import fs from 'fs';
import axios from 'axios';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36';

const download = async url => axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let urls = [
    // 'http://www.runescape.com/aff/runescape/title.html',
    // 'http://www.runescape.com/aff/runescape/support.html',
    // 'http://www.runescape.com/aff/runescape/manual.html',
    // 'http://www.runescape.com/aff/runescape/cookies.html',
    // 'http://www.runescape.com/aff/runescape/copyrightfaq.html',
    // 'http://www.runescape.com/aff/runescape/detail.html',

    // 'http://www.runescape.com/aff/runescape/terms/terms.html',
    // 'http://www.runescape.com/aff/runescape/privacy/privacy.html',

    // 'http://www.runescape.com/aff/runescape/faq/faqindex.html',
    // 'http://www.runescape.com/aff/runescape/faq/billingfaq.html',
    // 'http://www.runescape.com/aff/runescape/faq/technicalfaq.html',
    // 'http://www.runescape.com/aff/runescape/faq/gamefaq.html',
    // 'http://www.runescape.com/aff/runescape/faq/fansitefaq.html',

    // 'https://create.runescape.com/aff/runescape/index.html', // create account from 2005? might be the same

    // 'http://www.runescape.com/aff/runescape/whychoosers.html',
    // 'http://www.runescape.com/aff/runescape/about/about.html',
    // 'http://www.runescape.com/aff/runescape/about/whatisrs.html',
    // 'http://www.runescape.com/aff/runescape/about/virtual.html',
    // 'http://www.runescape.com/aff/runescape/about/getstart.html',

    // 'http://www.runescape.com/aff/runescape/members/members.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-whatis.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-agility.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-sounds.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-herblaw.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-fletching.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-thieving.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-duelling.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-adfree.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-bank.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-magic.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-crafting.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-fishing.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-weapons.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-morequests.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-moremonsters.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-morelocations.html',
    // 'http://www.runescape.com/aff/runescape/members/features/feature-payoptions.html',

    // 'http://www.runescape.com/aff/runescape/guides/guides.html',
    // 'http://www.runescape.com/aff/runescape/guides/rules.html',
    // 'http://www.runescape.com/aff/runescape/guides/securetips.html',
    // 'http://www.runescape.com/aff/runescape/guides/abuse.html',
    // 'http://www.runescape.com/aff/runescape/guides/safety.html',
    // 'http://www.runescape.com/aff/runescape/guides/responsible.html',
    // 'http://www.runescape.com/aff/runescape/guides/epilepsy.html',
    // 'http://www.runescape.com/aff/runescape/guides/scam.html',

    // 'http://www.runescape.com/aff/runescape/varrock/varrockindex.html',
    // 'http://www.runescape.com/aff/runescape/varrock/histories/historyindex.html',
    // 'http://www.runescape.com/aff/runescape/varrock/histories/histories.html',
    // 'http://www.runescape.com/aff/runescape/varrock/histories/gnomic.html',
    // 'http://www.runescape.com/aff/runescape/varrock/histories/arravtales1.html',
    // 'http://www.runescape.com/aff/runescape/varrock/histories/arravtales2.html',
    // 'http://www.runescape.com/aff/runescape/varrock/histories/runes.html',
    // 'http://www.runescape.com/aff/runescape/varrock/histories/spiritofpass.html',

    // 'http://www.runescape.com/aff/runescape/worldmap.html',

    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2skills.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2cooking.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2crafting.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2fightingmain.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2firemaking.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2fishing.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2magic.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2mining.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2prayer.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2ranging.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2runecraft.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2smithing.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2woodcutting.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2random.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2agility.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2herblore.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2fletching.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2thieving.html',

    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2controls.html',
    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2movement.html',
    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2inventory.html',
    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2camera.html',
    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2mapview.html',
    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2trading.html',
    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2stats.html',
    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2shops.html',
    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2friends.html',
    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2banks.html',
    // 'http://www.runescape.com/aff/runescape/rs2/controls/rs2options.html',

    // 'http://www.runescape.com/aff/runescape/rs2/members/rs2members-quests.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-runemystery.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-cookassist.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-sheepshearer.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-witchpotion.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-romeojuliet.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-piratetreasure.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-ernestchicken.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-impcatcher.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-princeali.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-goblindiplo.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-doric.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-restlessghost.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-shieldarrav.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-vampireslayer.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-demonslayer.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-blackknight.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-knightsword.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-dragonslayer.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-murdermystery.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-gertrudescat.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-druidicritual.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-sheepherder.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-monksfriend.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-biohazard.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-observatory.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-dwarfcannon.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-fishingcontest.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-plaguecity.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-hazeel.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-clocktower.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-merlincrystal.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-seaslug.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-treegnome.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-digsite.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-junglepotion.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-witchhouse.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-tribaltotem.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-touristtrap.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-chompy.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-waterfall.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-holygrail.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-lostcity.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-watchtower.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-templeikov.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-hero.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-legends.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-scorpioncatcher.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-fightarena.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-grandtree.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-shilovillage.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-undergroundpass.html',
    // 'http://www.runescape.com/aff/runescape/rs2/members/quests/rs2quest-familycrest.html',

    // 'http://news.runescape.com/aff/runescape/csnewsindex.cgi',
    // 'http://news.runescape.com/aff/runescape/csnewsindex.cgi?page=1',

    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2fighting.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2weapons.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2pk.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2armour.html',
    // 'http://www.runescape.com/aff/runescape/rs2/skills/rs2duel.html',

    // 'http://www.runescape.com/aff/runescape/serverlist.cgi',
    // 'http://www.runescape.com/aff/runescape/client.cgi',
    // 'http://ul2.runescape.com/rs2.cgi',
    // 'http://www.runescape.com/aff/runescape/client.cgi?world=2&plugin=-1&lores=0&rand=19096516',

    'http://www.runescape.com/aff/runescape/rs2/members/credits.html'
];

// urls.push('http://news.runescape.com/aff/runescape/news.cgi?page=0');
// urls.push('http://news.runescape.com/aff/runescape/news.cgi?cat=0&page=2');
// urls.push('http://news.runescape.com/aff/runescape/news.cgi?cat=1');
// urls.push('http://news.runescape.com/aff/runescape/news.cgi?cat=1&page=4');
// for (let i = 1; i <= 242; i++) {
//     urls.push('http://news.runescape.com/aff/runescape/newsitem.cgi?id=' + i);
// }

// urls.push('http://hiscore.runescape.com/aff/runescape/hiscores.html'),
// urls.push('http://hiscore.runescape.com/aff/runescape/hiscorerank.cgi');
// urls.push('http://hiscore.runescape.com/aff/runescape/hiscorepersonal.cgi?username=zezima');
// urls.push('http://hiscore.runescape.com/aff/runescape/hiscoreuser.cgi?username=zezima&category=1');
// for (let i = 0; i <= 21; i++) {
//     urls.push(`http://hiscore.runescape.com/aff/runescape/hiscorerank.cgi?category=${i}&rank=-1`);
// }

// urls.push('http://poll.runescape.com/aff/runescape/index.html');
// for (let i = 10; i <= 19; i++) {
//     urls.push(`http://poll.runescape.com/aff/runescape/results.cgi?pollid=${i}`);
// }

// urls.push('http://www.runescape.com/aff/runescape/varrock/letters/lettersindex.html');
// for (let i = 1; i <= 19; i++) {
//     urls.push('http://www.runescape.com/aff/runescape/varrock/letters/letters' + i + '.html');
// }

// for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
//     urls.push(`http://www.runescape.com/aff/runescape/varrock/bestiary/${String.fromCharCode(i)}.html`);
// }

// urls.push('http://www.runescape.com/aff/runescape/varrock/tales/talesindex.html');
// for (let i = 1; i <= 11; i++) {
//     urls.push('http://www.runescape.com/aff/runescape/varrock/tales/tale' + i + '.html');
// }

for (let i = 0; i < urls.length; i++) {
    try {
        let filename = urls[i].split('/').pop().replace(/[^a-z0-9]/gi, '_').toLowerCase().replaceAll('_html', '');
        if (fs.existsSync(`dump/www/${filename}.html`)) {
            continue;
        }

        let url = 'https://web.archive.org/web/20040531id_/' + urls[i];
        console.log('downloading', filename);
        let content = await download(url);
        await sleep(50);
        console.log('saved from', content.request.path);
        fs.writeFileSync(`dump/www/${filename}.html`, content.data);
    } catch (err) {
        if (err.response) {
            console.log('Failed to download ' + urls[i], err.response.status);
        } else {
            console.log('Failed to download ' + urls[i], err);
        }
    }
}
