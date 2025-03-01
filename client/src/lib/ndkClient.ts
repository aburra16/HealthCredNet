import NDK from '@nostr-dev-kit/ndk';

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

// Create NDK instance with default relays
const ndk = new NDK({
  explicitRelayUrls: DEFAULT_RELAYS,
  autoConnectUserRelays: true,
  autoFetchUserFollows: false
});

// Connect to relays
try {
  ndk.connect().then(() => {
    console.log('Connected to Nostr relays:', DEFAULT_RELAYS);
  }).catch(error => {
    console.error('Failed to connect to Nostr relays:', error);
  });
} catch (error) {
  console.error('Error initializing NDK:', error);
}

export { ndk, DEFAULT_RELAYS };