import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { List, Spin, Card, Tag, Row, Col, Rate, Empty, message } from 'antd';
import ViewApplicantModal from './viewApplicantModal';
import { Applicant } from '@/types';

interface ApplicantViewProps {
  data: string;
  pipeline: string[];
}

export default function ApplicantView({ data, pipeline }: ApplicantViewProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [applicantData, setApplicantData] = useState<Applicant | null>(null);

  const { data: applicants, error, isLoading } = useSWR<Applicant[]>(
    data ? `/api/jobs/${data}/applicants` : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch applicants');
      }
      return response.json();
    }
  );

  function setColor(stage: string): string {
    switch (stage) {
      case 'Applied':
        return 'magenta';
      case 'Interview':
        return 'gold';
      case 'Offer':
        return 'green';
      case 'Rejected':
        return 'red';
      default:
        return 'blue';
    }
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Empty
          description="Failed to load applicants. Please try again later."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!applicants || applicants.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <Empty description="No applications yet" />
      </div>
    );
  }

  return (
    <div>
      {applicantData && modalVisible && (
        <ViewApplicantModal
          visible={modalVisible}
          data={applicantData}
          close={() => {
            mutate(`/api/jobs/${data}/applicants`);
            setModalVisible(false);
          }}
          pipeline={pipeline}
        />
      )}
      <List
        split={false}
        itemLayout="horizontal"
        dataSource={applicants}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              style={{ width: '100%' }}
              bodyStyle={{ padding: '1rem' }}
              onClick={() => {
                setApplicantData(item);
                setModalVisible(true);
              }}
            >
              <Row>
                <Col span={4} style={{ display: 'flex', alignItems: 'center' }}>
                  {item.name}
                </Col>
                <Col span={4} style={{ display: 'flex', alignItems: 'center' }}>
                  <Tag color={setColor(item.stage)}>{item.stage}</Tag>
                </Col>
                <Col span={4} style={{ display: 'flex', alignItems: 'center' }}>
                  <Rate value={item.rating} disabled />
                </Col>
                <Col span={12} style={{ display: 'flex', alignItems: 'center' }}>
                  {item.introduction || 'No introduction provided'}
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}