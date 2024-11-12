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
      const job = await req.db.collection('jobs').findOne({ _id: new ObjectId(id) });
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      const applicants = await Promise.all(
        (job.applicants || []).map(async (applicantId: string) => {
          try {
            return await req.db.collection('applicants').findOne({ 
              _id: new ObjectId(applicantId)
            });
          } catch (error) {
            console.error(`Error fetching applicant ${applicantId}:`, error);
            return null;
          }
        })
      );

      // Filter out any null values from failed lookups
      const validApplicants = applicants.filter(a => a !== null);
      res.json(validApplicants);
    } catch (error) {
      console.error('Error fetching job applicants:', error);
      res.status(500).json({ error: 'Failed to fetch job applicants' });
    }
  });
}