import { message } from 'antd';

export async function downloadCV(cvFileName: string): Promise<void> {
  console.log('Starting CV download process for:', cvFileName);

  try {
    // Input validation
    if (!cvFileName || typeof cvFileName !== 'string') {
      const error = new Error('Invalid CV filename');
      console.error('Input validation failed:', error);
      throw error;
    }

    console.log('Fetching CV from server...');
    const response = await fetch(`/api/cv/${encodeURIComponent(cvFileName)}`);
    
    // Response validation
    if (!response.ok) {
      const error = new Error(`Failed to download CV: ${response.status} ${response.statusText}`);
      console.error('Server response error:', error);
      console.debug('Response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw error;
    }

    console.log('Converting response to blob...');
    const blob = await response.blob();
    console.debug('Blob details:', {
      size: blob.size,
      type: blob.type
    });

    if (blob.size === 0) {
      const error = new Error('Received empty file');
      console.error('Blob validation failed:', error);
      throw error;
    }

    console.log('Creating object URL...');
    const url = window.URL.createObjectURL(blob);

    console.log('Initiating file download...');
    const a = document.createElement('a');
    a.href = url;
    a.download = cvFileName;
    document.body.appendChild(a);
    
    console.log('Triggering click event...');
    a.click();

    // Cleanup
    console.log('Cleaning up resources...');
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log('Download process completed successfully');
    message.success('CV downloaded successfully');
  } catch (error) {
    console.error('CV download failed:', error);
    
    // Provide specific error messages based on the error type
    let errorMessage = 'Failed to download CV';
    if (error instanceof TypeError) {
      errorMessage = 'Network error occurred while downloading CV';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    message.error(errorMessage);
    throw error;
  }
}