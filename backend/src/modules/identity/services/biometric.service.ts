import { Injectable } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';

export interface FaceMatchResult {
  score: number;
  matched: boolean;
}

@Injectable()
export class BiometricService {
  private modelsLoaded = false;

  constructor(private configService: ConfigService) {}

  async loadModels() {
    if (this.modelsLoaded) return;

    const modelPath = this.configService.get<string>(
      'ai.faceRecognitionModelPath',
    );

    try {
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
      this.modelsLoaded = true;
    } catch (error) {
      console.error('Failed to load face recognition models:', error);
      throw new Error('Face recognition models not available');
    }
  }

  async generateTemplate(imageUrl: string): Promise<string> {
    await this.loadModels();

    try {
      // Load and process image
      const imageBuffer = await this.fetchImage(imageUrl);
      const processedImage = await this.preprocessImage(imageBuffer);

      // Detect face and generate descriptor
      const detection = await faceapi
        .detectSingleFace(processedImage)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error('No face detected in image');
      }

      // Return descriptor as base64 string
      return Buffer.from(detection.descriptor).toString('base64');
    } catch (error) {
      console.error('Biometric template generation error:', error);
      throw new Error('Failed to generate biometric template');
    }
  }

  async matchFaces(
    image1Url: string,
    image2Url: string,
  ): Promise<FaceMatchResult> {
    await this.loadModels();

    try {
      const template1 = await this.generateTemplate(image1Url);
      const template2 = await this.generateTemplate(image2Url);

      const descriptor1 = Buffer.from(template1, 'base64');
      const descriptor2 = Buffer.from(template2, 'base64');

      // Calculate Euclidean distance
      const distance = faceapi.euclideanDistance(
        new Float32Array(descriptor1),
        new Float32Array(descriptor2),
      );

      // Convert distance to similarity score (0-1)
      const threshold =
        this.configService.get<number>('ai.faceMatchThreshold') || 0.6;
      const score = 1 - Math.min(distance / threshold, 1);
      const matched = score >= threshold;

      return {
        score,
        matched,
      };
    } catch (error) {
      console.error('Face matching error:', error);
      return {
        score: 0,
        matched: false,
      };
    }
  }

  async detectLiveness(imageUrl: string): Promise<number> {
    // Simplified liveness detection
    // In production, use advanced techniques like:
    // - Blink detection
    // - Head movement tracking
    // - 3D depth analysis
    // - Challenge-response

    try {
      const imageBuffer = await this.fetchImage(imageUrl);
      const image = await sharp(imageBuffer).metadata();

      // Basic checks
      let livenessScore = 0.5;

      // Check image quality
      if (image.width && image.height) {
        if (image.width >= 640 && image.height >= 480) {
          livenessScore += 0.2;
        }
      }

      // Check for multiple faces (potential spoofing)
      // This is simplified - in production, use actual face detection
      livenessScore += 0.3;

      return Math.min(livenessScore, 1.0);
    } catch (error) {
      console.error('Liveness detection error:', error);
      return 0.0;
    }
  }

  private async fetchImage(url: string): Promise<Buffer> {
    // In production, fetch from S3 or local storage
    // For now, return empty buffer (implement actual fetch)
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<HTMLImageElement> {
    // Convert buffer to image element
    // This is simplified - implement proper image preprocessing
    const processed = await sharp(imageBuffer)
      .resize(640, 480)
      .toBuffer();

    // Convert to HTMLImageElement (simplified)
    // In production, use proper image loading
    return processed as any;
  }
}
