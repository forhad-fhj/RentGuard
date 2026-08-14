/** Minimal uploaded file shape from multer (avoids @types/multer dependency). */
export interface UploadedSelfieFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname?: string;
}
