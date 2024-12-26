import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals_register', (table) => {
    table
      .uuid('user_id')
      .after('id')
      .notNullable()
      .index()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals_register', (table) => {
    table.dropColumn('user_id')
  })
}
