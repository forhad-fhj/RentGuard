/** Human-readable profile review labels — never say "Verified" without NID. */
export function profileReviewLabel(status?: string): string {
  switch (status) {
    case 'ADMIN_REVIEWED':
      return 'Reviewed by RentGuard team';
    case 'SELFIE_ONLY':
      return 'Selfie on file — pending review';
    case 'PENDING_NID':
      return 'Pending identity review';
    case 'REJECTED':
      return 'Review declined';
    case 'VERIFIED':
      return 'Reviewed by RentGuard team';
    default:
      return 'Not reviewed';
  }
}

export function applicationStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'APPROVED':
      return 'Accepted';
    case 'REJECTED':
      return 'Rejected';
    case 'WITHDRAWN':
      return 'Withdrawn';
    default:
      return status;
  }
}

export function propertyStatusLabel(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'ACTIVE':
      return 'Active';
    case 'RENTED':
      return 'Rented';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return status;
  }
}
