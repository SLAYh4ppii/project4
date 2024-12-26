import React from 'react';
import Head from 'next/head';
import { Layout, Menu, Spin, Row, Col, Button } from 'antd';
import styles from '../styles/ATS.module.css';
import homeStyle from '../styles/Home.module.css';
import Image from '@/components/Image';
import { User } from '@/types';
import useSWR from 'swr';
import Router from 'next/router';
import cookie from 'js-cookie';
import Applicants from '@/components/applicants';
import JobListings from '@/components/jobListings';

const { Header, Content } = Layout;

interface ATSProps {
  staticProps: {
    initialId: string;
    pipeline: string[];
  };
}

export default function ATS({ staticProps }: ATSProps) {
  const { data, mutate } = useSWR<User>('/api/me', async (args) => {
    const res = await fetch(args);
    return res.json();
  });
  
  // Rest of the component implementation...
}