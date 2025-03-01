const { generateSecretKey, getPublicKey, nip19 } = require('nostr-tools');

// Generate a new key pair
const sk = generateSecretKey();
const pk = getPublicKey(sk);

// Convert to bech32 format
const nsec = nip19.nsecEncode(sk);
const npub = nip19.npubEncode(pk);

console.log('Private key (nsec):', nsec);
console.log('Public key (npub):', npub);