// backend/src/s3/s3.service.ts

import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Debug ---------------------------------------------------------------
// (Optional logging – safe to remove in production)
console.log('REGION CHECK:', process.env.AWS_REGION);
console.log('BUCKET CHECK:', process.env.AWS_S3_BUCKET);

@Injectable()
export class S3Service {
  // ====================================================================
  // # S3 CLIENT INITIALIZATION
  // ====================================================================
  private s3 = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  private bucket = process.env.AWS_S3_BUCKET!;

  // ====================================================================
  // # GENERATE SIGNED UPLOAD URL
  // ====================================================================
  /**
   * Creates a pre-signed upload URL for clients to upload images directly
   * to S3 without routing through the backend.
   *
   * Returns:
   *  - uploadUrl (signed S3 URL)
   *  - key (S3 object path)
   *  - fileUrl (public S3 CDN URL)
   */
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
      expiresIn: 300, // 5 minutes
    });

    const fileUrl = `https://${this.bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, key, fileUrl };
  }

  // ====================================================================
  // # DELETE OBJECT FROM S3
  // ====================================================================
  /**
   * Deletes an object from S3.
   * Used primarily during full profile deletion or user account deletion.
   */
  async deleteObject(key: string): Promise<void> {
    if (!key) return;

    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3.send(command);
    } catch (err) {
      console.error('S3 delete error:', err);
    }
  }
}
