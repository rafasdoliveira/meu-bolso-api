import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentMethodsTable1765920800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE payment_method_type_enum AS ENUM ('credit_card', 'debit_card', 'pix', 'cash');
    `);

    await queryRunner.query(`
      CREATE TABLE payment_methods (
        id               SERIAL PRIMARY KEY,
        user_id          INTEGER NOT NULL,
        name             VARCHAR NOT NULL,
        type             payment_method_type_enum NOT NULL,
        brand            VARCHAR,
        last_four_digits VARCHAR(4)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS payment_methods;`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_method_type_enum;`);
  }
}
