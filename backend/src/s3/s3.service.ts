import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  private bucket = process.env.AWS_BUCKET_NAME!;

  async createUploadUrl(fileType: string) {
    const key = `uploads/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileType}`;

    // Validate file type (important)
    const allowed = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowed.includes(fileType)) return { error: 'Unsupported file type' };

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: `image/${fileType}`,
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 5, // 5 minutes
    });

    return {
      uploadUrl: url,
      key,
      publicUrl: `https://${this.bucket}.s3.amazonaws.com/${key}`,
    };
  }
}
