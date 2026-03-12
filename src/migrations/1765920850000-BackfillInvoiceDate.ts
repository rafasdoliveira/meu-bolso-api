import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillInvoiceDate1765920850000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE expenses e
      SET invoice_date = CASE
        WHEN EXTRACT(DAY FROM e.date) < pm.closing_day
          THEN DATE_TRUNC('month', e.date)::DATE
        ELSE (DATE_TRUNC('month', e.date) + INTERVAL '1 month')::DATE
      END
      FROM payment_methods pm
      WHERE e.payment_type_id = pm.id
        AND pm.type = 'credit_card'
        AND pm.closing_day IS NOT NULL
        AND e.invoice_date IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverts only expenses that were backfilled (not manually set ones)
    // Since we can't distinguish, this is a best-effort rollback
    await queryRunner.query(`
      UPDATE expenses e
      SET invoice_date = NULL
      FROM payment_methods pm
      WHERE e.payment_type_id = pm.id
        AND pm.type = 'credit_card'
        AND pm.closing_day IS NOT NULL
    `);
  }
}
