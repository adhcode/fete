const UPLOADER_HASH_KEY = 'fete_uploader_hash';

export function getUploaderHash(): string {
  let hash = localStorage.getItem(UPLOADER_HASH_KEY);
  if (!hash) {
    hash = generateHash();
    localStorage.setItem(UPLOADER_HASH_KEY, hash);
  }
  return hash;
}

function generateHash(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
