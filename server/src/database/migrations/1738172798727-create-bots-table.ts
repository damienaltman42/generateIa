import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBotsTable1738172798727 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'bots',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'name', type: 'varchar', isNullable: false },
                    { name: 'config', type: 'json', isNullable: false }, // Type corrigé pour MySQL
                    { name: 'status', type: 'boolean', default: 'true' }, // true = libre, false = occupé
                    { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('bots');
    }
}