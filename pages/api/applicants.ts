import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import database from '@/middleware/database';
import { Applicant } from '@/types';

interface ExtendedRequest extends NextApiRequest {
  db: any;
}

export default async function handler(req: ExtendedRequest, res: NextApiResponse) {
  await database(req, res, async () => {
    switch (req.method) {
      case 'GET':
        try {
          const applicants = await req.db.collection('applicants').find().toArray();
          res.json(applicants);
        } catch (error) {
          console.error('GET applicants error:', error);
          res.status(500).json({ error: 'Failed to fetch applicants' });
        }
        break;

      case 'POST':
        try {
          const data = JSON.parse(req.body);
          const listing = data.listing;
          delete data.listing;
          
          // Ensure cv is properly handled
          const cvId = data.cv && data.cv[0] && data.cv[0].response ? 
            data.cv[0].response.message : 
            (typeof data.cv === 'string' ? data.cv : null);

          if (!cvId) {
            throw new Error('Invalid CV data');
          }

          const applicantData: Partial<Applicant> = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            linkedin: data.linkedin,
            website: data.website,
            introduction: data.introduction,
            stage: 'Applied',
            notes: '',
            rating: 0,
            cv: cvId
          };

          const result = await req.db.collection('applicants').insertOne(applicantData);
          
          await req.db.collection('jobs').updateOne(
            { _id: new ObjectId(listing) },
            { $push: { applicants: result.insertedId.toString() } }
          );
          
          res.json({ message: 'ok', id: result.insertedId });
        } catch (error) {
          console.error('POST applicant error:', error);
          res.status(500).json({ error: 'Failed to create applicant' });
        }
        break;

      case 'PUT':
        try {
          const data = JSON.parse(req.body);
          await req.db.collection('applicants').updateOne(
            { _id: new ObjectId(data.id) },
            {
              $set: {
                stage: data.stage,
                notes: data.notes,
                rating: data.rating,
              },
            }
          );
          res.json({ message: 'ok' });
        } catch (error) {
          console.error('PUT applicant error:', error);
          res.status(500).json({ error: 'Failed to update applicant' });
        }
        break;

      case 'DELETE':
        try {
          const id = JSON.parse(req.body);
          await req.db.collection('applicants').deleteOne({ _id: new ObjectId(id) });
          await req.db.collection('jobs').updateMany(
            {},
            { $pull: { applicants: id } }
          );
          res.json({ message: 'ok' });
        } catch (error) {
          console.error('DELETE applicant error:', error);
          res.status(500).json({ error: 'Failed to delete applicant' });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  });
}