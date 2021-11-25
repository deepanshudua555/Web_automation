// node web_autamation.js --url=https://www.hackerrank.com --config=config.json
// npm install minimist
// npm install puppeteer
let minimist = require("minimist");
let fs = require("fs");
const puppeteer = require("puppeteer");

let args = minimist(process.argv);
let configJson = fs.readFileSync(args.config, "utf-8");
let config = JSON.parse(configJson);

run();

async function run() {
    //start browser 
    let browser = await puppeteer.launch({
        defaultViewport: null,
        args: [
            "--start-maximized"
        ],
        headless: false
    });

    //get a tab
    let pages = await browser.pages();
    let page = pages[0];

    //go to url
    await page.goto(args.url);

    //click on login 1
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    //click on login 2
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    //write username
    await page.waitForSelector("div.ui-tooltip-wrapper>input[name='username']");
    await page.type("div.ui-tooltip-wrapper>input[name='username']", config.userid, { delay: 200 });

    //write username
    await page.waitForSelector("div.ui-tooltip-wrapper>input[name='password']");
    await page.type("div.ui-tooltip-wrapper>input[name='password']", config.password, { delay: 200 });


    //write click login 3
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");


    //write click compete
    await page.waitForSelector("a[href='/contests']");
    await page.click("a[href='/contests']");

    //write click manage contest
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    //find Pages
    await page.waitForSelector("a[data-attr1='Last']");
    let numpages = await page.$eval("a[data-attr1='Last']", function (lastTag) {
        let np = parseInt(lastTag.getAttribute("data-page"));
        return parseInt(np);
    });

    //move through all pages
    for (let i = 0; i < numpages; i++) {
        await handlePage(browser, page);

    }
    // await browser.close();
}

async function handlePage(browser, page) {

    await page.waitForSelector("a.backbone.block-center");
    let curls = await page.$$eval("a.backbone.block-center", function (atags) {
        let iurls = [];
        for (let i = 0; i < atags.length; i++) {
            let url = atags[i].getAttribute("href");
            iurls.push(url);
        }
        return iurls;
    });
    
    for(let i=0; i<curls.length; i++){
        await handleContest(browser, page, curls[i]);
    }

    await page.waitFor(1500);
    await page.waitForSelector("a[data-attr1='Right']");
    await page.click("a[data-attr1='Right']");
}

async function handleContest(browser, page, curls){
    let npage = await browser.newPage();
    await npage.goto(args.url+curls);
    await npage.waitFor(2000);

    await npage.waitForSelector("li[data-tab='moderators']");
    await npage.click("li[data-tab='moderators']");
    
    for(let i=0; i<config.moderators.length; i++){
        await npage.waitForSelector("input#moderator");
        await npage.type("input#moderator", config.moderators[i], {delay:200});
        await npage.keyboard.press("Enter");
        
    }
    await npage.waitFor(2000);
 
    await npage.close();
    await page.waitFor(2000);
}