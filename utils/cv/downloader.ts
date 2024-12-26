import { message } from 'antd';
import { CVDownloadResponse } from './types';

async function fetchCV(cvFileName: string): Promise<CVDownloadResponse> {
  try {
    const response = await fetch(`/api/cv/${encodeURIComponent(cvFileName)}`);
    
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

function triggerDownload(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function downloadCV(cvFileName: string): Promise<void> {
  if (!cvFileName || typeof cvFileName !== 'string') {
    message.error('Invalid CV filename');
    return;
  }

  const result = await fetchCV(cvFileName);
  
  if (!result.success || !result.blob) {
    message.error(result.error || 'Failed to download CV');
    return;
  }

  try {
    triggerDownload(result.blob, cvFileName);
    message.success('CV downloaded successfully');
  } catch (error) {
    message.error('Failed to save CV file');
  }
}