const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const dbUrl = process.env.DB_URL || 'mongodb+srv://admin:admin@cluster0.rtvgmkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'ATS';
const saltRounds = 10;

async function initializeDatabase() {
  const client = new MongoClient(dbUrl);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    // Check if admin user exists
    const userCollection = db.collection('user');
    const adminExists = await userCollection.findOne({ username: 'admin' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', saltRounds);
      await userCollection.insertOne({
        userId: uuidv4(),
        username: 'admin',
        password: hashedPassword
      });
      console.log('Admin user created');
    }

    // Initialize pipeline stages if they don't exist
    const pipelineCollection = db.collection('pipeline');
    const pipelineExists = await pipelineCollection.findOne();

    if (!pipelineExists) {
      await pipelineCollection.insertOne({
        pipeline: ['Applied', 'Interview', 'Technical', 'Offer', 'Rejected']
      });
      console.log('Pipeline stages created');
    }

    // Create sample job listings if they don't exist
    const jobsCollection = db.collection('jobs');
    const jobsExist = await jobsCollection.findOne();

    if (!jobsExist) {
      await jobsCollection.insertMany([
        {
          title: 'Senior Frontend Developer',
          location: 'Remote',
          description: '# Senior Frontend Developer\n\nWe are looking for an experienced Frontend Developer to join our team.\n\n## Requirements\n- 5+ years of experience with React\n- Strong TypeScript skills\n- Experience with Next.js\n\n## What we offer\n- Competitive salary\n- Remote work\n- Flexible hours',
          applicants: []
        },
        {
          title: 'Backend Engineer',
          location: 'New York, NY',
          description: '# Backend Engineer\n\nJoin our backend team to build scalable solutions.\n\n## Requirements\n- Strong Node.js experience\n- MongoDB expertise\n- API design skills\n\n## Benefits\n- Health insurance\n- 401k matching\n- Annual bonus',
          applicants: []
        }
      ]);
      console.log('Sample job listings created');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initializeDatabase();