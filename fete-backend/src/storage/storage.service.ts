import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private publicBaseUrl?: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.getOrThrow('R2_BUCKET');
    this.publicBaseUrl = this.config.get('R2_PUBLIC_BASE_URL');

    const endpoint = this.config.getOrThrow('R2_ENDPOINT');
    
    this.s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: this.config.getOrThrow('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow('R2_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: false,
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
      publicUrl: this.publicUrl(params.key),
    };
  }

  async getObjectBuffer(
    key: string,
  ): Promise<{ body: Buffer; contentType?: string }> {
    const out = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const body = await streamToBuffer(out.Body);
    return { body, contentType: out.ContentType };
  }

  async putObjectBuffer(params: {
    key: string;
    contentType: string;
    body: Buffer;
  }): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        ContentType: params.contentType,
        Body: params.body,
      }),
    );
  }

  publicUrl(key: string): string | undefined {
    return this.publicBaseUrl ? `${this.publicBaseUrl}/${key}` : undefined;
  }
}
