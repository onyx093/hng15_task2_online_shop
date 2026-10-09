import { neon } from '@neondatabase/serverless';
const sql = neon("postgresql://neondb_owner:npg_whH1lI6DkmnF@ep-old-firefly-b42no4i3-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
async function test() {
  const result = await sql.query('SELECT 1 as num', []);
  console.log(result);
}
test();
