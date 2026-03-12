import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixExpensePaymentTypeFk1765920810000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE expenses DROP CONSTRAINT fk_expense_payment_type;
    `);

    await queryRunner.query(`
      ALTER TABLE expenses
        ADD CONSTRAINT fk_expense_payment_method
        FOREIGN KEY (payment_type_id) REFERENCES payment_methods(id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE expenses DROP CONSTRAINT fk_expense_payment_method;
    `);

    await queryRunner.query(`
      ALTER TABLE expenses
        ADD CONSTRAINT fk_expense_payment_type
        FOREIGN KEY (payment_type_id) REFERENCES payment_types(id);
    `);
  }
}
