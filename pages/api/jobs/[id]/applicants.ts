import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import database from '@/middleware/database';
import { ApiRequest } from '@/types/api';
import { Applicant } from '@/types';

export default async function handler(
  req: ApiRequest,
  res: NextApiResponse<Applicant[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  await database(req, res, async () => {
    try {
      const job = await req.db.collection('jobs').findOne({ 
        _id: new ObjectId(id) 
      });

      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      if (!job.applicants || !Array.isArray(job.applicants)) {
        res.json([]);
        return;
      }

      const applicantIds = job.applicants
        .filter(id => ObjectId.isValid(id))
        .map(id => new ObjectId(id));

      const applicants = await req.db.collection<Applicant>('applicants')
        .find({ 
          _id: { $in: applicantIds } 
        })
        .toArray();

      res.json(applicants);
    } catch (error) {
      console.error('Error fetching job applicants:', error);
      res.status(500).json({ error: 'Failed to fetch applicants' });
    }
  });
}