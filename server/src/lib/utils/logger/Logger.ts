import { appendFileSyncJson, getbasePath } from "../";
import * as path from 'path';

export class Logger {
    
    
    static info(message, additionalInfo?) {
        if (message instanceof Error) {
            message = message.stack + ' | ' + message.message + ' | ' + message.name;
        }
        this.writeLog('INFO', message, additionalInfo);
    }

    static warning(message, additionalInfo?) {
        if (message instanceof Error) {
            message = message.stack + ' | ' + message.message + ' | ' + message.name;
        }
        this.writeLog('WARNING', message, additionalInfo);
    }

    static error(message, additionalInfo?) {
        if (message instanceof Error) {
            message = message.stack + ' | ' + message.message + ' | ' + message.name;
        }
        this.writeLog('ERROR', message, additionalInfo);
    }

    static writeLog(level, message, additionalInfo?) {
        const timestamp = new Date().toLocaleString('fr-FR');
        let logMessage = `[${timestamp}] [${level}] ${typeof message === 'object' ? JSON.stringify(message) : message}\n`;
        if (additionalInfo) {
            logMessage += ` | Additional Info: ${typeof additionalInfo === 'object' ? JSON.stringify(additionalInfo) : additionalInfo}
`;
        }
        let logFilePath = getbasePath('shared/logs');
        logFilePath = path.join(logFilePath, `${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.log`);
        appendFileSyncJson(logFilePath, logMessage);
        console.log(logMessage);
    }
}