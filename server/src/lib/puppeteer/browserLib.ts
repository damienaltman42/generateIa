import 'chromedriver';
import * as proxyChain from 'proxy-chain';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getbasePath, Logger, randomInt, readFileSyncJson, sleepFct, writeFileSyncJson} from '../utils';
import puppeteer from 'puppeteer';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import { Browser, Page } from 'puppeteer';
import { Utils } from './utils';
import { BotConfig } from 'src/bots/types/bot-config.interface';

declare global {
    interface Navigator {
      getUserMedia?: () => void; // Déclare la méthode optionnelle getUserMedia
      webkitGetUserMedia?: () => void; // Déclare la méthode optionnelle webkitGetUserMedia
    }
}

declare global {
    interface Window {
        dummyFn: () => void;
    }
}

declare global {
    interface Window {
        chrome?: any; // Ajoute la propriété chrome à Window
    }
}

declare global {
    interface Navigator {
        connection?: {
            rtt?: number; // Ajoute la propriété rtt
        };
    }
}

declare global {
    interface Window {
      dummyExposedFn?: () => void; // Déclare la fonction
    }
}

declare global {
    interface Window {
      __proto__?: {
        Runtime?: unknown;
      };
    }
  }

export type ProxyConfig = { 
    host: string,
    port: number, 
    username: string, 
    password: string 
};

export enum BrowserType {
    CHROME = 'chrome',
    FIREFOX = 'firefox'
}

dotenv.config({path: getbasePath('.env')}); 
const basePath = getbasePath('shared/puppeter-config');

export class BrowserLib {
    public botId: string;
    public botConfig: BotConfig;
    public localProxyServer: proxyChain.Server | null = null;
    public browser: Browser;

    constructor(browser: Browser) {
        this.browser = browser;
    }

    static async build(botConfig: BotConfig, headless = true): Promise<BrowserLib> {
        try {
            return await this.startBrowserWithProxyChain(botConfig, headless);
        } catch (error) {
            Logger.error(error, 'Error building browser');
            throw error;
        }
    }

    static async startBrowserWithProxyChain(botConfig: BotConfig, headless): Promise<BrowserLib> {
        const proxyUrl = `http://${botConfig.proxyUsername}:${botConfig.proxyPassword}@${botConfig.proxyHost}:${botConfig.proxyPort}`;
    
        // Créer une nouvelle URL de proxy sans identifiants dans l'URL
        const newProxyUrl = await proxyChain.anonymizeProxy(proxyUrl);
        process.env.TZ = botConfig.timezone;
        const browser = await puppeteer.launch({
            headless: headless,
            args: [
                `--proxy-server=${newProxyUrl}`,
                `--user-agent=${botConfig.userAgent}`,
                `--platform=${botConfig.platform}`,
                "--disable-gpu",
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--enable-clipboard-write",
                "--enable-clipboard-read",
                '--disable-useAutomationExtension',
                "--disable-features=WebRtcHideLocalIpsWithMdns",
                "--arc-disable-locale-sync",
                '--disable-blink-features=AutomationControlled', 
                "--arc-disable-locale-sync",
                `--window-size=${botConfig.resolution}`,
                `port=${botConfig.proxyPort}`,
                `--disable-extensions-except=${path.resolve(__dirname, 'extension/WebRTC_Control')}`,
                `--load-extension=${path.resolve(__dirname, 'extension/WebRTC_Control')}`,
                '--disable-blink-features',
            ],
        });
        return new BrowserLib(browser);
    }

    public async fixDetectBot(page: Page): Promise<void> {
        await page.evaluateOnNewDocument(() => {
            delete window.dummyFn;
            delete window.__proto__.Runtime;
            delete window.dummyExposedFn;
          
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator.connection, 'rtt', { get: () => 50 });
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });

            const cdpHandler = window.__proto__;
            if (cdpHandler && Object.prototype.hasOwnProperty.call(cdpHandler, 'Runtime')) {
                delete cdpHandler.Runtime;
            }
        
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
                configurable: true,
            });
        
            const originalNavigator = { ...navigator };
            delete originalNavigator.webdriver;
            delete originalNavigator.getUserMedia;
            delete originalNavigator.webkitGetUserMedia;
            Object.defineProperty(window, 'navigator', {
                value: originalNavigator,
                configurable: true,
            });
        });
          
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });
    }


    public async goto(url: string): Promise<Page> {
        const page = await this.browser.newPage();
        await page.evaluateOnNewDocument(() => {
            // Masquer webdriver
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
          
            // Supprimer dummyFn
            delete window.dummyFn;
          
            // Empêcher sourceUrl leak
            Object.defineProperty(document, 'getElementById', { value: () => null });
          
            // Définir des propriétés réalistes
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            Object.defineProperty(navigator.connection, 'rtt', { get: () => 50 });
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
          });
          await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
        // await page.evaluateOnNewDocument(() => {
        //     delete window.dummyFn; // Supprime la fonction fictive si elle existe
        //     // Object.defineProperty(navigator, 'language', { value: 'en-US' });
        //     // Object.defineProperty(navigator, 'languages', { value: ['en-US', 'en'] });
        //     // Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
        //     //     value: () => ({ locale: 'en-US' }),
        //     // });
        // });
        await page.goto(url);
        return page;
    }

    async saveCookies(page: Page, filePath: string,  clean = false): Promise<void> {
        filePath = path.join(basePath, filePath)
        if (clean === true) {
            await writeFileSyncJson(filePath, JSON.stringify([]));
        }
        let existingCookies = readFileSyncJson(filePath) as object[];
        const cookies = await page.cookies();
        existingCookies = [...existingCookies, ...cookies];
        await writeFileSyncJson(filePath, JSON.stringify(existingCookies));
        Logger.info('Cookies saved successfully.');
    }

    public async loadCookies(page: Page, url: string, filePath:string): Promise<boolean> {
        try {
            filePath = path.join(basePath, filePath);
            const cookiesString = fs.readFileSync(filePath, 'utf-8');
            try {
                const cookies = JSON.parse(cookiesString);
                await page.setCookie(...cookies);
                await page.goto(url);
                await sleepFct(2000);                
                return true;
            } catch (error) {
                Logger.info(`Error loading cookies: error`);
                Logger.info(error, 'Error loading cookies');
                Utils.sleepRandom(2000000, 5000000);
                throw error;
            }
        } catch (error) {
            Logger.error(error, 'Error loading cookies 2');
            return false;
        }       
    }

    public async close(filePath: string): Promise<void> {
        let i = 0;
        for (const page of await this.browser.pages()) {
            await this.saveCookies(page, filePath, (i === 0) ? true : false);
            await page.close();
            i++;
        }
        await this.browser.close();
        await Utils.sleepRandom(500, 800);
    }

    async takeScreenshot(page: Page, pathString: string): Promise<void> {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // For
            const uuid = randomInt(1, 999999);
            await page.screenshot({ path: path.join(process.cwd(), `${pathString}/screenshot-${timestamp}-${uuid}.png`)});
            Logger.info(`Capture d'écran enregistrée sous 'screenshot-${timestamp}-${uuid}.png' !`);
        } catch (err) {
            Logger.error("Erreur lors de la capture d'écran :", err);
        }
    }
}
