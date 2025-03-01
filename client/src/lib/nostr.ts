/**
 * Nostr functionality implementation using nostr-tools
 */
import { 
  generateSecretKey, 
  getPublicKey, 
  nip19, 
  verifyEvent 
} from 'nostr-tools';

// NIP-07 browser extension interface
interface Window {
  nostr?: {
    getPublicKey(): Promise<string>;
    signEvent(event: any): Promise<any>;
    getRelays(): Promise<{ [url: string]: { read: boolean; write: boolean } }>;
    nip04: {
      encrypt(pubkey: string, plaintext: string): Promise<string>;
      decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };
  };
}

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: any): Promise<any>;
      getRelays(): Promise<{ [url: string]: { read: boolean; write: boolean } }>;
      nip04: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
      };
    };
  }
}

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
      return decoded.type === 'npub';
    }
    
    // Validate nsec
    if (key.startsWith('nsec1')) {
      const decoded = nip19.decode(key);
      return decoded.type === 'nsec';
    }
    
    return false;
  } catch (error) {
    console.error('Error validating Nostr key:', error);
    return false;
  }
}

// Extract public key from private key
export function getPublicKeyFromPrivate(nsecKey: string): string | null {
  try {
    if (!nsecKey.startsWith('nsec1')) return null;
    
    // Decode the nsec key - this returns { type: 'nsec', data: Uint8Array }
    const decoded = nip19.decode(nsecKey);
    
    // Check the type and data
    if (decoded.type !== 'nsec') return null;
    
    // Get the public key from the private key
    // In nostr-tools, getPublicKey() expects a Uint8Array
    const publicKeyHex = getPublicKey(decoded.data);
    
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

/**
 * Check if a NIP-07 compatible extension is available
 * @returns Boolean indicating if a NIP-07 extension is present
 */
export function hasNip07Extension(): boolean {
  return typeof window !== 'undefined' && !!window.nostr;
}

/**
 * Get the public key from a NIP-07 compatible extension
 * @returns Promise resolving to the public key in npub format
 */
export async function getNip07PublicKey(): Promise<string | null> {
  if (!hasNip07Extension()) {
    console.error('No NIP-07 extension detected');
    return null;
  }
  
  try {
    // Get hex public key from extension
    const hexPubkey = await window.nostr!.getPublicKey();
    
    // Convert to npub format
    return nip19.npubEncode(hexPubkey);
  } catch (error) {
    console.error('Error getting public key from extension:', error);
    return null;
  }
}

/**
 * Sign an event using a NIP-07 compatible extension
 * @param event - The event to sign
 * @returns Promise resolving to the signed event
 */
export async function signEventWithNip07(event: any): Promise<any | null> {
  if (!hasNip07Extension()) {
    console.error('No NIP-07 extension detected');
    return null;
  }
  
  try {
    return await window.nostr!.signEvent(event);
  } catch (error) {
    console.error('Error signing event with extension:', error);
    return null;
  }
}
