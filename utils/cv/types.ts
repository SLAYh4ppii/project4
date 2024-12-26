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

export type CVFileName = string | { cv: string };

export interface CVDownloader {
  fetchCV(fileName: string): Promise<CVDownloadResponse>;
  triggerDownload(blob: Blob, fileName: string): void;
}