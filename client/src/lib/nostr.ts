/**
 * Nostr functionality implementation using nostr-tools
 */
import { 
  generateSecretKey, 
  getPublicKey, 
  nip19, 
  verifyEvent 
} from 'nostr-tools';

// Generate a new Nostr key pair
export function generateKeyPair() {
  // Use nostr-tools to generate a proper Nostr key pair
  const privateKeyHex = generateSecretKey();
  const publicKeyHex = getPublicKey(privateKeyHex);
  
  // Convert hex keys to bech32 format
  const privateKey = nip19.nsecEncode(privateKeyHex);
  const publicKey = nip19.npubEncode(publicKeyHex);
    
  return { privateKey, publicKey };
}

// Validate a Nostr key
export function validateNostrKey(key: string): boolean {
  if (!key) return false;
  
  try {
    // Validate npub
    if (key.startsWith('npub1')) {
      const decoded = nip19.decode(key);
      return decoded.type === 'npub' && typeof decoded.data === 'string';
    }
    
    // Validate nsec
    if (key.startsWith('nsec1')) {
      const decoded = nip19.decode(key);
      return decoded.type === 'nsec' && typeof decoded.data === 'string';
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

// Extract public key from private key
export function getPublicKeyFromPrivate(nsecKey: string): string | null {
  try {
    if (!nsecKey.startsWith('nsec1')) return null;
    
    // Decode the nsec key
    const decoded = nip19.decode(nsecKey);
    if (decoded.type !== 'nsec' || typeof decoded.data !== 'string') return null;
    
    // Get the public key hex from the private key hex
    const privateKeyHex = decoded.data;
    const publicKeyHex = getPublicKey(privateKeyHex);
    
    // Encode it back to npub format
    return nip19.npubEncode(publicKeyHex);
  } catch (error) {
    console.error('Failed to extract public key:', error);
    return null;
  }
}

// Mock function to create NIP-58 badge
export function createNIP58Badge(issuerId: string, subjectId: string, badgeInfo: any): string {
  // In a real implementation, this would create an actual NIP-58 badge
  // For now, just return a mock badge ID
  return `badge${Math.floor(Math.random() * 1000000)}`;
}

// Mock function to verify a NIP-58 badge
export function verifyNIP58Badge(badgeId: string): boolean {
  // In a real implementation, this would verify the badge cryptographically
  // For now, just return true for any badge
  return true;
}
