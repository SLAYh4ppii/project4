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

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  await database(req, res, async () => {
    try {
      const job = await req.db.collection('jobs').findOne({ 
        _id: new ObjectId(id) 
      });

      if (!job) {
        return res.json([]);
      }

      if (!job.applicants || !Array.isArray(job.applicants) || job.applicants.length === 0) {
        return res.json([]);
      }

      const applicantIds = job.applicants
        .filter((id: string) => ObjectId.isValid(id))
        .map((id: string) => new ObjectId(id));

      if (applicantIds.length === 0) {
        return res.json([]);
      }

      const applicants = await req.db.collection<Applicant>('applicants')
        .find({ 
          _id: { $in: applicantIds } 
        })
        .toArray();

      return res.json(applicants);
    } catch (error) {
      console.error('Error fetching job applicants:', error);
      return res.status(500).json({ error: 'Failed to fetch applicants' });
    }
  });
}