import sequelize from './config/database.js';

async function migrate() {
  await sequelize.authenticate();
  console.log('Connected to MySQL database.');

  // 1. Set admin password to 'interdesk@26'
  await sequelize.query(`UPDATE users SET password = 'interdesk@26' WHERE email = 'admin@interndesk.in';`);
  console.log('Admin password updated to interdesk@26.');

  // 2. Add profile columns to users table if they do not exist
  const [userCols] = await sequelize.query('DESCRIBE users;');
  const existingUserCols = new Set(userCols.map(c => c.Field));

  const userColumnsToAdd = [
    { name: 'avatar', type: 'LONGTEXT' },
    { name: 'coverImage', type: 'LONGTEXT' },
    { name: 'phone', type: 'VARCHAR(50) DEFAULT ""' },
    { name: 'college', type: 'VARCHAR(255) DEFAULT ""' },
    { name: 'degree', type: 'VARCHAR(255) DEFAULT ""' },
    { name: 'gradYear', type: 'VARCHAR(50) DEFAULT ""' },
    { name: 'cgpa', type: 'VARCHAR(50) DEFAULT ""' },
    { name: 'bio', type: 'TEXT' },
    { name: 'skills', type: 'TEXT' },
    { name: 'resumeKey', type: 'VARCHAR(255) DEFAULT ""' },
    { name: 'profileData', type: 'LONGTEXT' }
  ];

  for (const col of userColumnsToAdd) {
    if (!existingUserCols.has(col.name)) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN \`${col.name}\` ${col.type};`);
      console.log(`Added column ${col.name} to users table.`);
    } else {
      console.log(`Column ${col.name} already exists in users table.`);
    }
  }

  // 3. Add experienceLevel to internships table if it does not exist
  const [internCols] = await sequelize.query('DESCRIBE internships;');
  const existingInternCols = new Set(internCols.map(c => c.Field));

  if (!existingInternCols.has('experienceLevel')) {
    await sequelize.query("ALTER TABLE internships ADD COLUMN `experienceLevel` VARCHAR(100) DEFAULT 'All Experience Levels';");
    console.log('Added column experienceLevel to internships table.');
  } else {
    console.log('Column experienceLevel already exists in internships table.');
  }

  console.log('Migration completed successfully.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

