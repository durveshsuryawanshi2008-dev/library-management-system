import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuslibrary';
const backupsDir = path.join(__dirname, '../../backups');

async function runBackup() {
  console.log('Starting CampusLibrary Database Backup...');
  
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  try {
    await mongoose.connect(dbUri);
    console.log('Connected to database successfully');

    const collections = ['colleges', 'users', 'books', 'borrowrecords', 'reservations'];
    const backupData = {};

    const db = mongoose.connection.db;

    for (const colName of collections) {
      console.log(`Dumping collection: ${colName}...`);
      try {
        const data = await db.collection(colName).find({}).toArray();
        backupData[colName] = data;
      } catch (err) {
        console.warn(`Collection "${colName}" not found or empty. Skipping.`);
        backupData[colName] = [];
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupsDir, `backup_${timestamp}.json`);
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    
    console.log('----------------------------------------------------');
    console.log(`Backup completed successfully!`);
    console.log(`File saved to: ${backupPath}`);
    console.log('----------------------------------------------------');

  } catch (error) {
    console.error('Backup failure:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runBackup();
