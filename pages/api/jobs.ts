import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import database from '@/middleware/database';
import { ApiRequest } from '@/types/api';
import { Job } from '@/types';
import { DatabaseConnection } from '@/types/mongodb';

export default async function handler(
  req: ApiRequest & DatabaseConnection,
  res: NextApiResponse<Job[] | { message: string; id?: string } | { error: string }>
) {
  await database(req, res, async () => {
    switch (req.method) {
      case 'GET':
        try {
          const jobs = await req.db.collection<Job>('jobs').find().toArray();
          res.json(jobs);
        } catch (error) {
          console.error('Failed to fetch jobs:', error);
          res.status(500).json({ error: 'Failed to fetch jobs' });
        }
        break;

      case 'POST':
        try {
          const data = JSON.parse(req.body as string) as Partial<Job>;
          const result = await req.db.collection<Job>('jobs').insertOne({
            title: data.title || '',
            location: data.location || '',
            description: data.description || '',
            applicants: [],
            _id: new ObjectId()
          });
          res.json({ message: 'ok', id: result.insertedId.toString() });
        } catch (error) {
          console.error('Failed to create job:', error);
          res.status(500).json({ error: 'Failed to create job' });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  });
}