import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import database from '@/middleware/database';
import { ApiRequest } from '@/types/api';
import { Applicant, Job } from '@/types';
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

      case 'POST':
        try {
          const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
          
          if (!data.listing || !ObjectId.isValid(data.listing)) {
            res.status(400).json({ 
              success: false, 
              error: 'Invalid listing ID' 
            });
            return;
          }

          // Create the applicant
          const applicant = {
            name: data.name,
            email: data.email,
            cv: data.cv,
            phone: data.phone || '',
            linkedin: data.linkedin || '',
            website: data.website || '',
            introduction: data.introduction || '',
            stage: 'Applied',
            notes: '',
            rating: 0,
            _id: new ObjectId()
          };

          await req.db.collection<Applicant>('applicants').insertOne(applicant);

          // Update job listing with typed collection
          await req.db
            .collection<Job>('jobs')
            .updateOne(
              { _id: new ObjectId(data.listing) },
              { $push: { applicants: applicant._id.toString() } }
            );

          res.status(201).json({ 
            success: true, 
            data: 'Application submitted successfully' 
          });
        } catch (error) {
          console.error('Failed to create applicant:', error);
          res.status(500).json({ 
            success: false, 
            error: 'Failed to create applicant' 
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