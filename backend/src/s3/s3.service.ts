import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

console.log('REGION CHECK:', process.env.AWS_REGION);
console.log('BUCKET CHECK:', process.env.AWS_S3_BUCKET);

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  private bucket = process.env.AWS_S3_BUCKET!;

  async createUploadUrl() {
    const ext = 'jpg';

    const key = `uploads/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: 'image/jpeg',
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });

    const fileUrl = `https://${this.bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, key, fileUrl };
  }
}
