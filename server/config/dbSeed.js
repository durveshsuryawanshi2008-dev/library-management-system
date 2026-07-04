import User from '../models/User.js';

export async function seedDatabase() {
  try {
    const superAdminEmail = 'superadmin@campuslibrary.com';
    const superAdminExists = await User.findOne({ role: 'super_admin' });

    if (!superAdminExists) {
      console.log('No super admin found. Seeding default super admin...');
      await User.create({
        name: 'Super Admin',
        email: superAdminEmail,
        password: 'superadminpassword',
        role: 'super_admin',
        status: 'active'
      });
      console.log(`Default super admin created successfully. Email: ${superAdminEmail}`);
    } else {
      console.log('Super admin already exists in the database.');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
}

export default seedDatabase;
