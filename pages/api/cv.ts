import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { ensureUploadDir } from '@/utils/files';
import { processUploadedFile, validateUpload } from '@/utils/cv';
import { UploadResponse, UploadedFile } from '@/types/upload';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureUploadDir();

    const form = formidable({
      maxFiles: 1,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: function(part) {
        return part.mimetype ? validateUpload(part.mimetype) : false;
      },
    });

    const [, files] = await form.parse(req);
    const file = files.file?.[0] as UploadedFile | undefined;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = await processUploadedFile(file);
    return res.status(200).json({ filename });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}