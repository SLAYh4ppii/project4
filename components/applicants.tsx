import { useState } from "react";
import useSWR from "swr";
import { Job } from "@/types";
import { fetcher } from "@/utils/fetcher";

interface ApplicantsProps {
  data: {
    initialId: string;
    pipeline: string[];
  };
}

export default function Applicants({ data }: ApplicantsProps) {
  const [insertApplicantModalVisible, setInsertApplicantModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(data.initialId);

  const { data: jobs, error } = useSWR<Job[]>("/api/jobs", fetcher);

  if (error) return <div>Failed to load</div>;
  if (!jobs) return <div>Loading...</div>;

  return null; // TODO: Implement applicants view
}