/**
 * Provider-abstracted identity verification.
 * v1: ManualVerificationProvider (admin review).
 * Future: swap in a licensed KYC partner without changing callers.
 */

export interface VerifyNIDInput {
  userId: string;
  nidFrontImageUrl: string;
  nidBackImageUrl: string;
}

export interface MatchFaceInput {
  userId: string;
  selfieImageUrl: string;
  referenceImageUrl: string;
}

export interface VerificationResult {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  confidence?: number;
  providerReference?: string;
  message?: string;
}

export interface FaceMatchResult {
  matched: boolean;
  confidence: number;
  providerReference?: string;
}

export interface VerificationStatusResult {
  status: string;
  verifiedAt?: Date;
  provider: string;
}

export interface VerificationProvider {
  readonly name: string;

  verifyNID(input: VerifyNIDInput): Promise<VerificationResult>;

  matchFace(input: MatchFaceInput): Promise<FaceMatchResult>;

  getVerificationStatus(userId: string): Promise<VerificationStatusResult>;
}

export const VERIFICATION_PROVIDER = Symbol('VERIFICATION_PROVIDER');
