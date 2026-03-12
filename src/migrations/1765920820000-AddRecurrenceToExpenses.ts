import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecurrenceToExpenses1765920820000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE expenses
        ADD COLUMN is_recurrent BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN recurrence_end_date DATE,
        ADD COLUMN recurrence_group_id UUID;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE expenses
        DROP COLUMN is_recurrent,
        DROP COLUMN recurrence_end_date,
        DROP COLUMN recurrence_group_id;
    `);
  }
}
