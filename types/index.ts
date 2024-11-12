export interface Job {
  _id: string;
  title: string;
  location: string;
  description: string;
  applicants: string[];
}

export interface Applicant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  introduction?: string;
  stage: string;
  notes: string;
  rating: number;
  cv: string;
}

export interface User {
  userId: string;
  username: string;
}