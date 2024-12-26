import { NextApiResponse } from 'next';
import database from '@/middleware/database';
import { ApiRequest } from '@/types/api';
import { Applicant } from '@/types';
import { DatabaseResponse } from '@/types/database';

export default async function handler(
  req: ApiRequest,
  res: NextApiResponse<Applicant[] | DatabaseResponse<string>>
) {
  await database(req, res, async () => {
    switch (req.method) {
      case 'GET':
        try {
          const applicants = await req.db
            .collection<Applicant>('applicants')
            .find()
            .toArray();
          res.json(applicants);
        } catch (error) {
          console.error('Failed to fetch applicants:', error);
          res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch applicants' 
          });
        }
        break;
      default:
        res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        });
    }
  });
}