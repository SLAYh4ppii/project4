import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import database from '@/middleware/database';

interface ExtendedRequest extends NextApiRequest {
  db: any;
}

export default async function handler(req: ExtendedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  await database(req, res, async () => {
    try {
      // First get the job to get the applicants array
      const job = await req.db.collection('jobs').findOne({ 
        _id: new ObjectId(id) 
      });

      if (!job) {
        return res.status(404).json([]);
      }

      // If there are no applicants, return empty array
      if (!job.applicants || !Array.isArray(job.applicants) || job.applicants.length === 0) {
        return res.json([]);
      }

      // Convert string IDs to ObjectIds for the query
      const applicantIds = job.applicants
        .filter((id: string) => ObjectId.isValid(id))
        .map((id: string) => new ObjectId(id));

      if (applicantIds.length === 0) {
        return res.json([]);
      }

      // Fetch all applicants in a single query
      const applicants = await req.db.collection('applicants')
        .find({ 
          _id: { $in: applicantIds } 
        })
        .toArray();

      return res.json(applicants || []);
    } catch (error) {
      console.error('Error fetching job applicants:', error);
      return res.status(500).json([]);
    }
  });
}