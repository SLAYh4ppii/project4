import { useEffect } from 'react';
import { Form } from 'antd';
import { Applicant } from '@/types';
import { UpdateApplicantRequest } from '@/types/api';

interface ViewApplicantModalProps {
  visible: boolean;
  data: Applicant;
  close: () => void;
  pipeline: string[];
}

export default function ViewApplicantModal({ visible, data, close, pipeline }: ViewApplicantModalProps) {
  const [form] = Form.useForm<UpdateApplicantRequest>();

  useEffect(() => {
    form.resetFields();
  }, [data, form]);

  return null; // TODO: Implement view modal
}