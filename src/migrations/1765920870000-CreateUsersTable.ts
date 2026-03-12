import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1765920870000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adapt the existing users table to the expected schema
    await queryRunner.query(`ALTER TABLE users RENAME COLUMN usuario TO name`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS role`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS person_id`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

    await queryRunner.query(`
      CREATE TABLE password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(64) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS password_reset_tokens`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS created_at`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS person_id INT`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR`);
    await queryRunner.query(`ALTER TABLE users RENAME COLUMN name TO usuario`);
  }
}
