import { describe, expect, it } from 'vitest';
import { analyzeText } from './ai-detect';

describe('AI text inspection', () => {
  it('flags explicit AI watermarks with high confidence', () => {
    const report = analyzeText('这段内容由 AI 生成，仅供参考。');
    expect(report.findings.some((finding) => finding.id === 'text-watermark')).toBe(true);
    expect(report.score).toBeGreaterThanOrEqual(40);
  });

  it('counts invisible watermark characters', () => {
    const report = analyzeText('正常文字\u200B\u200C\u200D和隐藏标记');
    expect(report.invisibleCount).toBe(3);
    expect(report.findings.some((finding) => finding.id === 'invisible')).toBe(true);
  });

  it('reports habitual expressions without pretending certainty', () => {
    const report = analyzeText('首先，我们需要理解问题。其次，我们需要分析问题。最后，值得注意的是，希望这些内容对你有所帮助。');
    expect(report.matchedPhrases.length).toBeGreaterThan(0);
    expect(['信息不足，倾向不确定', '未发现明显 AI 生成特征']).toContain(report.label);
  });
});
