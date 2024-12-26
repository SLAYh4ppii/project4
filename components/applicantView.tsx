import React, { useState } from 'react';
import useSWR from 'swr';
import { List, Card, Tag, Rate, Button, Typography, Space, Descriptions, message } from 'antd';
import { DownloadOutlined, MailOutlined, PhoneOutlined, LinkedinOutlined, GlobalOutlined } from '@ant-design/icons';
import { Applicant } from '@/types';
import ViewApplicantModal from './viewApplicantModal';
import { downloadCV } from '@/utils/cvDownloader';

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
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const { data: applicants, error, mutate } = useSWR<Applicant[]>(
    `/api/jobs/${data}/applicants`,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch applicants');
      }
      return res.json();
    }
  );

  if (error) {
    console.error('Error loading applicants:', error);
    return <div>Failed to load applicants</div>;
  }
  
  if (!applicants) return <div>Loading...</div>;
  
  if (applicants.length === 0) return <div>No applications yet</div>;

  const handleDownloadCV = async (cv: string) => {
    try {
      console.log('[ApplicantView] Attempting to download CV:', cv);
      await downloadCV(cv);
    } catch (error) {
      console.error('[ApplicantView] Download error:', error);
      message.error('Failed to download CV');
    }
  };

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
              <Space>
                {applicant.cv && (
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadCV(applicant.cv)}
                  >
                    Download CV
                  </Button>
                )}
                <Button 
                  type="primary"
                  onClick={() => setSelectedApplicant(applicant)}
                >
                  View Details
                </Button>
              </Space>
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
          </Card>
        )}
      />
    </>
  );
}