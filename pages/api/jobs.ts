import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import database from '@/middleware/database';
import { Job } from '@/types';

interface ExtendedRequest extends NextApiRequest {
  db: any;
}

export default async function handler(req: ExtendedRequest, res: NextApiResponse) {
  await database(req, res, async () => {
    switch (req.method) {
      case 'GET':
        try {
          const jobs = await req.db.collection('jobs').find().toArray();
          res.json(jobs);
        } catch (error) {
          res.status(500).json({ error: 'Failed to fetch jobs' });
        }
        break;

      case 'POST':
        try {
          const data: Partial<Job> = JSON.parse(req.body);
          const result = await req.db.collection('jobs').insertOne({
            title: data.title,
            location: data.location,
            description: data.description,
            applicants: [],
          });
          res.json({ message: 'ok', id: result.insertedId });
        } catch (error) {
          res.status(500).json({ error: 'Failed to create job' });
        }
        break;

      case 'PUT':
        try {
          const data = JSON.parse(req.body);
          await req.db.collection('jobs').updateOne(
            { _id: new ObjectId(data.id) },
            {
              $set: {
                title: data.title,
                location: data.location,
                description: data.description,
              },
            }
          );
          res.json({ message: 'ok' });
        } catch (error) {
          res.status(500).json({ error: 'Failed to update job' });
        }
        break;

      case 'DELETE':
        try {
          const id = JSON.parse(req.body);
          await req.db.collection('jobs').deleteOne({ _id: new ObjectId(id) });
          res.json({ message: 'ok' });
        } catch (error) {
          res.status(500).json({ error: 'Failed to delete job' });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  });
}