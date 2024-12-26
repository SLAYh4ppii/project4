import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { NextApiResponse } from 'next';

export const uploadDir = path.join(process.cwd(), 'uploads');

export async function ensureUploadDir() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('[Files] Upload directory ensured:', uploadDir);
  } catch (error) {
    console.error('[Files] Error creating upload directory:', error);
    throw error;
  }
}

export function cleanFileName(fileName: string | string[] | undefined): string {
  if (!fileName || Array.isArray(fileName)) {
    throw new Error('Invalid file name');
  }
  return fileName.replace(/['"{}[\]]/g, '').trim();
}

export async function getFilePath(fileName: string): Promise<{ path: string; stats: fs.Stats }> {
  try {
    const filePath = path.join(uploadDir, fileName);
    console.log('[Files] Checking file:', filePath);
    const stats = await fs.stat(filePath);
    return { path: filePath, stats };
  } catch (error) {
    console.error('[Files] Error accessing file:', error);
    throw error;
  }
}

export async function streamFileToResponse(
  filePath: string, 
  fileName: string,
  stats: fs.Stats,
  res: NextApiResponse
): Promise<void> {
  console.log('[Files] Starting file stream:', {
    path: filePath,
    size: stats.size,
    filename: fileName
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', stats.size);

  const fileStream = createReadStream(filePath);
  return new Promise((resolve, reject) => {
    fileStream
      .on('error', (error) => {
        console.error('[Files] Stream error:', error);
        reject(error);
      })
      .pipe(res)
      .on('finish', () => {
        console.log('[Files] Stream completed successfully');
        resolve();
      })
      .on('error', (error) => {
        console.error('[Files] Response stream error:', error);
        reject(error);
      });
  });
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    console.log('[Files] File deleted successfully:', filePath);
  } catch (error) {
    console.error('[Files] Error deleting file:', error);
    throw error;
  }
}