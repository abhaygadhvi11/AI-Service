const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const schemaPath = path.join(__dirname, 'migrations/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // First connection to postgres database to create api_service database
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await adminClient.connect();
    console.log('✓ Connected to PostgreSQL');

    // Drop existing database if it exists
    console.log('Dropping existing database (if exists)...');
    try {
      await adminClient.query('DROP DATABASE IF EXISTS api_service WITH (FORCE);');
      console.log('Database dropped');
    } catch (e) {
      console.log('  Could not drop database (might not exist)');
    }

    // Create database
    console.log(' Creating database...');
    await adminClient.query('CREATE DATABASE api_service;');
    console.log(' Database created');

    await adminClient.end();

    // Connect to the new database and run schema
    console.log('\n Running schema migration...');
    
    // Parse and execute schema statements
    const cleanedSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && !line.trim().startsWith('\\'))
      .join('\n');

    const statements = cleanedSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s && s.length > 0);

    const appClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'api_service',
    });

    console.log(' Connecting to api_service database...');
    await appClient.connect();
    console.log('✓ Connected to api_service');

    for (const statement of statements) {
      try {
        await appClient.query(statement);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`  Skipped (already exists): ${statement.substring(0, 50)}...`);
        } else if (error.message.includes('does not exist')) {
          console.log(`  Skipped (not found): ${statement.substring(0, 50)}...`);
        } else {
          throw error;
        }
      }
    }

    console.log('✓ Schema migration completed successfully!');

    // Verify tables
    const result = await appClient.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('\n Created tables:');
    result.rows.forEach(row => {
      console.log(`   ${row.table_name}`);
    });

    await appClient.end();

    console.log('\n Database setup completed successfully!');
    console.log('Update your .env file with the correct credentials if needed.');
    console.log(' Ready to start the server: npm start');

  } catch (error) {
    console.error(' Error during setup:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

setupDatabase();
