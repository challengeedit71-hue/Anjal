import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // RGBA buffer: width * 4 bytes per row + 1 filter byte per row
  const rowBytes = width * 4;
  const rawData = Buffer.alloc(height * (rowBytes + 1));

  const cx = width / 2;
  const cy = height / 2;
  const rMax = Math.min(width, height) / 2;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / rMax;
      const dy = (y - cy) / rMax;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Star shape math: |dx|^0.5 + |dy|^0.5 < size
      const starMetric = Math.pow(Math.abs(dx), 0.6) + Math.pow(Math.abs(dy), 0.6);
      const isStar = isMaskable ? starMetric < 0.45 : starMetric < 0.55;

      let r = 79, g = 70, b = 229, a = 255; // Indigo #4f46e5

      // Gradient from #4f46e5 to #8b5cf6
      const gradientFactor = (x + y) / (width + height);
      r = Math.round(79 + (139 - 79) * gradientFactor);
      g = Math.round(70 + (92 - 70) * gradientFactor);
      b = Math.round(229 + (246 - 229) * gradientFactor);

      // Rounded squircle background for non-maskable
      if (!isMaskable) {
        const squircle = Math.pow(Math.abs(dx), 4) + Math.pow(Math.abs(dy), 4);
        if (squircle > 0.85) {
          // Transparent outside squircle
          r = 0; g = 0; b = 0; a = 0;
        }
      }

      if (a > 0 && isStar) {
        // Bright white/lavender sparkle in center
        const centerDist = Math.sqrt(dx * dx + dy * dy);
        const glow = Math.max(0, 1 - centerDist * 2);
        r = Math.min(255, Math.round(230 + 25 * glow));
        g = Math.min(255, Math.round(235 + 20 * glow));
        b = 255;
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // Compress IDAT
  const compressedIDAT = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth: 8
  ihdr[9] = 6; // color type: RGBA (6)
  ihdr[10] = 0; // compression: deflate (0)
  ihdr[11] = 0; // filter: 0
  ihdr[12] = 0; // interlace: 0

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedIDAT);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(length + 12);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);

  const crc = crc32(Buffer.concat([Buffer.from(type), data]));
  chunk.writeInt32BE(crc, length + 8);
  return chunk;
}

// CRC-32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) | 0;
}

const table = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c;
}

// Output directory
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write 192x192
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
console.log('Created pwa-192x192.png');

// Write 512x512
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
console.log('Created pwa-512x512.png');

// Write Maskable 512x512 (full bleed with 15% safe padding)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
console.log('Created pwa-maskable-512x512.png');

// Write Apple Touch Icon (180x180)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, true));
console.log('Created apple-touch-icon.png');

// Write Favicon 64x64 PNG copied to favicon.ico
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64, false));
console.log('Created favicon.ico');
