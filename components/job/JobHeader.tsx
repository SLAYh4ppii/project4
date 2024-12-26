import Link from 'next/link';
import { Row, Col, Divider } from 'antd';
import listingStyles from '@/styles/ListingsPage.module.css';

export default function JobHeader() {
  return (
    <>
      <Link href="/jobs" className={listingStyles.button_s}>
        Back to Listings
      </Link>
      <Divider />
    </>
  );
}