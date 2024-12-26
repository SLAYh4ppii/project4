export interface CVFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface CVValidationResult {
  isValid: boolean;
  fileId: string | null;
  error?: string;
}

export interface CVDownloadResponse {
  success: boolean;
  error?: string;
  blob?: Blob;
}