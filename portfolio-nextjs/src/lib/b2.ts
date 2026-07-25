import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.B2_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com',
  region: process.env.B2_REGION || 'eu-central-003',
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.B2_BUCKET_NAME || 'portfolio-polished';

export async function uploadToB2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `uploads/${fileName}`,
    Body: file,
    ContentType: contentType,
  });

  await s3.send(command);

  // Construct the public URL
  const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.B2_REGION || 'eu-central-003'}.backblazeb2.com/uploads/${fileName}`;
  return publicUrl;
}

export default s3;
