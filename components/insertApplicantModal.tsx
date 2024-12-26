import { useState } from 'react';
import { Form } from 'antd';
import useSWR from 'swr';
import { Job } from '@/types';
import { fetcher } from '@/utils/fetcher';

interface InsertApplicantModalProps {
  visible: boolean;
  close: () => void;
}

interface ApplicantFormData {
  listing: string;
  name: string;
  email: string;
  cv: string[];
  phone?: string;
  linkedin?: string;
  website?: string;
  introduction?: string;
}

export default function InsertApplicantModal({ visible, close }: InsertApplicantModalProps) {
  const [form] = Form.useForm<ApplicantFormData>();
  const { data: jobs, error } = useSWR<Job[]>('/api/jobs', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!jobs) return <div>Loading...</div>;

  return null; // TODO: Implement modal
}