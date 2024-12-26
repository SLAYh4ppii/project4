import React from 'react';
import useSWR from 'swr';
import { List, Card, Tag, Rate, Button, Typography, Space, Descriptions } from 'antd';
import { DownloadOutlined, MailOutlined, PhoneOutlined, LinkedinOutlined, GlobalOutlined } from '@ant-design/icons';
import { Applicant } from '@/types';

const { Text } = Typography;

interface ApplicantViewProps {
  data: string;
  pipeline: string[];
}

function setColor(stage: string): string {
  switch (stage) {
    case 'Applied': return 'blue';
    case 'Interview': return 'gold';
    case 'Offer': return 'green';
    case 'Rejected': return 'red';
    default: return 'default';
  }
}

export default function ApplicantView({ data, pipeline }: ApplicantViewProps) {
  const { data: applicants, error } = useSWR<Applicant[]>(
    `/api/jobs/${data}/applicants`
  );

  if (error) return <div>Failed to load applicants</div>;
  if (!applicants) return <div>Loading...</div>;
  if (applicants.length === 0) return <div>No applications yet</div>;

  const handleDownloadCV = async (cvFileName: string) => {
    try {
      const response = await fetch(`/api/cv/${cvFileName}`);
      if (!response.ok) throw new Error('Failed to download CV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV-${cvFileName}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading CV:', error);
    }
  };

  return (
    <List
      dataSource={applicants}
      renderItem={(applicant) => (
        <Card 
          style={{ marginBottom: 16 }}
          title={
            <Space size="large">
              <Text strong>{applicant.name}</Text>
              <Tag color={setColor(applicant.stage)}>{applicant.stage}</Tag>
              <Rate value={applicant.rating} disabled />
            </Space>
          }
          extra={
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadCV(applicant.cv)}
            >
              Download CV
            </Button>
          }
        >
          <Descriptions column={2}>
            <Descriptions.Item label={<><MailOutlined /> Email</>}>
              <a href={`mailto:${applicant.email}`}>{applicant.email}</a>
            </Descriptions.Item>
            {applicant.phone && (
              <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
                <a href={`tel:${applicant.phone}`}>{applicant.phone}</a>
              </Descriptions.Item>
            )}
            {applicant.linkedin && (
              <Descriptions.Item label={<><LinkedinOutlined /> LinkedIn</>}>
                <a href={applicant.linkedin} target="_blank" rel="noopener noreferrer">
                  Profile
                </a>
              </Descriptions.Item>
            )}
            {applicant.website && (
              <Descriptions.Item label={<><GlobalOutlined /> Website</>}>
                <a href={applicant.website} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
          
          {applicant.introduction && (
            <div style={{ marginTop: 16 }}>
              <Text strong>Introduction:</Text>
              <p>{applicant.introduction}</p>
            </div>
          )}
          
          {applicant.notes && (
            <div style={{ marginTop: 16 }}>
              <Text strong>Notes:</Text>
              <p>{applicant.notes}</p>
            </div>
          )}
        </Card>
      )}
    />
  );
}