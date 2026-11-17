/** 浏览器端编解码工具 / Browser codecs for the tools pages. */

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: false });

export function toBytes(text: string): Uint8Array {
  return textEncoder.encode(text);
}

export function fromBytes(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const normalized = value.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE91 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=?@[]^_`{|}~"';

export function encodeBase16(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function decodeBase16(value: string): Uint8Array {
  const normalized = value.replace(/\s+/g, '').toLowerCase();
  if (normalized.length % 2) throw new Error('Base16 长度必须是偶数');
  if (!/^[0-9a-f]*$/.test(normalized)) throw new Error('包含非法十六进制字符');
  return Uint8Array.from(normalized.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16));
}

export function encodeBase32(bytes: Uint8Array): string {
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32[(buffer << (5 - bits)) & 31];
  while (output.length % 8) output += '=';
  return output;
}

export function decodeBase32(value: string): Uint8Array {
  const normalized = value.replace(/=+$/g, '').replace(/\s+/g, '').toUpperCase();
  let buffer = 0;
  let bits = 0;
  const output: number[] = [];
  for (const char of normalized) {
    const index = BASE32.indexOf(char);
    if (index < 0) throw new Error('包含非法 Base32 字符');
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((buffer >>> bits) & 0xff);
    }
  }
  return Uint8Array.from(output);
}

export function encodeBase58(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  let encoded = '';
  while (value > 0n) {
    encoded = BASE58[Number(value % 58n)] + encoded;
    value /= 58n;
  }
  return '1'.repeat(zeros) + encoded;
}

export function decodeBase58(value: string): Uint8Array {
  const normalized = value.replace(/\s+/g, '');
  let zeros = 0;
  while (zeros < normalized.length && normalized[zeros] === '1') zeros += 1;
  let number = 0n;
  for (const char of normalized) {
    const index = BASE58.indexOf(char);
    if (index < 0) throw new Error('包含非法 Base58 字符');
    number = number * 58n + BigInt(index);
  }
  const bytes: number[] = [];
  while (number > 0n) {
    bytes.unshift(Number(number & 255n));
    number >>= 8n;
  }
  return Uint8Array.from([...new Array(zeros).fill(0), ...bytes]);
}

export function encodeBase85(bytes: Uint8Array): string {
  let output = '';
  for (let i = 0; i < bytes.length; i += 4) {
    const chunk = [0, 0, 0, 0];
    const size = Math.min(4, bytes.length - i);
    for (let j = 0; j < size; j += 1) chunk[j] = bytes[i + j];
    let value = ((chunk[0] << 24) | (chunk[1] << 16) | (chunk[2] << 8) | chunk[3]) >>> 0;
    const encoded = new Array(5);
    for (let j = 4; j >= 0; j -= 1) {
      encoded[j] = String.fromCharCode(33 + (value % 85));
      value = Math.floor(value / 85);
    }
    output += encoded.slice(0, size + 1).join('');
  }
  return output;
}

export function decodeBase85(value: string): Uint8Array {
  const normalized = value.replace(/\s+/g, '').replace(/^<~|~>$/g, '');
  const output: number[] = [];
  for (let i = 0; i < normalized.length; i += 5) {
    const chunk = normalized.slice(i, i + 5);
    const size = chunk.length;
    if (size < 2) throw new Error('Base85 数据长度不完整');
    let number = 0;
    for (let j = 0; j < 5; j += 1) {
      const code = j < size ? chunk.charCodeAt(j) - 33 : 84;
      if (code < 0 || code > 84) throw new Error('包含非法 Base85 字符');
      number = number * 85 + code;
    }
    const bytes = [(number >>> 24) & 255, (number >>> 16) & 255, (number >>> 8) & 255, number & 255];
    output.push(...bytes.slice(0, size - 1));
  }
  return Uint8Array.from(output);
}

export function encodeBase91(bytes: Uint8Array): string {
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer |= byte << bits;
    bits += 8;
    if (bits > 13) {
      let value = buffer & 8191;
      if (value > 88) {
        buffer >>>= 13;
        bits -= 13;
      } else {
        value = buffer & 16383;
        buffer >>>= 14;
        bits -= 14;
      }
      output += BASE91[value % 91] + BASE91[Math.floor(value / 91)];
    }
  }
  if (bits) {
    output += BASE91[buffer % 91];
    if (bits > 7 || buffer > 90) output += BASE91[Math.floor(buffer / 91)];
  }
  return output;
}

export function decodeBase91(value: string): Uint8Array {
  const normalized = value.replace(/\s+/g, '');
  let buffer = 0;
  let bits = 0;
  let previous = -1;
  const output: number[] = [];
  for (const char of normalized) {
    const code = BASE91.indexOf(char);
    if (code < 0) throw new Error('包含非法 Base91 字符');
    if (previous < 0) {
      previous = code;
      continue;
    }
    const combined = previous + code * 91;
    buffer |= combined << bits;
    bits += combined > 88 ? 13 : 14;
    while (bits >= 8) {
      output.push(buffer & 255);
      buffer >>>= 8;
      bits -= 8;
    }
    previous = -1;
  }
  if (previous >= 0) output.push((buffer | (previous << bits)) & 255);
  return Uint8Array.from(output);
}

export const BASE_SCHEMES = [
  { id: 'base16', label: 'Base16', encode: encodeBase16, decode: decodeBase16, case: 'upper' },
  { id: 'base32', label: 'Base32', encode: encodeBase32, decode: decodeBase32, case: 'upper' },
  { id: 'base58', label: 'Base58', encode: encodeBase58, decode: decodeBase58, case: 'mixed' },
  { id: 'base64', label: 'Base64', encode: bytesToBase64, decode: base64ToBytes, case: 'mixed' },
  { id: 'base85', label: 'Base85', encode: encodeBase85, decode: decodeBase85, case: 'mixed' },
  { id: 'base91', label: 'Base91', encode: encodeBase91, decode: decodeBase91, case: 'mixed' },
] as const;

export type BaseSchemeId = (typeof BASE_SCHEMES)[number]['id'];

export function formatUnicode(text: string, mode: 'escape' | 'codepoint' | 'html'): string {
  return [...text]
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;
      if (mode === 'codepoint') return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
      if (mode === 'html') return `&#x${code.toString(16).toUpperCase()};`;
      if (code <= 0xffff) return `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
      const adjusted = code - 0x10000;
      return `\\u${(0xd800 + (adjusted >> 10)).toString(16).toUpperCase()}\\u${(0xdc00 + (adjusted & 0x3ff)).toString(16).toUpperCase()}`;
    })
    .join('');
}

export function decodeUnicode(value: string): string {
  return value
    .replace(/\\u\{([0-9a-f]{1,6})\}/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/U\+([0-9a-f]{4,6})/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#x([0-9a-f]{1,6});?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d{1,7});?/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)));
}

export function convertBase(value: string, from: number, to: number): string {
  const normalized = value.trim().replace(/\s+/g, '').replace(/^0[xX]/, '');
  if (!normalized) return '';
  if (from < 2 || from > 36 || to < 2 || to > 36) throw new Error('进制必须在 2–36 之间');
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  let number = 0n;
  for (const char of normalized.toLowerCase()) {
    const digit = alphabet.indexOf(char);
    if (digit < 0 || digit >= from) throw new Error(`字符 ${char} 不属于 ${from} 进制`);
    number = number * BigInt(from) + BigInt(digit);
  }
  if (number === 0n) return '0';
  let output = '';
  while (number > 0n) {
    output = alphabet[Number(number % BigInt(to))] + output;
    number /= BigInt(to);
  }
  return output;
}

export function toBase64Url(value: string): string {
  return bytesToBase64(toBytes(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function fromBase64Url(value: string): string {
  return fromBytes(base64ToBytes(value));
}
