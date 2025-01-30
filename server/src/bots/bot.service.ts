import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Bot } from './bot.entity';

@Injectable()
export class BotService {
    constructor(
        @InjectRepository(Bot)
        private readonly botRepository: Repository<Bot>,
        private readonly connection: Connection, // Injecter la connexion pour gérer les transactions
    ) {}

    // Obtenir un bot libre avec verrouillage pour éviter les race conditions
    async getAndLockFreeBot(): Promise<Bot | null> {
        let bot: Bot | null = null;

        await this.connection.transaction(async (manager) => {
            bot = await manager
                .createQueryBuilder(Bot, 'bot')
                .where('bot.status = :status', { status: true }) // Bots libres
                .setLock('pessimistic_write') // Verrou pour éviter l'accès simultané
                .limit(1)
                .getOne();

            if (bot) {
                bot.status = false; // Marquer le bot comme occupé
                await manager.save(bot);
            }
        });

        return bot;
    }

    // Libérer un bot
    async releaseBot(bot: Bot): Promise<void> {
        bot.status = true;
        await this.botRepository.save(bot);
    }

    // Ajouter un bot
    async createBot(name: string, config: Record<string, any>): Promise<Bot> {
        const bot = this.botRepository.create({ name, config, status: true });
        return await this.botRepository.save(bot);
    }
}