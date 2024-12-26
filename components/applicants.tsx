import { List, Card, Tag, Rate } from 'antd';
import useSWR from "swr";
import { Job } from "@/types";
import { fetcher } from "@/utils/fetcher";

export default function Applicants() {
  const { data: jobs, error } = useSWR<Job[]>("/api/jobs", fetcher);

  if (error) return <div>Failed to load</div>;
  if (!jobs) return <div>Loading...</div>;

  return (
    <List
      dataSource={jobs}
      renderItem={(job) => (
        <Card
          title={job.title}
          extra={<Tag color="blue">{job.location}</Tag>}
        >
          <p>{job.description}</p>
          <Rate disabled defaultValue={0} />
        </Card>
      )}
    />
  );
}