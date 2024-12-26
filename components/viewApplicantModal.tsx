import React, { useEffect } from 'react';
import { Modal, Descriptions, Form, Input, Button, Rate, Select, message } from 'antd';
import { saveAs } from 'file-saver';
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

  async function handleSubmit(values: UpdateApplicantRequest) {
    try {
      await fetch('/api/applicants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...values, id: data._id }),
      });
      close();
    } catch (error) {
      console.error('Failed to update applicant:', error);
      message.error('Failed to update applicant');
    }
  }

  // Rest of the component remains the same...
}