import React from 'react';
import { Card, Tag, Rate, Button, Typography, Space, Descriptions } from 'antd';
import { DownloadOutlined, MailOutlined, PhoneOutlined, LinkedinOutlined, GlobalOutlined } from '@ant-design/icons';
import { Applicant } from '@/types';

const { Text } = Typography;

interface ApplicantCardProps {
  applicant: Applicant;
  onDownload: () => void;
  onView: () => void;
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

export function ApplicantCard({ applicant, onDownload, onView }: ApplicantCardProps) {
  return (
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
          <Button 
            icon={<DownloadOutlined />}
            onClick={onDownload}
          >
            Download CV
          </Button>
          <Button 
            type="primary"
            onClick={onView}
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
      
      {applicant.notes && (
        <div style={{ marginTop: 16 }}>
          <Text strong>Notes:</Text>
          <p>{applicant.notes}</p>
        </div>
      )}
    </Card>
  );
}