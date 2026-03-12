import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceDateAndClosingDay1765920830000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE payment_methods
        ADD COLUMN IF NOT EXISTS closing_day INT,
        ADD COLUMN IF NOT EXISTS due_day INT
    `);

    await queryRunner.query(`
      ALTER TABLE expenses
        ADD COLUMN IF NOT EXISTS invoice_date DATE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE expenses DROP COLUMN IF EXISTS invoice_date`);
    await queryRunner.query(`ALTER TABLE payment_methods DROP COLUMN IF EXISTS closing_day, DROP COLUMN IF EXISTS due_day`);
  }
}
