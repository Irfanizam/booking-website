// Script to delete all users from the database
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'Merchantdb/merchant.db');
const db = new Database(dbPath);

console.log('🗑️  Deleting all users from database...');

try {
  // Get count before deletion
  const countBefore = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log(`Found ${countBefore.count} users in database`);

  // Delete all users
  const stmt = db.prepare('DELETE FROM users');
  const result = stmt.run();

  console.log(`✅ Deleted ${result.changes} user(s) from database`);
  console.log('✅ All users have been deleted!');
} catch (err) {
  console.error('❌ Error deleting users:', err);
} finally {
  db.close();
}
