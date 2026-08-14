'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SelfieCaptureProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export default function SelfieCapture({ onCapture, disabled }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError('Camera access denied or unavailable. Use file upload below.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        onCapture(file);
        stopCamera();
      },
      'image/jpeg',
      0.92,
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCameraError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCameraError('Image must be 5MB or smaller');
      return;
    }
    setCapturedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    onCapture(file);
    stopCamera();
  };

  const retake = () => {
    setPreviewUrl(null);
    setCapturedFile(null);
    startCamera();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        A live selfie is required for every account. This helps establish human accountability
        and can be reviewed by admins. RentGuard is not a government verification service.
      </p>

      {cameraError && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          {cameraError}
        </p>
      )}

      {!previewUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
          <button
            type="button"
            disabled={disabled || !!cameraError}
            onClick={capturePhoto}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            Capture Selfie
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Selfie preview" className="w-full rounded-xl border border-gray-200" />
          <p className="text-xs text-green-700">Selfie captured{capturedFile ? `: ${Math.round(capturedFile.size / 1024)} KB` : ''}</p>
          <button
            type="button"
            onClick={retake}
            className="text-sm text-primary-600 hover:underline"
          >
            Retake photo
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Or upload a photo (fallback)
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700"
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
