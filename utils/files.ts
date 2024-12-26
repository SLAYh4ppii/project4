import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { Stats } from 'fs';
import { NextApiResponse } from 'next';

export const uploadDir = path.join(process.cwd(), 'uploads');

export async function ensureUploadDir() {
  console.log('[Files] Ensuring upload directory exists:', uploadDir);
  try {
    await fs.access(uploadDir);
    console.log('[Files] Upload directory exists');
  } catch {
    console.log('[Files] Creating upload directory');
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('[Files] Upload directory created');
  }
}

export async function getFilePath(fileName: string): Promise<{ path: string; stats: Stats }> {
  console.log('[Files] Getting file path for:', fileName);
  const filePath = path.join(uploadDir, fileName);
  console.log('[Files] Full file path:', filePath);
  
  try {
    const stats = await fs.stat(filePath);
    console.log('[Files] File stats:', {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile()
    });
    return { path: filePath, stats };
  } catch (error) {
    console.error('[Files] Error getting file stats:', error);
    throw error;
  }
}

export async function streamFileToResponse(
  filePath: string, 
  fileName: string,
  stats: Stats,
  res: NextApiResponse
): Promise<void> {
  console.log('[Files] Setting up file stream:', {
    path: filePath,
    filename: fileName,
    size: stats.size
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', stats.size);

  console.log('[Files] Headers set:', res.getHeaders());

  const fileStream = createReadStream(filePath);
  console.log('[Files] File stream created');
  
  return new Promise((resolve, reject) => {
    fileStream
      .on('open', () => console.log('[Files] Stream opened'))
      .on('data', (chunk) => console.log('[Files] Streaming chunk:', chunk.length, 'bytes'))
      .on('end', () => console.log('[Files] Stream ended'))
      .pipe(res)
      .on('finish', () => {
        console.log('[Files] Stream finished');
        resolve();
      })
      .on('error', (error) => {
        console.error('[Files] Stream error:', error);
        reject(error);
      });
  });
}