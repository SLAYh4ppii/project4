import NextImage from 'next/image';
import { ImageProps } from 'next/image';

interface CustomImageProps extends Omit<ImageProps, 'alt'> {
  alt: string;
}

export default function Image({ alt, ...props }: CustomImageProps) {
  return (
    <NextImage 
      alt={alt}
      {...props}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}