// User roles
export type UserRole = 'authority' | 'provider' | 'user';

// Authentication types
export interface NostrKeys {
  publicKey: string; // npub
  privateKey?: string; // nsec (optional for security)
}

export interface AuthUser {
  id: number;
  publicKey: string;
  role: UserRole;
  name?: string;
}

// Provider types
export interface Provider {
  id: number;
  publicKey: string;
  firstName: string;
  lastName: string;
  specialty: string;
  institution: string;
  city: string;
  state: string;
  zip: string;
  about: string;
  profileImageUrl?: string;
}

// Credential types
export interface Credential {
  id: number;
  providerId: number;
  type: string;
  issuerId: number;
  issuerName: string;
  badgeId: string;
  status: 'pending' | 'approved' | 'rejected';
  issueDate?: string;
  details?: string;
}

export interface CredentialRequest {
  id: number;
  providerId: number;
  providerName: string;
  providerSpecialty: string;
  providerImageUrl?: string;
  credentialType: string;
  issuingAuthority: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  details?: string;
}

// NIP-58 Badge
export interface NostrBadge {
  id: string;
  name: string;
  description: string;
  image?: string;
  issuer: {
    npub: string;
    name?: string;
  };
  subject: {
    npub: string;
    name?: string;
  };
  created_at: number;
}
