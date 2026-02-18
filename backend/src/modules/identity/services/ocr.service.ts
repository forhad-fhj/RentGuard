import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { ConfigService } from '@nestjs/config';

export interface NidOcrResult {
  nidNumber: string;
  name: string;
  dateOfBirth: string;
  address: string;
  photoUrl?: string;
  confidence: number;
}

@Injectable()
export class OcrService {
  constructor(private configService: ConfigService) {}

  async extractNidData(imageUrl: string): Promise<NidOcrResult> {
    try {
      // Initialize Tesseract worker
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => console.log(m),
      });

      // Perform OCR
      const { data } = await worker.recognize(imageUrl);
      await worker.terminate();

      // Extract NID information using regex patterns
      const text = data.text;
      const nidNumber = this.extractNidNumber(text);
      const name = this.extractName(text);
      const dateOfBirth = this.extractDateOfBirth(text);
      const address = this.extractAddress(text);

      // Calculate confidence score
      const confidence = data.confidence / 100;

      return {
        nidNumber,
        name,
        dateOfBirth,
        address,
        confidence,
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract NID data');
    }
  }

  private extractNidNumber(text: string): string {
    // NID format: 1234567890123 (13 digits)
    const nidRegex = /\b\d{13}\b/;
    const match = text.match(nidRegex);
    return match ? match[0] : '';
  }

  private extractName(text: string): string {
    // Look for name patterns (usually after "Name:" or similar)
    const nameRegex = /(?:Name|নাম)[:\s]+([A-Za-z\s]+)/i;
    const match = text.match(nameRegex);
    return match ? match[1].trim() : '';
  }

  private extractDateOfBirth(text: string): string {
    // Date format: DD-MM-YYYY or DD/MM/YYYY
    const dateRegex = /\b\d{2}[-\/]\d{2}[-\/]\d{4}\b/;
    const match = text.match(dateRegex);
    return match ? match[0] : '';
  }

  private extractAddress(text: string): string {
    // Address usually comes after "Address:" or similar markers
    const addressRegex = /(?:Address|ঠিকানা)[:\s]+(.+?)(?:\n|$)/i;
    const match = text.match(addressRegex);
    return match ? match[1].trim() : '';
  }
}
