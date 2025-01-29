import 'chromedriver';
import * as proxyChain from 'proxy-chain';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getbasePath, Logger, readFileSyncJson, sleepFct, writeFileSyncJson} from '../utils';
import puppeteer from 'puppeteer';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import { Browser, Page } from 'puppeteer';
import { Utils } from './utils';

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

export type BotConfig = {
    botId: string,
    region: string
    browserType: BrowserType
    resolution: string,
    timezone: string,
    webglParams: string,
    hardwareConcurrency: number,
    deviceMemory: number,
    platform: string,
    language: string,
    userAgent: string,
    forceDevice: number // 0-99
    urlCookies: string;
    pathCookies: string;
};
// puppeteer.use(StealthPlugin());
dotenv.config({path: getbasePath('.env')}); 
const basePath = getbasePath('shared/puppeter-config');
const proxyHost = process.env.PROXY_HOST;// Remplacez par l'adresse de votre proxy
const proxyPort = process.env.PROXY_PORT; // Remplacez par le port de votre proxy
const proxyUsername = process.env.PROXY_USERNAME; // Votre nom d'utilisateur proxy
const proxyPassword = process.env.PROXY_PASSWORD; // Votre mot de passe proxy
const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;

export class BrowserLib {
    public botId: string;
    public botConfig: BotConfig;
    public localProxyServer: proxyChain.Server | null = null;
    public browser: Browser;

    constructor(browser: Browser) {
        this.browser = browser;
    }

    static async build(headless = true): Promise<BrowserLib> {
        try {
            console.log('Building browser');
            return await this.startBrowserWithProxyChain(headless);
        } catch (error) {
            Logger.error(error, 'Error building browser');
            throw error;
        }
    }

    static async startBrowserWithProxyChain(headless): Promise<BrowserLib> {
        console.log('STEP 1');
        const botConfig = await readFileSyncJson(path.join(basePath, 'botConfig.json')) as BotConfig;
        console.log('STEP 2');
        // puppeteer.use(StealthPlugin());
        console.log('STEP 3');
        const oldProxyUrl = proxyUrl;
    
        // Créer une nouvelle URL de proxy sans identifiants dans l'URL
        console.log(oldProxyUrl);
        console.log(getbasePath('.env'));
        const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
        console.log('STEP 4');
        process.env.TZ = botConfig.timezone;
        console.log(__dirname);
        // puppeteer.use(StealthPlugin());
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
                // `--lang=en-US`, // Définit la langue principale
                // `--accept-lang=en-US,en`, // En-tête Accept-Language
                '--disable-blink-features=AutomationControlled', 
                "--arc-disable-locale-sync",
                `--window-size=${botConfig.resolution}`,
                `port=${proxyPort}`,
                `--disable-extensions-except=${path.resolve(__dirname, 'extension/WebRTC_Control')}`,
                `--load-extension=${path.resolve(__dirname, 'extension/WebRTC_Control')}`,
                '--disable-blink-features',
            ],
        });
        console.log('STEP 5');
        return new BrowserLib(browser);
    }

    public async fixDetectBot(page: Page): Promise<void> {
        await page.evaluateOnNewDocument(() => {
            // Supprimer des propriétés détectables
            delete window.dummyFn;
            delete window.__proto__.Runtime;
            delete window.dummyExposedFn;
          
            // Masquer navigator.webdriver
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator.connection, 'rtt', { get: () => 50 });
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
            // 1. Supprimer Runtime.enable leak

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
          
        //   await page.setUserAgent(
        //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
        //   );
          
        //   await page.setRequestInterception(true);
        //   page.on('request', (request) => {
        //     if (request.url().includes('detections-json')) {
        //       return request.abort();
        //     }
        //     request.continue();
        //   });
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
    }
}
