import { NextApiRequest } from 'next';
import { DatabaseConnection } from './database';

export interface ApiRequest extends NextApiRequest, DatabaseConnection {}

export interface AuthRequest extends ApiRequest {
  body: {
    username: string;
    password: string;
  };
}

export interface AuthResponse {
  token?: string;
  error?: boolean;
  message?: string;
}

export interface UpdateApplicantRequest {
  id: string;
  stage: string;
  notes: string;
  rating: number;
}