import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('aws.region') || 'ap-southeast-1';
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');
    const endpoint = this.configService.get<string>('aws.s3Endpoint');
    
    const config: any = { region };
    
    if (accessKeyId && secretAccessKey) {
      config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }
    
    if (endpoint) {
      config.endpoint = endpoint;
    }
    
    this.s3Client = new S3Client(config);
    this.bucket = this.configService.get<string>('aws.s3Bucket') || 'rentguard-documents';
  }

  async uploadFile(
    fileData: string | Buffer,
    key: string,
  ): Promise<string> {
    try {
      const buffer =
        typeof fileData === 'string'
          ? Buffer.from(fileData, 'base64')
          : fileData;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: this.getContentType(key),
        ServerSideEncryption: 'AES256',
      });

      await this.s3Client.send(command);

      // Return public URL
      const region = this.configService.get<string>('aws.region');
      return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  private getContentType(key: string): string {
    const ext = key.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}
