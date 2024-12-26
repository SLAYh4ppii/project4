import { message } from 'antd';

export async function downloadCV(cvFileName: string): Promise<void> {
  console.log('[CV Download] Starting download process for:', cvFileName);

  try {
    // Input validation
    if (!cvFileName || typeof cvFileName !== 'string') {
      const error = 'Invalid CV filename provided';
      console.error('[CV Download] Validation Error:', error);
      throw new Error(error);
    }

    console.log('[CV Download] Initiating fetch request to:', `/api/cv/${encodeURIComponent(cvFileName)}`);
    
    const response = await fetch(`/api/cv/${encodeURIComponent(cvFileName)}`);
    console.log('[CV Download] Server Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const error = `Server returned ${response.status}: ${response.statusText}`;
      console.error('[CV Download] Fetch Error:', error);
      throw new Error(error);
    }

    console.log('[CV Download] Creating blob from response');
    const blob = await response.blob();
    console.log('[CV Download] Blob created:', {
      size: blob.size,
      type: blob.type
    });

    const url = window.URL.createObjectURL(blob);
    console.log('[CV Download] Created object URL:', url);

    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = cvFileName;
    console.log('[CV Download] Download element created with:', {
      href: a.href,
      download: a.download
    });

    document.body.appendChild(a);
    console.log('[CV Download] Download element added to document');
    
    a.click();
    console.log('[CV Download] Download triggered');

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    console.log('[CV Download] Cleanup completed');
    
    message.success('CV download started');
  } catch (error) {
    console.error('[CV Download] Error:', error);
    message.error('Failed to download CV');
    throw error;
  }
}