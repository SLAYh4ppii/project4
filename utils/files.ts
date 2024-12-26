import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { Stats } from 'fs';
import { NextApiResponse } from 'next';

export const uploadDir = path.join(process.cwd(), 'uploads');

export async function ensureUploadDir() {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

export async function getFilePath(fileName: string): Promise<{ path: string; stats: Stats }> {
  const filePath = path.join(uploadDir, fileName);
  const stats = await fs.stat(filePath);
  return { path: filePath, stats };
}

export async function streamFileToResponse(
  filePath: string, 
  fileName: string,
  stats: Stats,
  res: NextApiResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', stats.size);

  const fileStream = createReadStream(filePath);
  
  return new Promise((resolve, reject) => {
    fileStream
      .pipe(res)
      .on('finish', resolve)
      .on('error', (error) => {
        console.error('Stream error:', error);
        reject(error);
      });
  });
}