import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpensesTable1741500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE expense_status_enum AS ENUM ('pending', 'paid');
    `);

    await queryRunner.query(`
      CREATE TABLE expenses (
        id                  SERIAL PRIMARY KEY,
        user_id             INTEGER NOT NULL,
        date                DATE NOT NULL,
        description         VARCHAR NOT NULL,
        amount              NUMERIC(10, 2) NOT NULL,
        installment_current INTEGER,
        installment_total   INTEGER,
        item                VARCHAR,
        notes               TEXT,
        payment_type_id     INTEGER NOT NULL,
        status              expense_status_enum NOT NULL DEFAULT 'pending',
        CONSTRAINT fk_expense_payment_type
          FOREIGN KEY (payment_type_id)
          REFERENCES payment_types(id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS expenses;`);
    await queryRunner.query(`DROP TYPE IF EXISTS expense_status_enum;`);
  }
}
