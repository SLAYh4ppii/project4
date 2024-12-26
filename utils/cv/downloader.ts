import { message } from 'antd';
import { CVDownloadResponse, CVFileName, CVDownloader } from './types';
import { extractFileName } from './helpers';
import { validateCVId } from './validation';

class FileDownloader implements CVDownloader {
  async fetchCV(fileName: string): Promise<CVDownloadResponse> {
    try {
      const validation = validateCVId(fileName);
      if (!validation.isValid || !validation.fileId) {
        return {
          success: false,
          error: validation.error || 'Invalid file ID'
        };
      }

      const response = await fetch(`/api/cv/${encodeURIComponent(validation.fileId)}`);
      
      if (!response.ok) {
        return {
          success: false,
          error: `Failed to download CV: ${response.status} ${response.statusText}`
        };
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        return { success: false, error: 'Received empty file' };
      }

      return { success: true, blob };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch CV'
      };
    }
  }

  triggerDownload(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

const downloader = new FileDownloader();

export async function downloadCV(cvFileName: CVFileName): Promise<void> {
  try {
    const fileName = extractFileName(cvFileName);
    const result = await downloader.fetchCV(fileName);
    
    if (!result.success || !result.blob) {
      message.error(result.error || 'Failed to download CV');
      return;
    }

    downloader.triggerDownload(result.blob, fileName);
    message.success('CV downloaded successfully');
  } catch (error) {
    message.error('Failed to download CV');
    console.error('CV download error:', error);
  }
}