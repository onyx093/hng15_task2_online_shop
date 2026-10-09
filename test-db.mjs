import { neon } from '@neondatabase/serverless';
const sql = neon("postgresql://neondb_owner:npg_whH1lI6DkmnF@ep-old-firefly-b42no4i3-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
const rows = await sql`SELECT * FROM cart_items`;
console.log("DB Rows:", rows);
