import path from 'path';
import fs from 'fs';
import { Browser, ElementHandle, Page } from 'puppeteer';
import crypto from 'crypto';
import { Logger } from './../utils';

export class Utils {

    static async sleepRandom(minMs = 1000, maxMs = 5000, debug = false): Promise<void> {
        try {
            if (minMs > maxMs) {
                throw new Error("minMs cannot be greater than maxMs.");
            }
            const delay = Math.random() * (maxMs - minMs) + minMs;
            if (debug) {
                const stack = new Error().stack;
                if (stack) {
                    const stackLines = stack.split('\n');
                    if (stackLines.length > 2) {
                        Logger.info(`Called by: ${stackLines[2].trim()}`);
                    }
                }
            }
            return new Promise(resolve => setTimeout(resolve, delay));
        } catch (err) {
            Logger.error(err, " [Utils SleepRandom] -");
            throw err;
        }
    }

    static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    static randomDelay(minMs = 1000, maxMs = 5000): number {
        if (minMs > maxMs) {
            throw new Error("minMs cannot be greater than maxMs.");
        }
        return Math.round(Math.random() * (maxMs - minMs) + minMs);
    }
    
    static readFileSyncJson(filePath: string, fileInitContent: object = {}): object {
        try {
            let fileContent = '';
            filePath = path.resolve(__dirname, filePath);
            if (fs.existsSync(filePath)) {
                fileContent = fs.readFileSync(filePath, 'utf8');
            } else {
                console.log("File not found, creating new file");
                fs.writeFileSync(filePath, JSON.stringify(fileInitContent, null, 2), 'utf8');  
                fileContent = fs.readFileSync(filePath, 'utf8');
            }
            return JSON.parse(fileContent);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    
    static writeFileSyncJson(filePath: string, data: object | string): void {
        try {
            fs.writeFileSync(path.resolve(__dirname, filePath), JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            Logger.error(err, " [Utils WriteFileSyncJson] -");
            throw err;
        }
    }

    static appendFileSyncJson(filePath: string, data: string): void {
        try {
            fs.appendFileSync(path.resolve(__dirname, filePath), data, 'utf8');
        } catch (err) {
            Logger.error(err, " [Utils AppendFileSyncJson] -");
            throw err;
        }
    }

    static async humanClick(page: Page, target: string | ElementHandle): Promise<void> {
        let elementHandle = target;

        if (typeof target === 'string') {
            elementHandle = await page.$(target);
            if (!elementHandle) {
                throw new Error(`Element not found for selector: ${target}`);
            }
        }

        try {
            elementHandle = elementHandle as ElementHandle;
            const rect = await elementHandle.boundingBox();
            if (!rect) throw new Error("ElementHandle is not visible or does not exist.");

            const x = rect.x + Math.random() * rect.width;
            const y = rect.y + Math.random() * rect.height;
            
            await page.mouse.move(x, y, { steps: Utils.randomDelay(7, 25) });
            await Utils.sleepRandom(1000, 1500);
            // await page.mouse.click(x, y, { delay: Utils.randomDelay(100, 200), count: 1 });
            await elementHandle.click({ delay: Utils.randomDelay(100, 200) });
        } catch (err) {
            // Logger.error(err, " [Utils HumanClick] -");
            await Utils.sleepRandom(100, 200);
            throw err;
        }
    }

    static async humanMouseMoveClick(page: Page, target: string | ElementHandle): Promise<void> {
        let elementHandle = target;

        if (typeof target === 'string') {
            elementHandle = await page.$(target);
            if (!elementHandle) {
                throw new Error(`Element not found for selector: ${target}`);
            }
        }

        try {
            elementHandle = elementHandle as ElementHandle;
            const rect = await elementHandle.boundingBox();
            if (!rect) throw new Error("ElementHandle is not visible or does not exist.");

            const x = rect.x + Math.random() * rect.width;
            const y = rect.y + Math.random() * rect.height;
            
            await page.mouse.move(x, y, { steps: Utils.randomDelay(7, 25) });
            await Utils.sleepRandom(1000, 1500);
            await elementHandle.click({ delay: Utils.randomDelay(100, 200) });
        } catch (err) {
            // Logger.error(err, " [Utils HumanClick] -");
            await Utils.sleepRandom(100, 200);
            throw err;
        }
    }

    static async mouseMove(page: Page, target: string | ElementHandle): Promise<void> {
        let elementHandle = target;

        if (typeof target === 'string') {
            elementHandle = await page.$(target);
            if (!elementHandle) {
                throw new Error(`Element not found for selector: ${target}`);
            }
        }

        try {
            elementHandle = elementHandle as ElementHandle;
            const rect = await elementHandle.boundingBox();
            if (!rect) throw new Error("ElementHandle is not visible or does not exist.");

            const x = rect.x + Math.random() * rect.width;
            const y = rect.y + Math.random() * rect.height;
            
            await page.mouse.move(x, y);
        } catch (err) {
            // Logger.error(err, " [Utils MouseMove] -");
            await Utils.sleepRandom(100, 200);
            throw err;
        }
    }

    static async humanScroll(page: Page, distance: number, totalTime: number, direction: 'up' | 'down') {
        try {
            // Calculer le nombre d'étapes nécessaires et le délai par étape
            const stepDistance = distance / Math.ceil(totalTime / 100); // Diviser la distance totale par le nombre d'étapes basées sur le temps
            const steps = Math.ceil(distance / stepDistance); // Calculer le nombre d'étapes
            const averageDelayPerStep = totalTime / steps; // Temps moyen par étape

            for (let i = 0; i < steps; i++) {
                // Vérifier les limites du document avant de faire défiler
                const { scrollPosition, documentHeight, windowHeight } = await page.evaluate(() => ({
                    scrollPosition: window.scrollY,
                    documentHeight: document.body.scrollHeight,
                    windowHeight: window.innerHeight,
                }));

                if (direction === 'down' && (scrollPosition + windowHeight) >= documentHeight) {
                    break; // Ne pas défiler au-delà du bas du document
                } else if (direction === 'up' && scrollPosition <= 0) {
                    break; // Ne pas défiler au-delà du haut du document
                }

                // Défilement dans la direction spécifiée
                const deltaY = direction === 'down' ? stepDistance : -stepDistance;
                const userAgent = await page.browser().userAgent();
                const isFirefox = userAgent.includes('Firefox');
                if (isFirefox) {
                    await page.evaluate((deltaY) => {
                        window.scrollBy(0, deltaY);
                    }, deltaY);
                }
                else {
                    await page.mouse.wheel({ deltaY });
                }

                // Attendre un délai aléatoire autour du temps moyen par étape pour rendre le défilement plus humain
                const randomDelay = averageDelayPerStep * (0.8 + Math.random() * 0.4);
                await new Promise(resolve => setTimeout(resolve, randomDelay));
            }
        } catch (err) {
            // Logger.error(err, " [Utils HumanScroll] -");
            await Utils.sleepRandom(100, 200);
            throw err;
        }
    }

    static async scrollToElementHandle(page: Page, elementHandle: ElementHandle, totalTime: number) {
        try {
            // Obtenir les informations nécessaires avant de commencer à défiler
            const { targetPosition } = await elementHandle.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return {
                    targetPosition: rect.top - window.innerHeight / 2  // Centrer l'élément dans la fenêtre
                };
            });
            // Si l'élément est déjà visible ou très proche de la vue, pas besoin de défiler
            if (Math.abs(targetPosition) < 10) {
                return;
            }

            // Calculer les paramètres de défilement
            const steps = Math.ceil(totalTime / 100);
            const stepDelay = totalTime / steps;
            const stepDistance = targetPosition / steps;

            const userAgent = await page.browser().userAgent();
            const isFirefox = userAgent.includes('Firefox');

            if (isFirefox) {
                // Défilement progressif pour Firefox
                for (let i = 0; i < steps; i++) {
                    await elementHandle.evaluate((el, stepDistance) => {
                        window.scrollBy(0, stepDistance);
                    }, stepDistance);
                    await Utils.sleep(stepDelay);
                }
            } else {
                // Défilement progressif pour Chrome
                for (let i = 0; i < steps; i++) {
                    await page.mouse.wheel({ deltaY: stepDistance });
                    await Utils.sleep(stepDelay);
                }
            }

            // S'assurer que l'élément est dans la vue
            await elementHandle.evaluate(el => el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" }));
        } catch (err) {
            await Utils.sleepRandom(100, 200);
            throw err;
        }
       
    }

    static async humanType(page: Page, selector: string, message: string, elementHandle: ElementHandle<HTMLDivElement> = null, noClick = false): Promise<void> {
        try {
            const text = message;
            if (noClick === false) {
                if (elementHandle === null) {
                    await page.waitForSelector(selector);
                    await Utils.humanClick(page, selector);
                } else {
                    await elementHandle.waitForSelector(selector);
                    await Utils.humanClick(page, elementHandle);
                }
            }
           
            for (const char of text ) {
                if (char === '\n') {
                    await page.keyboard.down('Shift');
                    await this.sleepRandom(10, 30);

                    await page.keyboard.press('Enter', { delay: Utils.randomDelay(10, 30) });
                    await this.sleepRandom(10, 30);

                    await page.keyboard.up('Shift');
                    await this.sleepRandom(10, 30);
                } else {
                    await page.keyboard.type(char, { delay: Utils.randomDelay(10, 30) });
                }
                await this.sleepRandom(10, 20);
            }

        } catch (err) {
            Logger.error(err);
            throw err;
        }
    }

    static timeToCheck(dateTimeString:string, minutes = 10, hours = 0): boolean {
        const lastCheckTime = new Date(dateTimeString);
        const timeAgo = new Date(Date.now() - (hours * 60 * 60 * 1000 + minutes * 60 * 1000));
        return lastCheckTime <= timeAgo;
    }

    static getDateInPast(minutes = 0, hours = 0, days = 0): string {
        return new Date(Date.now() - (hours * 60 * 60 * 1000 + minutes * 60 * 1000 + days * 24 * 60 * 60 * 1000)).toISOString();
    }

    static getDateInFuture(minutes = 0, hours = 0, days = 0): string {
        return new Date(Date.now() + (hours * 60 * 60 * 1000 + minutes * 60 * 1000 + days * 24 * 60 * 60 * 1000)).toISOString();
    }

    static scriptString(stringToScript, lowerCase = true): string {
        if (lowerCase) {
            stringToScript = stringToScript.toLowerCase();
        }

        stringToScript = crypto.createHash('sha256').update(stringToScript).digest('hex');
        return stringToScript;
    }

    /**
     * Selects a tab that contains the specified domain in its URL.
     * @param {puppeteer.Browser} browser - The Puppeteer Browser instance.
     * @param {string} targetDomain - The domain to look for within the URL.
     * @returns {Promise<puppeteer.Page>} - The page that contains the domain in its URL, or null if not found.
     */
    static async selectTabByDomain(browser: Browser, targetDomain: string, goToUrl = null): Promise<Page | null> {
        const pages = await browser.pages();  // Obtient toutes les pages ouvertes (onglets)
        for (const page of pages) {
            const pageUrl = page.url();  // Obtient l'URL de l'onglet courant
            if (pageUrl.includes(targetDomain)) {  // Vérifie si l'URL contient le domaine spécifié
                await page.bringToFront();  // Amène l'onglet au premier plan si le domaine est trouvé
                await Utils.sleepRandom(1000, 2000);
                if (goToUrl !== null) {
                    await page.goto(goToUrl, {
                        waitUntil: 'domcontentloaded',
                    });
                    await Utils.sleepRandom(2000, 5000);
                }
                return page;  // Retourne l'objet Page correspondant
            }
        }

        if (goToUrl !== null) {
            const page = await browser.newPage();
            await page.goto(goToUrl, {
                waitUntil: 'domcontentloaded',
            });
            await Utils.sleepRandom(2000, 5000);
            return page;

        }
        return null;  // Retourne null si aucun onglet correspondant n'est trouvé
    }

    static randomEnum<T>(enumObj: T): T[keyof T] {
        const enumValues = Object.values(enumObj) as Array<T[keyof T]>;
        const randomIndex = Math.floor(Math.random() * enumValues.length);
        return enumValues[randomIndex];
    }

    static randomInt(min: number, max: number): number {
        if (min > max) {
            throw new Error("minMs cannot be greater than maxMs.");
        }
        let numberArray = Array.from({ length: max - min + 1 }, (_, i) => i + min);
        numberArray = Utils.shuffleArray(numberArray);
        return numberArray[Math.floor(Math.random() * numberArray.length)];
    }

    static randomChance(percentage) {
        const randomInt = Utils.randomInt(0, 100); // Nombre entre 0 et 99
        return randomInt < percentage; // Retourne true si randomInt est inférieur au pourcentage
    }

    static shuffleArray(arr: any[]): any[] {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Échange les éléments
        }
        return arr;
    }

    static getRandomArrayElement(arr: any[]): any {
        return Utils.shuffleArray(arr)[0];
    }

    static async removeWindows(page: Page, close = false): Promise<void> {
        await Utils.sleepRandom(1000, 2000);
        await page.keyboard.press('Escape', {delay: Utils.randomDelay(50, 100)});
        await Utils.sleepRandom(500, 1000);
        await page.keyboard.press('Enter', {delay: Utils.randomDelay(50, 100)});
        await Utils.sleepRandom(500, 1000);

        if (close === true) {
            await page.close();
        }
    }
}