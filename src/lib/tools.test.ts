import { describe, expect, it } from 'vitest';
import {
  base64ToBytes,
  bytesToBase64,
  convertBase,
  decodeBase32,
  decodeBase58,
  decodeBase85,
  decodeBase91,
  decodeUnicode,
  encodeBase32,
  encodeBase58,
  encodeBase85,
  encodeBase91,
  formatUnicode,
  fromBytes,
  toBytes,
} from './tools/codecs';
import { evaluateExpression, expressionToLatex, latexToExpression } from './tools/expression';

const sample = '沧海水鱼 · Minecraft 2026';

describe('tool codecs', () => {
  it('round-trips UTF-8 through Base64 / 32 / 58 / 85 / 91', () => {
    const bytes = toBytes(sample);
    expect(fromBytes(base64ToBytes(bytesToBase64(bytes)))).toBe(sample);
    expect(fromBytes(decodeBase32(encodeBase32(bytes)))).toBe(sample);
    expect(fromBytes(decodeBase58(encodeBase58(bytes)))).toBe(sample);
    expect(fromBytes(decodeBase85(encodeBase85(bytes)))).toBe(sample);
    expect(fromBytes(decodeBase91(encodeBase91(bytes)))).toBe(sample);
  });

  it('converts integer bases', () => {
    expect(convertBase('2026', 10, 16)).toBe('7ea');
    expect(convertBase('ff', 16, 2)).toBe('11111111');
    expect(convertBase('101010', 2, 10)).toBe('42');
  });

  it('encodes and decodes Unicode formats', () => {
    expect(formatUnicode('水', 'escape')).toBe('\\u6C34');
    expect(decodeUnicode('\\u6C34\\u9C7C&#x6D77;')).toBe('水鱼海');
  });
});

describe('calculator expression engine', () => {
  it('evaluates precedence, functions and constants', () => {
    expect(evaluateExpression('1 + 2 * 3')).toBe(7);
    expect(evaluateExpression('sin(30)', { angleMode: 'deg' })).toBeCloseTo(0.5, 8);
    expect(evaluateExpression('sqrt(81) + 2^3')).toBe(17);
    expect(evaluateExpression('5!')).toBe(120);
  });

  it('converts simple expressions to LaTeX and back', () => {
    const latex = expressionToLatex('1/2 + sqrt(9)');
    expect(latex).toContain('\\frac{1}{2}');
    expect(latex).toContain('\\sqrt');
    expect(evaluateExpression(latexToExpression('\\frac{1}{2} + \\sqrt{9}'))).toBe(3.5);
  });
});
