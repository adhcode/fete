import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private publicBaseUrl?: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.getOrThrow('R2_BUCKET');
    this.publicBaseUrl = this.config.get('R2_PUBLIC_BASE_URL');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.config.getOrThrow('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.getOrThrow('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async signUploadPut(params: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }) {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      ContentType: params.contentType,
    });

    const url = await getSignedUrl(this.s3, cmd, {
      expiresIn: params.expiresInSeconds ?? 60,
    });

    return {
      uploadUrl: url,
      key: params.key,
      publicUrl: this.publicBaseUrl ? `${this.publicBaseUrl}/${params.key}` : undefined,
    };
  }
}
