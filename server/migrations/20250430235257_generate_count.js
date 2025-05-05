/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  console.log("🍗Running migration with client:", knex.client.config.client);

  return knex.schema.createTable("generate_count", (table) => {
    table.increments("id");
    table.timestamp("created_at");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  knex.schema.dropTable("generate_count");
}
