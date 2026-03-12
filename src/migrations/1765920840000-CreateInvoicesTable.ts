import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoicesTable1765920840000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE invoice_status_enum AS ENUM ('pending', 'partial', 'paid')
    `);

    await queryRunner.query(`
      CREATE TABLE invoices (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        payment_method_id INT NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
        reference_date DATE NOT NULL,
        due_date DATE,
        paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        status invoice_status_enum NOT NULL DEFAULT 'pending',
        UNIQUE (user_id, payment_method_id, reference_date)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS invoices`);
    await queryRunner.query(`DROP TYPE IF EXISTS invoice_status_enum`);
  }
}
