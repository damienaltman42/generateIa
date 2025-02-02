import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('DB_HOST', configService.get('DB_HOST')),
  port: configService.get('DB_PORT', parseInt(configService.get<string>('DB_PORT'), 10),),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});