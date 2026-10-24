// Run: node seed-admin.js
// Creates the admin account directly in the database
import { User } from './models/index.js';
import sequelize from './config/database.js';

const ADMIN_EMAIL = 'admin@interndesk.in';
const ADMIN_NAME = 'Site Admin';
const ADMIN_PASSWORD = 'interdesk@26';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB connected.');

    const [user, created] = await User.findOrCreate({
      where: { email: ADMIN_EMAIL },
      defaults: {
        email: ADMIN_EMAIL,
        password: '',
        name: ADMIN_NAME,
        firstName: 'Site',
        lastName: 'Admin',
        role: 'admin',
        profileComplete: true
      }
    });

    if (!created) {
      await user.update({ role: 'admin', name: ADMIN_NAME });
      console.log(`Updated existing user to admin: ${ADMIN_EMAIL}`);
    } else {
      console.log(`Admin account created: ${ADMIN_EMAIL}`);
    }

    console.log('Role:', user.role);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
