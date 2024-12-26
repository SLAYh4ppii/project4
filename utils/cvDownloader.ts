import { message } from 'antd';

export async function downloadCV(cvFileName: string): Promise<void> {
  try {
    // Validate input
    if (!cvFileName || typeof cvFileName !== 'string') {
      throw new Error('Invalid CV filename');
    }

    const response = await fetch(`/api/cv/${encodeURIComponent(cvFileName)}`);
    if (!response.ok) {
      throw new Error('Failed to download CV');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = cvFileName;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('CV download error:', error);
    message.error('Failed to download CV');
    throw error;
  }
}