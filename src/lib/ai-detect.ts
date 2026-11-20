/** 启发式 AI 内容痕迹分析 / Heuristic AI-content inspection.
 *
 * 这不是模型检测器，也不修改或验证任何水印。
 * 目标是把可解释的线索（文件信息、生成参数、C2PA 标记、隐形字符、惯用表达）
 * 汇总成逐项结果和保守的最终判断。
 */

export type FindingTone = 'ai' | 'human' | 'neutral';
export type Confidence = '低' | '中' | '高';

export interface Finding {
  id: string;
  category: string;
  result: FindingTone;
  weight: number;
  title: string;
  detail: string;
  evidence?: string;
}

export interface ImageFileInfo {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  lastModified: number;
}

export interface ImageAnalysis {
  kind: 'image';
  score: number;
  label: string;
  confidence: Confidence;
  summary: string;
  findings: Finding[];
  fileInfo: ImageFileInfo;
  metadata: Array<{ key: string; value: string }>;
  extractedText: string;
}

export interface TextAnalysis {
  kind: 'text';
  score: number;
  label: string;
  confidence: Confidence;
  summary: string;
  findings: Finding[];
  invisibleCount: number;
  matchedPhrases: string[];
  stats: {
    characters: number;
    paragraphs: number;
    sentences: number;
    averageSentenceLength: number;
    bulletLines: number;
  };
}

interface Marker {
  name: string;
  pattern: RegExp;
  weight: number;
  category: string;
  detail: string;
}

const WATERMARK_MARKERS: Marker[] = [
  { name: '显式 AI 水印', pattern: /(?:AI\s*生成|由\s*AI\s*生成|AI\s*生成内容|人工智能生成|AI-generated|generated\s+by\s+(?:AI|OpenAI|Midjourney|DALL|Stable\s+Diffusion|Firefly)|Created\s+with\s+(?:Midjourney|DALL|Firefly|Stable\s+Diffusion))/i, weight: 45, category: '文字水印', detail: '文件元数据或文件名中出现显式 AI 生成标注。' },
  { name: '生成平台署名', pattern: /(?:Midjourney|DALL[·\- ]?E|Stable\s+Diffusion|Adobe\s+Firefly|NovelAI|ComfyUI|AUTOMATIC1111|InvokeAI|Leonardo\.ai|Ideogram|即梦|可灵|通义万相|文心一格|豆包图片|混元图像)/i, weight: 25, category: '文字水印', detail: '出现常见 AI 图像生成平台或工作流名称。' },
];

const GENERATOR_MARKERS: Marker[] = [
  { name: 'Stable Diffusion 参数', pattern: /(?:^|\n)\s*(?:Steps|Sampler|CFG\s*scale|Seed|Model hash|Negative prompt|Denoising strength)\s*:/i, weight: 38, category: '生成参数', detail: '检测到 Stable Diffusion / A1111 常见的生成参数键。' },
  { name: '生成提示词', pattern: /(?:"?(?:positive\s+)?prompt"?\s*[:=]\s*["']?.{10,}|(?:"?negative\s+prompt"?\s*[:=]))/i, weight: 26, category: '生成参数', detail: '元数据中存在 prompt / negative prompt 字段。' },
  { name: 'ComfyUI 工作流', pattern: /(?:ComfyUI|workflow\.json|KSampler|CheckpointLoaderSimple|CLIPTextEncode)/i, weight: 34, category: '生成参数', detail: '出现 ComfyUI / 节点式生成工作流字段。' },
  { name: 'NovelAI 元数据', pattern: /(?:NovelAI|nai\.diffusion|smea|uc\s*:)/i, weight: 30, category: '生成参数', detail: '出现 NovelAI 相关的生成元数据。' },
  { name: 'C2PA / Content Credentials', pattern: /(?:c2pa|content\s+credentials|jumbf|digitalSourceType|trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia)/i, weight: 42, category: '隐形水印', detail: '发现内容凭证或 C2PA 相关标记；若含 trainedAlgorithmicMedia，通常表示生成式 AI。' },
  { name: 'AI 软件字段', pattern: /(?:Software\s*[:=]\s*["']?(?:Adobe\s+Firefly|Midjourney|DALL|Stable\s+Diffusion|ComfyUI|NovelAI|InvokeAI))/i, weight: 28, category: '文件信息', detail: 'Software / CreatorTool 字段指向 AI 生成工具。' },
];

const CAMERA_KEYS = [
  /^(Make|Model|LensModel|DateTimeOriginal|CreateDate|ExposureTime|FNumber|ISO|ISOSpeedRatings|FocalLength|GPSLatitude|GPSLongitude|Flash|WhiteBalance)$/i,
];

const AI_PHRASES: Array<{ label: string; pattern: RegExp; weight: number }> = [
  { label: '首先 / 其次 / 最后', pattern: /首先[\s\S]{0,180}?其次|其次[\s\S]{0,180}?最后/, weight: 6 },
  { label: '综上所述 / 总而言之', pattern: /综上所述|总而言之|总的来说|总之/, weight: 5 },
  { label: '值得注意的是', pattern: /值得注意的是|需要注意的是|不可否认的是|不难发现|显而易见/, weight: 5 },
  { label: '在当今时代', pattern: /在当今|在这个.{0,12}的时代|随着.{0,18}的(?:发展|普及|到来)/, weight: 5 },
  { label: '赋能 / 闭环 / 抓手', pattern: /赋能|闭环|抓手|底层逻辑|颗粒度|深度融合|持续迭代|多维度|全方位/, weight: 7 },
  { label: '希望对你有所帮助', pattern: /希望(?:这些|以上|本文)?.{0,12}(?:帮助|参考)|希望对你有帮助|希望对您有帮助/, weight: 8 },
  { label: '让我们 / 一起', pattern: /让我们一起|让我们共同|让我们来|一起探索|一起看看/, weight: 4 },
  { label: '不仅……而且……', pattern: /不仅[\s\S]{0,60}?而且|一方面[\s\S]{0,60}?另一方面/, weight: 4 },
  { label: '标准三段式', pattern: /是什么[\s\S]{0,80}?为什么[\s\S]{0,80}?怎么做|提出问题[\s\S]{0,60}?分析问题[\s\S]{0,60}?解决问题/, weight: 5 },
];

const EXPLICIT_TEXT_WATERMARKS = /(?:AI\s*生成|由\s*AI\s*生成|AI-generated|Generated\s+by\s+(?:AI|ChatGPT|Claude|Gemini|Copilot)|内容由\s*AI|本文由\s*AI|本回答由\s*AI|ChatGPT|Claude|Gemini|文心一言|通义千问|豆包|Kimi|DeepSeek\s*生成)/i;

const ZERO_WIDTH_RE = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF\uFE00-\uFE0F]|[\u{E0000}-\u{E007F}]/gu;

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function verdictFor(score: number): { label: string; confidence: Confidence; summary: string } {
  if (score >= 60) {
    return {
      label: '较可能为 AI 生成',
      confidence: '高',
      summary: '发现与 AI 生成直接相关的强线索；仍建议结合原始文件、生成记录和人工核验。',
    };
  }
  if (score >= 40) {
    return {
      label: '存在 AI 生成特征',
      confidence: '中',
      summary: '多项间接线索同时出现，倾向 AI 生成，但不足以作为单独证据。',
    };
  }
  if (score >= 20) {
    return {
      label: '信息不足，倾向不确定',
      confidence: '低',
      summary: '只有弱线索，无法可靠区分 AI 与人工内容。',
    };
  }
  return {
    label: '未发现明显 AI 生成特征',
    confidence: '低',
    summary: '当前可见信息中没有明显生成标记；这不代表内容一定由人工完成。',
  };
}

function flattenMetadata(value: unknown, prefix = '', out: Array<{ key: string; value: string }>, depth = 0): void {
  if (out.length >= 60 || depth > 3 || value == null) return;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value).replace(/\s+/g, ' ').trim();
    if (text && text.length < 1200) out.push({ key: prefix || 'value', value: text });
    return;
  }
  if (Array.isArray(value)) {
    value.slice(0, 12).forEach((entry, index) => flattenMetadata(entry, `${prefix}[${index}]`, out, depth + 1));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, entry] of Object.entries(value as Record<string, unknown>).slice(0, 40)) {
      flattenMetadata(entry, prefix ? `${prefix}.${key}` : key, out, depth + 1);
      if (out.length >= 60) break;
    }
  }
}

function decodeText(bytes: Uint8Array): string {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  return decoder.decode(bytes).replace(/\u0000/g, ' ').trim();
}

function readPngChunks(buffer: ArrayBuffer): { text: string; chunkTypes: string[] } {
  const bytes = new Uint8Array(buffer);
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 8 || signature.some((byte, index) => bytes[index] !== byte)) return { text: '', chunkTypes: [] };
  const view = new DataView(buffer);
  const parts: string[] = [];
  const chunkTypes: string[] = [];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    if (length > bytes.length - offset - 12) break;
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    chunkTypes.push(type);
    const data = bytes.slice(offset + 8, offset + 8 + length);
    if (type === 'tEXt') {
      const split = data.indexOf(0);
      if (split >= 0) parts.push(`${decodeText(data.slice(0, split))}: ${decodeText(data.slice(split + 1))}`);
    } else if (type === 'iTXt') {
      const split = data.indexOf(0);
      if (split >= 0) {
        const rest = data.slice(split + 1);
        const compression = rest[0] ?? 0;
        const rest2 = rest.slice(2);
        const langEnd = rest2.indexOf(0);
        const translatedStart = langEnd >= 0 ? langEnd + 1 : 0;
        const translatedEnd = rest2.indexOf(0, translatedStart);
        const textStart = translatedEnd >= 0 ? translatedEnd + 1 : translatedStart;
        if (compression === 0) parts.push(`${decodeText(data.slice(0, split))}: ${decodeText(rest2.slice(textStart))}`);
      }
    } else if (type === 'caBX' || type === 'jumb') {
      parts.push(`C2PA/JUMBF 内容凭证块：${type}`);
    }
    offset += 12 + length;
  }
  return { text: parts.join('\n'), chunkTypes };
}

function collectStrings(value: unknown, out: string[], depth = 0): void {
  if (out.length >= 80 || depth > 4 || value == null) return;
  if (typeof value === 'string') {
    if (value.trim()) out.push(value);
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    value.slice(0, 30).forEach((entry) => collectStrings(entry, out, depth + 1));
    return;
  }
  if (typeof value === 'object') {
    for (const entry of Object.values(value as Record<string, unknown>).slice(0, 50)) collectStrings(entry, out, depth + 1);
  }
}

function markerFinding(marker: Marker, source: string): Finding | null {
  const match = source.match(marker.pattern);
  if (!match) return null;
  const start = Math.max(0, (match.index ?? 0) - 34);
  return {
    id: `marker-${marker.name}`,
    category: marker.category,
    result: 'ai',
    weight: marker.weight,
    title: marker.name,
    detail: marker.detail,
    evidence: source.slice(start, start + 170).replace(/\s+/g, ' ').trim(),
  };
}

export async function analyzeImage(file: File, visibleText = ''): Promise<ImageAnalysis> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const raw = decodeText(bytes.slice(0, Math.min(bytes.length, 4_000_000)));
  const png = readPngChunks(buffer);
  const source = [file.name, raw, png.text, visibleText].join('\n');

  let metadata: Array<{ key: string; value: string }> = [];
  try {
    const exifr = await import('exifr');
    const parsed = await exifr.parse(buffer, {
      tiff: true,
      xmp: true,
      icc: false,
      iptc: true,
      jfif: true,
      ihdr: true,
      mergeOutput: false,
      translateValues: false,
      reviveValues: false,
    });
    if (parsed) flattenMetadata(parsed, '', metadata);
  } catch {
    // 没有 EXIF/XMP 或格式不受支持时继续使用 PNG 文本块和原始字符串。
  }

  if (png.text) metadata.unshift({ key: 'PNG 文本块', value: png.text });
  if (png.chunkTypes.includes('caBX')) metadata.unshift({ key: 'PNG 内容凭证', value: 'caBX / C2PA' });

  const allStrings: string[] = [];
  collectStrings(metadata, allStrings);
  const searchable = [source, ...allStrings].join('\n');
  const findings: Finding[] = [];

  for (const marker of [...WATERMARK_MARKERS, ...GENERATOR_MARKERS]) {
    const finding = markerFinding(marker, searchable);
    if (finding) findings.push(finding);
  }

  if (/(?:c2pa|jumbf|caBX|content credentials)/i.test(searchable)) {
    findings.push({
      id: 'c2pa',
      category: '隐形水印',
      result: 'ai',
      weight: 32,
      title: '发现内容凭证结构',
      detail: '文件包含 C2PA / JUMBF 结构或相关标记。内容凭证本身不等于 AI，但其中的生成式声明是强线索。',
      evidence: 'c2pa / jumbf / caBX',
    });
  }

  const cameraKeys = new Set<string>();
  for (const entry of metadata) {
    if (CAMERA_KEYS.some((pattern) => pattern.test(entry.key.split('.').pop() ?? ''))) cameraKeys.add(entry.key);
  }
  if (cameraKeys.size >= 3) {
    findings.push({
      id: 'camera',
      category: '文件信息',
      result: 'human',
      weight: -24,
      title: '存在相机拍摄元数据',
      detail: '检测到多项相机 / 曝光 / 镜头字段，支持“由相机或手机拍摄”的解释；这些字段也可以被伪造。',
      evidence: [...cameraKeys].slice(0, 8).join(' · '),
    });
  }

  if (visibleText.trim()) {
    const visibleMarker = markerFinding(WATERMARK_MARKERS[0], visibleText) ?? markerFinding(WATERMARK_MARKERS[1], visibleText);
    if (visibleMarker) {
      findings.push({
        ...visibleMarker,
        id: 'visible-text',
        category: '文字水印',
        weight: 35,
        title: '画面文字包含 AI 标注',
        detail: '用户提供的画面文字中出现 AI 生成或生成平台标注。',
        evidence: visibleText.slice(0, 170),
      });
    }
  }

  const generatorFinding = findings.find((finding) => finding.category === '生成参数' || finding.id === 'c2pa');
  const score = clampScore(findings.reduce((sum, finding) => sum + finding.weight, 0));
  const verdict = verdictFor(score);
  if (generatorFinding && verdict.confidence === '低') verdict.confidence = '中';

  if (!findings.length) {
    findings.push({
      id: 'none',
      category: '文件信息',
      result: 'neutral',
      weight: 0,
      title: '没有发现已知标记',
      detail: '没有检测到生成参数、C2PA、平台署名或相机字段。缺少线索不等于内容由人工完成。',
      evidence: `已检查 ${metadata.length} 个元数据字段`,
    });
  }

  let width = 0;
  let height = 0;
  try {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    bitmap.close();
  } catch {
    // 某些格式无法在浏览器解码；保留文件信息即可。
  }

  return {
    kind: 'image',
    score,
    label: verdict.label,
    confidence: verdict.confidence,
    summary: verdict.summary,
    findings,
    fileInfo: {
      name: file.name,
      type: file.type || '未知',
      size: file.size,
      width,
      height,
      lastModified: file.lastModified,
    },
    metadata: metadata.slice(0, 40),
    extractedText: png.text,
  };
}

export function analyzeText(input: string): TextAnalysis {
  const text = input.replace(/\r\n?/g, '\n');
  const findings: Finding[] = [];
  const invisibleMatches = [...text.matchAll(ZERO_WIDTH_RE)];
  const invisibleCount = invisibleMatches.length;

  if (invisibleCount > 0) {
    const types = new Set(invisibleMatches.map((match) => `U+${(match[0].codePointAt(0) ?? 0).toString(16).toUpperCase()}`));
    findings.push({
      id: 'invisible',
      category: '隐形水印',
      result: 'ai',
      weight: invisibleCount >= 8 ? 34 : 22,
      title: `检测到 ${invisibleCount} 个不可见/格式字符`,
      detail: '零宽字符、双向控制符或 Unicode 标签字符可能用于隐形标记；也可能来自复制粘贴或排版工具。',
      evidence: [...types].slice(0, 8).join(' · '),
    });
  }

  const watermarkMatch = text.match(EXPLICIT_TEXT_WATERMARKS);
  if (watermarkMatch) {
    findings.push({
      id: 'text-watermark',
      category: '文字水印',
      result: 'ai',
      weight: 50,
      title: '发现显式 AI 生成标注',
      detail: '文本中包含“AI 生成”“Generated by …”或常见生成平台署名。',
      evidence: text.slice(Math.max(0, (watermarkMatch.index ?? 0) - 35), (watermarkMatch.index ?? 0) + 120).trim(),
    });
  }

  const matchedPhrases: string[] = [];
  let phraseWeight = 0;
  for (const phrase of AI_PHRASES) {
    if (phrase.pattern.test(text)) {
      matchedPhrases.push(phrase.label);
      phraseWeight += phrase.weight;
    }
  }
  if (matchedPhrases.length) {
    findings.push({
      id: 'phrases',
      category: '惯用词',
      result: 'ai',
      weight: Math.min(30, phraseWeight),
      title: `命中 ${matchedPhrases.length} 组常见 AI 表达`,
      detail: '这些表达在人工写作中同样常见，只作为写作风格线索，不作为单独证据。',
      evidence: matchedPhrases.join(' · '),
    });
  }

  const paragraphs = text.split(/\n\s*\n/).map((item) => item.trim()).filter((item) => item.length > 12);
  const sentences = text.split(/[。！？!?；;]+/).map((item) => item.trim()).filter((item) => item.length > 5);
  const lengths = sentences.map((sentence) => sentence.length);
  const averageLength = lengths.length ? lengths.reduce((sum, value) => sum + value, 0) / lengths.length : 0;
  const variance = lengths.length > 1
    ? lengths.reduce((sum, value) => sum + (value - averageLength) ** 2, 0) / lengths.length
    : 0;
  const bulletLines = text.split('\n').filter((line) => /^\s*(?:[-*+]|\d+[.)])\s+/.test(line)).length;

  const structureSignals: string[] = [];
  if (sentences.length >= 6 && variance < 150 && averageLength > 18) structureSignals.push('句长分布较均匀');
  if (paragraphs.length >= 4 && paragraphs.every((paragraph) => paragraph.length > 80 && paragraph.length < 500)) structureSignals.push('段落长度接近');
  if (bulletLines >= 5 && bulletLines / Math.max(1, text.split('\n').length) > 0.45) structureSignals.push('列表密度高');
  if (structureSignals.length) {
    findings.push({
      id: 'structure',
      category: '结构特征',
      result: 'ai',
      weight: Math.min(18, structureSignals.length * 6),
      title: '结构较为规整',
      detail: '句式、段落或列表分布过于均匀时，可能是模板化生成的侧面特征；不能单独用于判断。',
      evidence: structureSignals.join(' · '),
    });
  }

  if (!findings.length) {
    findings.push({
      id: 'none',
      category: '文本信息',
      result: 'neutral',
      weight: 0,
      title: '没有发现明显标记',
      detail: '没有检测到显式 AI 标注、隐形字符或高频模板表达。该结果不代表内容一定由人工完成。',
      evidence: `${sentences.length} 个句子 · ${paragraphs.length} 个段落`,
    });
  }

  const score = clampScore(findings.reduce((sum, finding) => sum + finding.weight, 0));
  const verdict = verdictFor(score);
  if (watermarkMatch) verdict.confidence = '高';

  return {
    kind: 'text',
    score,
    label: verdict.label,
    confidence: verdict.confidence,
    summary: verdict.summary,
    findings,
    invisibleCount,
    matchedPhrases,
    stats: {
      characters: [...text].length,
      paragraphs: paragraphs.length,
      sentences: sentences.length,
      averageSentenceLength: Math.round(averageLength * 10) / 10,
      bulletLines,
    },
  };
}
