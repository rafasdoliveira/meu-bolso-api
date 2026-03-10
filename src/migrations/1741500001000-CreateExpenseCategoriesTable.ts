import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpenseCategoriesTable1741500001000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE expense_categories (
        id   SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE expense_subcategories (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR NOT NULL,
        category_id INTEGER NOT NULL,
        CONSTRAINT fk_subcategory_category
          FOREIGN KEY (category_id)
          REFERENCES expense_categories(id)
      );
    `);

    await queryRunner.query(`
      ALTER TABLE expenses
      ADD COLUMN subcategory_id INTEGER,
      ADD CONSTRAINT fk_expense_subcategory
        FOREIGN KEY (subcategory_id)
        REFERENCES expense_subcategories(id);
    `);

    await queryRunner.query(`
      INSERT INTO expense_categories (name) VALUES
        ('Alimentação'),
        ('Compras'),
        ('Educação'),
        ('Entretenimento'),
        ('Generosidade'),
        ('Lazer'),
        ('Moradia'),
        ('Pessoal'),
        ('Profissional'),
        ('Saúde e Bem Estar'),
        ('Transporte'),
        ('Taxas, Impostos e Empréstimos'),
        ('Viagens'),
        ('Sonhos');
    `);

    await queryRunner.query(`
      INSERT INTO expense_subcategories (name, category_id) VALUES
        ('Suplementação',           (SELECT id FROM expense_categories WHERE name = 'Alimentação')),
        ('Delivery',                (SELECT id FROM expense_categories WHERE name = 'Alimentação')),
        ('Supermercado',            (SELECT id FROM expense_categories WHERE name = 'Alimentação')),
        ('Lanches e Refeições',     (SELECT id FROM expense_categories WHERE name = 'Alimentação')),

        ('Roupas',                  (SELECT id FROM expense_categories WHERE name = 'Compras')),
        ('Eletrônicos',             (SELECT id FROM expense_categories WHERE name = 'Compras')),
        ('Presentes',               (SELECT id FROM expense_categories WHERE name = 'Compras')),
        ('Calçados',                (SELECT id FROM expense_categories WHERE name = 'Compras')),

        ('Cursos',                  (SELECT id FROM expense_categories WHERE name = 'Educação')),
        ('Eventos / Workshops',     (SELECT id FROM expense_categories WHERE name = 'Educação')),
        ('Pós Graduação',           (SELECT id FROM expense_categories WHERE name = 'Educação')),
        ('Faculdade',               (SELECT id FROM expense_categories WHERE name = 'Educação')),
        ('Livros',                  (SELECT id FROM expense_categories WHERE name = 'Educação')),
        ('Material Educação',       (SELECT id FROM expense_categories WHERE name = 'Educação')),

        ('Assinaturas',             (SELECT id FROM expense_categories WHERE name = 'Entretenimento')),

        ('Doações',                 (SELECT id FROM expense_categories WHERE name = 'Generosidade')),

        ('Cinema',                  (SELECT id FROM expense_categories WHERE name = 'Lazer')),
        ('Shows',                   (SELECT id FROM expense_categories WHERE name = 'Lazer')),
        ('Jogos',                   (SELECT id FROM expense_categories WHERE name = 'Lazer')),
        ('Atrações',                (SELECT id FROM expense_categories WHERE name = 'Lazer')),

        ('Decoração',               (SELECT id FROM expense_categories WHERE name = 'Moradia')),
        ('Internet Móvel',          (SELECT id FROM expense_categories WHERE name = 'Moradia')),
        ('Utensílios Moradia',      (SELECT id FROM expense_categories WHERE name = 'Moradia')),
        ('Utensílios Cozinha',      (SELECT id FROM expense_categories WHERE name = 'Moradia')),

        ('Cuidados Pessoais',       (SELECT id FROM expense_categories WHERE name = 'Pessoal')),
        ('Cidadania Italiana',      (SELECT id FROM expense_categories WHERE name = 'Pessoal')),
        ('Documentos',              (SELECT id FROM expense_categories WHERE name = 'Pessoal')),
        ('Mídias',                  (SELECT id FROM expense_categories WHERE name = 'Pessoal')),
        ('Tatuagens',               (SELECT id FROM expense_categories WHERE name = 'Pessoal')),

        ('Equipamento Fotografia',  (SELECT id FROM expense_categories WHERE name = 'Profissional')),
        ('ChatGPT',                 (SELECT id FROM expense_categories WHERE name = 'Profissional')),
        ('Home Office',             (SELECT id FROM expense_categories WHERE name = 'Profissional')),

        ('Academia',                (SELECT id FROM expense_categories WHERE name = 'Saúde e Bem Estar')),
        ('Assessoria Esportiva',    (SELECT id FROM expense_categories WHERE name = 'Saúde e Bem Estar')),
        ('Rachas',                  (SELECT id FROM expense_categories WHERE name = 'Saúde e Bem Estar')),
        ('Farmácia',                (SELECT id FROM expense_categories WHERE name = 'Saúde e Bem Estar')),
        ('Plano de Saúde',          (SELECT id FROM expense_categories WHERE name = 'Saúde e Bem Estar')),
        ('Corridas',                (SELECT id FROM expense_categories WHERE name = 'Saúde e Bem Estar')),
        ('Equipamentos Saúde',      (SELECT id FROM expense_categories WHERE name = 'Saúde e Bem Estar')),
        ('Fisioterapia',            (SELECT id FROM expense_categories WHERE name = 'Saúde e Bem Estar')),
        ('Psicólogo',               (SELECT id FROM expense_categories WHERE name = 'Saúde e Bem Estar')),
        ('Nutricionista',           (SELECT id FROM expense_categories WHERE name = 'Saúde e Bem Estar')),

        ('Combustível',             (SELECT id FROM expense_categories WHERE name = 'Transporte')),
        ('Estacionamento',          (SELECT id FROM expense_categories WHERE name = 'Transporte')),
        ('Manutenção',              (SELECT id FROM expense_categories WHERE name = 'Transporte')),
        ('Regularizações',          (SELECT id FROM expense_categories WHERE name = 'Transporte')),
        ('Uber',                    (SELECT id FROM expense_categories WHERE name = 'Transporte')),
        ('Lava Jato e Produtos',    (SELECT id FROM expense_categories WHERE name = 'Transporte')),
        ('Acessórios Carro',        (SELECT id FROM expense_categories WHERE name = 'Transporte')),
        ('Aluguel de Carro',        (SELECT id FROM expense_categories WHERE name = 'Transporte')),
        ('Pedágio',                 (SELECT id FROM expense_categories WHERE name = 'Transporte')),

        ('Empréstimos',             (SELECT id FROM expense_categories WHERE name = 'Taxas, Impostos e Empréstimos')),
        ('Impostos',                (SELECT id FROM expense_categories WHERE name = 'Taxas, Impostos e Empréstimos')),

        ('Passagem',                (SELECT id FROM expense_categories WHERE name = 'Viagens')),
        ('Utensílios Viagem',       (SELECT id FROM expense_categories WHERE name = 'Viagens')),
        ('Lembranças',              (SELECT id FROM expense_categories WHERE name = 'Viagens')),
        ('Hospedagem',              (SELECT id FROM expense_categories WHERE name = 'Viagens')),
        ('Reserva Viagem',          (SELECT id FROM expense_categories WHERE name = 'Viagens')),

        ('Reserva de Emergência',   (SELECT id FROM expense_categories WHERE name = 'Sonhos'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE expenses DROP CONSTRAINT IF EXISTS fk_expense_subcategory;
      ALTER TABLE expenses DROP COLUMN IF EXISTS subcategory_id;
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS expense_subcategories;`);
    await queryRunner.query(`DROP TABLE IF EXISTS expense_categories;`);
  }
}
