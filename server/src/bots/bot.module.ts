import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bot } from './bot.entity';
import { BotService } from './bot.service';

@Module({
    imports: [TypeOrmModule.forFeature([Bot])], // Associe l'entité `Bot` au module
    providers: [BotService], // Fournit le service `BotService`
    exports: [BotService],   // Permet l'utilisation de `BotService` dans d'autres modules
})
export class BotModule {}