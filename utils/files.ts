import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { Stats } from 'fs';
import { NextApiResponse } from 'next';

export const uploadDir = path.join(process.cwd(), 'uploads');

export async function ensureUploadDir() {
  console.log('Ensuring upload directory exists:', uploadDir);
  try {
    await fs.access(uploadDir);
    console.log('Upload directory already exists');
  } catch {
    console.log('Creating upload directory');
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

export async function getFilePath(fileName: string): Promise<{ path: string; stats: Stats }> {
  console.log('Getting file path for:', fileName);
  const filePath = path.join(uploadDir, fileName);
  console.log('Full file path:', filePath);
  
  try {
    const stats = await fs.stat(filePath);
    console.log('File stats retrieved:', {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    });
    return { path: filePath, stats };
  } catch (error) {
    console.error('Error getting file stats:', error);
    throw error;
  }
}

export async function streamFileToResponse(
  filePath: string, 
  fileName: string,
  stats: Stats,
  res: NextApiResponse
): Promise<void> {
  console.log('Setting up file stream:', {
    file: fileName,
    size: stats.size
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', stats.size);

  console.log('Headers set:', res.getHeaders());

  const fileStream = createReadStream(filePath);
  
  return new Promise((resolve, reject) => {
    console.log('Starting file stream');
    
    fileStream
      .on('error', (error) => {
        console.error('Stream error:', error);
        reject(error);
      })
      .on('end', () => {
        console.log('Stream ended successfully');
      })
      .pipe(res)
      .on('finish', () => {
        console.log('Stream finished successfully');
        resolve();
      })
      .on('error', (error) => {
        console.error('Response stream error:', error);
        reject(error);
      });
  });
}