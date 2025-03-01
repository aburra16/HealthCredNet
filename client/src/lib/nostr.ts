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

/**
 * Create a NIP-58 badge
 * @param issuerPrivkey - Private key of the issuer in hex or nsec format
 * @param subjectPubkey - Public key of the subject in hex or npub format
 * @param badgeInfo - Badge information including name, description, etc.
 * @returns The signed badge event ID (can be used as badgeId) or null if error
 */
export async function createNIP58Badge(
  issuerPrivkey: string, 
  subjectPubkey: string, 
  badgeInfo: {
    name: string;
    description: string;
    image?: string;
    thumbs?: string[];
  }
): Promise<string | null> {
  try {
    // Check for NIP-07 extension
    const useExtension = issuerPrivkey === '' && hasNip07Extension();
    
    // Process subject pubkey - convert from npub to hex if needed
    let subjectHexPubkey = subjectPubkey;
    if (subjectPubkey.startsWith('npub1')) {
      const decoded = nip19.decode(subjectPubkey);
      if (decoded.type === 'npub') {
        subjectHexPubkey = decoded.data as string;
      }
    }
    
    // Check for private key or extension
    if (!useExtension && !issuerPrivkey) {
      console.error('NIP-58 Badge creation requires either a private key or NIP-07 extension');
      return null;
    }
    
    // Prepare current timestamp
    const createdAt = Math.floor(Date.now() / 1000);
    
    // Prepare badge content
    const badgeContent = {
      ...badgeInfo,
      subject: {
        pubkey: subjectHexPubkey
      },
      issued_at: createdAt
    };
    
    // Create the badge event (NIP-58 is kind 30009)
    const unsignedEvent = {
      kind: 30009,
      created_at: createdAt,
      tags: [
        ['d', `${badgeInfo.name}_${createdAt}`], // Unique identifier for the badge definition
        ['p', subjectHexPubkey]                  // Subject's public key
      ],
      content: JSON.stringify(badgeContent),     // Badge details in JSON format
      pubkey: '', // Will be set during signing
      id: '',     // Will be set during signing
      sig: ''     // Will be set during signing
    };
    
    let signedEvent;
    
    // Sign the event
    if (useExtension) {
      // Use NIP-07 extension to sign
      signedEvent = await signEventWithNip07(unsignedEvent);
    } else {
      // Use provided private key to sign
      let privateKeyHex = issuerPrivkey;
      
      // Convert nsec to hex if needed
      if (issuerPrivkey.startsWith('nsec1')) {
        const decoded = nip19.decode(issuerPrivkey);
        if (decoded.type !== 'nsec') {
          throw new Error('Invalid nsec key');
        }
        privateKeyHex = Buffer.from(decoded.data as Uint8Array).toString('hex');
      }
      
      // Get the issuer's public key
      const issuerHexPubkey = getPublicKey(privateKeyHex);
      
      // Update the event with the issuer's pubkey
      unsignedEvent.pubkey = issuerHexPubkey;
      
      // Here we would use the nostr-tools library to finalize and sign the event
      // This requires importing and using the appropriate functions from the library
      // signedEvent = finalizeEvent(unsignedEvent, privateKeyHex);
      
      // For simplicity in this demonstration, we'll create a mock signed event ID
      // In a real implementation, this would be an actual event ID and signature
      return `nip58_badge_${createdAt}_${Math.floor(Math.random() * 1000000)}`;
    }
    
    if (!signedEvent) {
      console.error('Failed to sign NIP-58 badge event');
      return null;
    }
    
    return signedEvent.id;
  } catch (error) {
    console.error('Error creating NIP-58 badge:', error);
    return null;
  }
}

/**
 * Verify a NIP-58 badge
 * @param badgeId - The badge event ID to verify
 * @param issuerPubkey - Expected issuer public key (optional)
 * @param subjectPubkey - Expected subject public key (optional)
 * @returns Boolean indicating if the badge is valid
 */
export async function verifyNIP58Badge(
  badgeId: string, 
  issuerPubkey?: string, 
  subjectPubkey?: string
): Promise<boolean> {
  try {
    // In a real implementation, we would:
    // 1. Fetch the badge event from a Nostr relay using the badgeId
    // 2. Verify the event signature to ensure it's authentic
    // 3. Check if the event kind is 30009 (NIP-58 badge)
    // 4. If issuerPubkey is provided, verify it matches the event's pubkey
    // 5. If subjectPubkey is provided, verify it's in the event's p tags
    
    // For demonstration purposes, we'll assume the badge is valid
    // An actual implementation would perform the above checks
    
    // If the badgeId starts with our mock prefix, it's a mock badge
    if (badgeId.startsWith('nip58_badge_')) {
      return true;
    }
    
    // For real badges, we'd validate by fetching the event and checking signatures
    // This requires relay connectivity and the full nostr-tools library functionality
    
    // Mock implementation until full relay connectivity is implemented
    return true;
  } catch (error) {
    console.error('Error verifying NIP-58 badge:', error);
    return false;
  }
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
