import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Row, Col } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Image from '@/components/Image';
import styles from '@/styles/Home.module.css';
import listingStyles from '@/styles/ListingsPage.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className={styles.main}>
        <Row
          style={{ minHeight: '60vh' }}
          className={listingStyles.secondary_b}
          justify="center"
          align="bottom"
        >
          <Col span={24} style={{ textAlign: 'center' }}>
            <Image
              src="/our-team.png"
              alt="Our Team"
              width={500}
              height={300}
              priority
            />
            <h1 className={`${listingStyles.heading1} ${listingStyles.primary}`}>
              Simple ATS
            </h1>
            <Link href="/jobs" className={listingStyles.button}>
              View Openings <DownOutlined />
            </Link>
          </Col>
        </Row>
      </main>
    </div>
  );
}