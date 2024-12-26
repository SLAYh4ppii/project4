import React, { useState } from 'react';
import useSWR from 'swr';
import { List, Card, Tag, Rate, Button, Typography, Space, Descriptions } from 'antd';
import { DownloadOutlined, MailOutlined, PhoneOutlined, LinkedinOutlined, GlobalOutlined } from '@ant-design/icons';
import { Applicant } from '@/types';
import ViewApplicantModal from './viewApplicantModal';
import { fetcher } from '@/utils/fetcher';
import { downloadCV } from '@/utils/cv/downloader';
import { ApplicantCard } from './applicant/ApplicantCard';

const { Text } = Typography;

interface ApplicantViewProps {
  data: string;
  pipeline: string[];
}

export default function ApplicantView({ data, pipeline }: ApplicantViewProps) {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const { data: applicants, error, mutate } = useSWR<Applicant[]>(
    `/api/jobs/${data}/applicants`,
    fetcher,
    { 
      refreshInterval: 5000,
      revalidateOnFocus: true
    }
  );

  if (error) {
    console.error('Failed to load applicants:', error);
    return <div>Failed to load applicants. Please try again later.</div>;
  }
  
  if (!applicants) return <div>Loading...</div>;
  if (applicants.length === 0) return <div>No applications yet</div>;

  return (
    <>
      {selectedApplicant && (
        <ViewApplicantModal
          visible={!!selectedApplicant}
          data={selectedApplicant}
          close={() => {
            setSelectedApplicant(null);
            mutate();
          }}
          pipeline={pipeline}
        />
      )}
      <List
        dataSource={applicants}
        renderItem={(applicant) => (
          <ApplicantCard
            applicant={applicant}
            onDownload={() => downloadCV(applicant.cv)}
            onView={() => setSelectedApplicant(applicant)}
          />
        )}
      />
    </>
  );
}