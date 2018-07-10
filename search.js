const https = require('https');
https.globalAgent.options.secureProtocol = 'TLSv1_2_method';
const superagent = require('superagent-use')(require('superagent'))
superagent.use(require('superagent-verbose-errors'))
const cheerio = require('cheerio');

const baidu = "https://www.baidu.com/s?wd=";
const sogou = "https://www.sogou.com/web?query=";

function search(key) {
    const fullUrl = baidu + key;
    return superagent
        .get(fullUrl)
        .on('error', error => console.log(error))
        .then(response => {
            return parsehtml(response.body);
        });
}

function parsehtml(htmlBody) {
    const result = [];
    const $ = cheerio.load(htmlBody);
    $('a').forEach(a => {
        const hyperlink = a.prop('href');
        console.info(hyperlink);
        result.push(hyperlink);
    });

    return result;
}

module.exports=search;