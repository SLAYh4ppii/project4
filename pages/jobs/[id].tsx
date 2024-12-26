import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import styles from "../../styles/Home.module.css";
import listingStyles from "../../styles/ListingsPage.module.css";
import {
  Row,
  Col,
  Spin,
  Form,
  Input,
  Button,
  Divider,
  message,
  Upload,
} from "antd";
import ReactMarkdown from "react-markdown";
import { Job } from "@/types";
import type { UploadFile } from 'antd/es/upload/interface';

interface JobApplication {
  name: string;
  email: string;
  cv: UploadFile[];
  phone?: string;
  linkedin?: string;
  website?: string;
  introduction?: string;
  listing?: string;
}