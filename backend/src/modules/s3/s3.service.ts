import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private useLocalStorage: boolean;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('aws.region') || 'ap-southeast-1';
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');
    const endpoint = this.configService.get<string>('aws.s3Endpoint');

    this.useLocalStorage =
      !accessKeyId ||
      !secretAccessKey ||
      accessKeyId === 'changeme' ||
      secretAccessKey === 'changeme';

    const config: any = { region };

    if (!this.useLocalStorage) {
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

  async uploadSelfie(file: Buffer, userId: string): Promise<string> {
    const filename = `${uuidv4()}.jpg`;
    const key = `selfies/${userId}/${filename}`;

    if (this.useLocalStorage) {
      const dir = path.join(process.cwd(), 'uploads', 'selfies', userId);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), file);
      const port = this.configService.get<string>('PORT') || '3001';
      return `http://localhost:${port}/uploads/selfies/${userId}/${filename}`;
    }

    return this.uploadFile(file, key);
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

      if (this.useLocalStorage) {
        const dir = path.join(process.cwd(), 'uploads', path.dirname(key));
        const filename = path.basename(key);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, filename), buffer);
        const port = this.configService.get<string>('PORT') || '3001';
        return `http://localhost:${port}/uploads/${key}`;
      }

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
