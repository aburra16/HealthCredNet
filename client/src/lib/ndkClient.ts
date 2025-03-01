import NDK, { NDKNip07Signer } from '@nostr-dev-kit/ndk';

// Define common public relays
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://nostr.mom',
  'wss://relay.current.fyi',
  'wss://relay.snort.social',
  'wss://eden.nostr.land',
  'wss://purplepag.es'
];

// Check for NIP-07 browser extension
const hasNip07Extension = typeof window !== 'undefined' && !!window.nostr;

// Create NDK instance with default relays
const ndk = new NDK({
  explicitRelayUrls: DEFAULT_RELAYS,
  autoConnectUserRelays: true,
  // Use NIP-07 signer if available
  signer: hasNip07Extension ? new NDKNip07Signer() : undefined
});

// Connect to relays
let connected = false;

async function connectToRelays() {
  if (connected) return;
  
  try {
    await ndk.connect();
    console.log('Connected to Nostr relays:', DEFAULT_RELAYS);
    
    // Get user information if NIP-07 extension is available
    if (hasNip07Extension && ndk.signer) {
      try {
        const user = await ndk.signer.user();
        console.log('Connected with NIP-07 user:', user.npub);
      } catch (error) {
        console.warn('Could not get NIP-07 user:', error);
      }
    }
    
    connected = true;
  } catch (error) {
    console.error('Failed to connect to Nostr relays:', error);
    // Retry connection after a delay
    setTimeout(connectToRelays, 5000);
  }
}

// Initial connection attempt
connectToRelays();

// Fetch badge events for a subject
async function fetchBadgeEvents(subjectPubkey: string) {
  if (!connected) {
    await connectToRelays();
  }
  
  try {
    // Create filter for badge events (kind 30009) that mention the subject
    const filter = {
      kinds: [30009],
      '#p': [subjectPubkey]
    };
    
    // Fetch events
    return await ndk.fetchEvents(filter, { closeOnEose: true });
  } catch (error) {
    console.error('Error fetching badge events:', error);
    return new Set();
  }
}

export { ndk, DEFAULT_RELAYS, connectToRelays, fetchBadgeEvents, hasNip07Extension };