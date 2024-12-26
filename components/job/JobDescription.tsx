import ReactMarkdown from 'react-markdown';

interface JobDescriptionProps {
  description: string;
}

export default function JobDescription({ description }: JobDescriptionProps) {
  return <ReactMarkdown>{description}</ReactMarkdown>;
}