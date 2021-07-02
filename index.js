const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const cliProgress = require('cli-progress');
const converter = require('convert-array-to-csv');

(async () => {
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let urls = fs.readFileSync('urls.txt', 'utf8').split('\n');
    const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless']
    });
    const optionsDesktop = {
        onlyCategories: ['performance'],
        port: chrome.port,
        preset: 'desktop'
    };
    const optionsMobile = {
        onlyCategories: ['performance'],
        port: chrome.port,
        formFactor: 'mobile'
    };
    let csvResult = [];
    csvResult.push(['url', 'desktop', 'mobile']);
    bar.start(urls.length, 1);

    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        let resultDesktop = await lighthouse(url, optionsDesktop);
        let resultMobile = await lighthouse(url, optionsMobile);
        csvResult.push([url, resultDesktop.lhr.categories.performance.score * 100, resultMobile.lhr.categories.performance.score * 100]);
        bar.increment();
    };

    const csvFromArrayOfObjects = converter.convertArrayToCSV(csvResult);

    fs.writeFileSync('result.csv', csvFromArrayOfObjects);
    bar.stop();
    console.log('Result is wrote in the "result.csv" file');

    await chrome.kill();
})();