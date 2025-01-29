import { BrowserLib } from './browserLib';
import { sleepFct } from './../utils';

jest.setTimeout(5000000);
//25594378AL gege518750
describe('Browser', () => {
    let browser: BrowserLib;
   
    beforeAll(async () => {
        browser = await BrowserLib.build(false);
    });

    afterAll(async () => {
        if (browser) {
            await browser.browser.close();
        }
    });

    test('should be unique', async () => {
        try {
            await browser.goto('https://www.browserscan.net/')
            await sleepFct(20000000);
        } catch (error) {
            console.error('Error posting tweet', error);
        }
    });
});

