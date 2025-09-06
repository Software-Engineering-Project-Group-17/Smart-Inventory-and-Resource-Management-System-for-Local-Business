const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  console.log("🔍 Checking all users in database...");

  try {
    // Check all users
    const users =
      await sql`SELECT user_id, email, name FROM "user" ORDER BY email`;
    console.log("📋 All users:");
    users.forEach((user) => {
      console.log(
        `  - ID: ${user.user_id}, Email: ${user.email}, Name: ${user.name}`
      );
    });

    // Check staff table
    console.log("\n📋 All staff members:");
    const staff = await sql`
      SELECT s.id, s.branch_id, u.email, u.name 
      FROM staff s 
      JOIN "user" u ON s.user_id = u.user_id 
      ORDER BY u.email
    `;
    staff.forEach((member) => {
      console.log(
        `  - Email: ${member.email}, Name: ${member.name}, Branch ID: ${member.branch_id}`
      );
    });

    // Check for similar emails
    console.log(
      "\n🔍 Looking for emails similar to 'thivinubmanager1@mail.com':"
    );
    const similarEmails = await sql`
      SELECT email, name FROM "user" 
      WHERE email ILIKE '%thivinu%' OR email ILIKE '%manager%'
    `;
    similarEmails.forEach((user) => {
      console.log(`  - Found: ${user.email} (${user.name})`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkUsers();
