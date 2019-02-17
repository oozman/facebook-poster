const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('post', 'Post to Facebook')
    .alias('u', 'username')
    .describe('u', 'Your Facebook username/email')
    .alias('p', 'password')
    .describe('p', 'Your Facebook password')
    .alias('m', 'msg')
    .describe('m', 'Your post message')
    .example('$0 post -u your@email.com -p secret -m \'You are awesome!\'', 'Create and post a message to your Facebook.')

    .demandOption(['u', 'p', 'm'])
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2019')
    .argv;

const puppeteer = require("puppeteer");
const colors = require("colors");

(async () => {
    try {

        // User-Agent (mobile)
        const iphone6UserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25";

        // Credentials and post info.
        const username = argv.username;
        const password = argv.password;
        const postMsg = argv.msg;

        // Selectors.
        const usernameSelector = "#m_login_email";
        const passwordSelector = "#m_login_password";
        const loginButtonSelector = "button[value='Log In']";
        const composerSelector = "#MComposer";
        const composerInputSelector = ".composerInput";
        const composerPostButtonSelector = "button[value='Post']";

        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: {
                width: 375,
                height: 667
            }
        });
        const page = await browser.newPage();
        await page.setUserAgent(iphone6UserAgent);

        console.log("Going to facebook.com...".yellow);

        // Force facebook to use EN language.
        await page.goto("https://m.facebook.com/a/language.php?l=en_US&lref=https%3A%2F%2Fm.facebook.com%2F%3Frefsrc%3Dhttps%253A%252F%252Fm.facebook.com%252F&gfid=AQDntHC8XrYSffOo&refid=8");

        console.log("Typing your credentials...".yellow);
        await page.type(usernameSelector, username, {delay: 100}); // Types slower, like a user
        await page.type(passwordSelector, password, {delay: 100}); // Types slower, like a user

        console.log("Trying to login...".yellow);
        await Promise.all([
            page.waitForNavigation(),
            page.click(loginButtonSelector, {delay: 100}),
        ]);

        console.log("You are now logged in.".yellow);
        await page.goto("https://m.facebook.com");

        console.log("Creating a new post...".yellow);
        await page.click(composerSelector, {delay: 2000});

        await delay(3);

        console.log("Typing your post...".yellow);
        await page.click("#composer-main-view-id", {delay: 1000});
        await page.type(composerInputSelector, postMsg, {delay: 100});

        console.log("Posting your post...".yellow);
        await Promise.all([
            page.waitForNavigation(),
            page.click(composerPostButtonSelector, {delay: 100}),
        ]);

        await browser.close();

        console.log(colors.bgGreen("Hooray! You have posted a message.".black));
    } catch (error) {
        console.log(colors.bgRed("Oops unable to post a message.".white));
        console.log("Error: " + error.message.red);

        await browser.close();
    }
})();

/**
 * Delay in seconds.
 *
 * @param seconds
 * @returns {Promise<*>}
 */
async function delay(seconds) {

    return new Promise((resolve, reject) => {

        setTimeout(() => {
            resolve("ok");
        }, seconds * 1000);
    });
}