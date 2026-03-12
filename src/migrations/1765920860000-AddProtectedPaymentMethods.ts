import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProtectedPaymentMethods1765920860000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE payment_methods
        ADD COLUMN IF NOT EXISTS is_protected BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await queryRunner.query(`
      INSERT INTO payment_methods (user_id, name, type, is_protected)
      VALUES
        (0, 'PIX', 'pix', TRUE),
        (0, 'Débito', 'debit_card', TRUE)
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM payment_methods WHERE is_protected = TRUE`);
    await queryRunner.query(`ALTER TABLE payment_methods DROP COLUMN IF EXISTS is_protected`);
  }
}
