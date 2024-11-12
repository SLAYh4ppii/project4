import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { List, Spin, Card, Tag, Row, Col, Rate } from 'antd';
import ViewApplicantModal from './viewApplicantModal';
import { Applicant } from '@/types';

interface ApplicantViewProps {
  data: string;
  pipeline: string[];
}

export default function ApplicantView({ data, pipeline }: ApplicantViewProps) {
  const { data: applicants, error } = useSWR<Applicant[]>(`/api/jobs/${data}`, async (url) => {
    const res = await fetch(url);
    return res.json();
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [applicantData, setApplicantData] = useState<Applicant | null>(null);

  function setColor(stage: string): string {
    switch (stage) {
      case 'Applied':
        return 'magenta';
      case 'Interview':
        return 'gold';
      case 'Offer':
        return 'green';
      default:
        return 'blue';
    }
  }

  if (error) return <div>Failed to load</div>;
  if (!applicants) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        alignItems: 'center',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {applicantData && (
        <ViewApplicantModal
          visible={modalVisible}
          data={applicantData}
          close={() => {
            mutate(`/api/jobs/${data}`);
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
                  {item.introduction}
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}