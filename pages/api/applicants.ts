import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import database from '@/middleware/database';
import { Applicant } from '@/types';

interface ExtendedRequest extends NextApiRequest {
  db: any;
}

export default async function handler(req: ExtendedRequest, res: NextApiResponse) {
  console.log('[Applicants API] Request received:', { method: req.method });

  await database(req, res, async () => {
    switch (req.method) {
      case 'GET':
        try {
          console.log('[Applicants API] Fetching all applicants');
          const applicants = await req.db.collection('applicants').find().toArray();
          console.log('[Applicants API] Found applicants:', applicants.length);
          res.json(applicants);
        } catch (error) {
          console.error('[Applicants API] GET error:', error);
          res.status(500).json({ error: 'Failed to fetch applicants' });
        }
        break;

      case 'POST':
        try {
          console.log('[Applicants API] Processing new application');
          const data = JSON.parse(req.body);
          console.log('[Applicants API] Received data:', {
            name: data.name,
            email: data.email,
            listing: data.listing,
            cvData: data.cv ? 'Present' : 'Missing'
          });

          const listing = data.listing;

          let cvId = null;
          if (data.cv?.[0]?.response?.message) {
            cvId = data.cv[0].response.message;
            console.log('[Applicants API] CV ID extracted:', cvId);
          }

          if (!cvId) {
            console.log('[Applicants API] CV validation failed');
            res.status(400).json({ error: 'PDF file is required' });
            return;
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

          console.log('[Applicants API] Creating applicant record:', applicantData);
          const result = await req.db.collection('applicants').insertOne(applicantData);
          console.log('[Applicants API] Applicant created:', result.insertedId.toString());
          
          console.log('[Applicants API] Updating job listing:', listing);
          await req.db.collection('jobs').updateOne(
            { _id: new ObjectId(listing) },
            { $push: { applicants: result.insertedId.toString() } }
          );
          console.log('[Applicants API] Job listing updated');
          
          res.json({ message: 'ok', id: result.insertedId });
        } catch (error) {
          console.error('[Applicants API] POST error:', error);
          res.status(500).json({ error: 'Failed to create applicant' });
        }
        break;

      case 'PUT':
        try {
          console.log('[Applicants API] Updating applicant');
          const data = JSON.parse(req.body);
          console.log('[Applicants API] Update data:', {
            id: data.id,
            stage: data.stage,
            rating: data.rating
          });

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
          console.log('[Applicants API] Applicant updated');
          res.json({ message: 'ok' });
        } catch (error) {
          console.error('[Applicants API] PUT error:', error);
          res.status(500).json({ error: 'Failed to update applicant' });
        }
        break;

      case 'DELETE':
        try {
          console.log('[Applicants API] Deleting applicant');
          const id = JSON.parse(req.body);
          console.log('[Applicants API] Delete ID:', id);

          await req.db.collection('applicants').deleteOne({ _id: new ObjectId(id) });
          console.log('[Applicants API] Applicant deleted');

          await req.db.collection('jobs').updateMany(
            {},
            { $pull: { applicants: id } }
          );
          console.log('[Applicants API] Job listings updated');

          res.json({ message: 'ok' });
        } catch (error) {
          console.error('[Applicants API] DELETE error:', error);
          res.status(500).json({ error: 'Failed to delete applicant' });
        }
        break;

      default:
        console.log('[Applicants API] Invalid method:', req.method);
        res.status(405).json({ error: 'Method not allowed' });
    }
  });
}