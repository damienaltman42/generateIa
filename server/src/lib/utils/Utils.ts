import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger/Logger';
import * as fspromise from "fs/promises"; // Utiliser directement fs/promises

export function readFileSyncJson(filePath: string, fileInitContent: object = {}): object {
    try {
        let fileContent = '';
        filePath = path.resolve(__dirname, filePath);
        if (fs.existsSync(filePath)) {
            fileContent = fs.readFileSync(filePath, 'utf8');
        } else {
            fs.writeFileSync(filePath, JSON.stringify(fileInitContent, null, 2), 'utf8');  
            fileContent = fs.readFileSync(filePath, 'utf8');
        }
        return JSON.parse(fileContent);
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export function readFileSyncTxt(filePath: string, fileInitContent: object = {}): string {
    try {
        let fileContent = '';
        filePath = path.resolve(__dirname, filePath);
        if (fs.existsSync(filePath)) {
            fileContent = fs.readFileSync(filePath, 'utf8');
        } else {
            fs.writeFileSync(filePath, JSON.stringify(fileInitContent, null, 2), 'utf8');  
            fileContent = fs.readFileSync(filePath, 'utf8');
        }
        return fileContent;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export function writeFileSyncJson(filePath: string, data: object | string): void {
    try {
        if (typeof data === 'object') {
            data = JSON.stringify(data, null, 2);
        }
        fs.writeFileSync(path.resolve(__dirname, filePath), data, 'utf8');
    } catch (err) {
        Logger.error(err, " [Utils WriteFileSyncJson] -");
        throw err;
    }
}

export async function appendFileSyncJson(filePath: string, data: string): Promise<void> {
    try {
        await fs.appendFileSync(path.resolve(__dirname, filePath), data, 'utf8');
    } catch (err) {
        // Logger.error(err, " [Utils AppendFileSyncJson] -");
        console.log(err);
        throw err;
    }
}



export async function sleepFct(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function shuffleArray(arr: any[]): any[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Échange les éléments
    }
    return arr;
}

export function getRandomArrayElement(arr: any[]): any {
    return shuffleArray(arr)[0];
}

export function randomInt(min: number, max: number): number {
    if (min > max) {
        throw new Error("minMs cannot be greater than maxMs.");
    }
    let numberArray = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    numberArray = shuffleArray(numberArray);
    return numberArray[Math.floor(Math.random() * numberArray.length)];
}

export function randomChance(percentage) {
    const random = randomInt(0, 100); // Nombre entre 0 et 99
    sleepFct(50);
    return random < percentage; // Retourne true si randomInt est inférieur au pourcentage
}

export function extractDataFromBalise(balise: string, text: string): string | null {
    const baliseMatch = balise.match(/\$(?:begin|end):math:display\$(.*?)\\?\$/);
    const actualBalise = baliseMatch ? baliseMatch[1] : balise;


    const openingTag = `[${actualBalise}]`;
    const closingTag = `[/${actualBalise}]`;

    const startIndex = text.indexOf(openingTag);
    if (startIndex === -1) {
        return null;
    }

    const contentStart = startIndex + openingTag.length;
    const endIndex = text.indexOf(closingTag, contentStart);
    if (endIndex === -1) {
        return null;
    }

    const content = text.substring(contentStart, endIndex).trim();
    return content;
}

export function normalizeFilename(filename: string): string {
    return filename
        .toLowerCase() // Convertit en minuscules
        .replace(/-+/g, "-") // Remplace les tirets multiples par un seul
        .replace(/[^a-z0-9\-\.]/g, ""); // Supprime tout caractère qui n'est pas alphanumérique, tiret ou point
}

/**
 * Vérifie si au moins deux mots d'un nom donné sont présents dans un chemin.
 */
export function hasTwoMatchingWords(givenFilename: string, originalFilename: string): boolean {
    // Divise le nom donné en mots (séparés par des tirets ou espaces)
    const givenWords = givenFilename.toLowerCase().split(/[-\s]+/);

    // Divise le nom original en mots
    const originalWords = originalFilename.toLowerCase().split(/[-\s]+/);

    // Compte les mots correspondants
    let matchCount = 0;
    // (givenWords > 3) ? 3 : givenWords;
    for (const word of givenWords) {
        if (originalWords.includes(word)) {
            matchCount++;
            if (matchCount >= givenWords.length) return true; // Valide dès que 2 mots correspondent
        }
    }

    return false; // Retourne faux si moins de 2 mots correspondent
}

export async function findFileWithTwoMatchingWords(directory: string, givenFilename: string): Promise<string | null> {
   try {
       // Lire tous les fichiers du répertoire
       const files = await fspromise.readdir(directory);

       // Parcourir les fichiers et vérifier la correspondance
       for (const file of files) {
           if (hasTwoMatchingWords(givenFilename, file)) {
                Logger.info(`Fichier correspondant trouvé : ${file}`);
               return path.join(directory, file); // Retourne le chemin complet si validé
           }
       }
       Logger.error(`Aucun fichier correspondant à ${givenFilename} trouvé dans ${directory}`);
       return null; // Aucun fichier correspondant
   } catch (error) {
       console.error("Erreur lors de la recherche :", error);
       return null;
   }
}

export function getbasePath(subPath): string {
    const isDist = process.cwd().includes('dist');
    if (isDist) {
        return path.join(process.cwd(), `../../${subPath}`); // En production, remonte d'un niveau
    } else {
        return path.join(process.cwd(), subPath);
    }
}
