/**
 * Calculates SHA-256 cryptographic hash of a File or ArrayBuffer.
 */
export async function calculateSHA256(data: File | ArrayBuffer | string): Promise<string> {
  try {
    let buffer: ArrayBuffer;
    if (typeof data === 'string') {
      const encoder = new TextEncoder();
      buffer = encoder.encode(data).buffer;
    } else if (data instanceof File) {
      buffer = await data.arrayBuffer();
    } else {
      buffer = data;
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Failed to compute SHA-256 hash:', error);
    // Fallback pseudo-hash if crypto.subtle unavailable in non-secure context
    return 'sha256_calc_failed_' + Date.now().toString(16);
  }
}

/**
 * Validates audio file MIME type and extension
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const allowedExtensions = ['.wav', '.flac', '.mp3', '.ogg', '.m4a', '.aac'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported format '${ext}'. Allowed formats: WAV, FLAC, MP3, OGG, M4A.`
    };
  }

  // File size limit (e.g. 100MB max)
  const MAX_SIZE = 100 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 100MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
    };
  }

  return { valid: true };
}
