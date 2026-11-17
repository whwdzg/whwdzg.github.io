/** Minecraft blockstate / model loader for the projection viewer. */
import type { BlockState } from './nbt';

const ASSET_ROOT = '/mc-assets/minecraft';
const jsonCache = new Map<string, Promise<any>>();
const textureCache = new Map<string, Promise<string | null>>();

async function loadJson(path: string): Promise<any> {
  const key = `${ASSET_ROOT}/${path}`;
  if (!jsonCache.has(key)) {
    jsonCache.set(
      key,
      fetch(key)
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null),
    );
  }
  return jsonCache.get(key);
}

export interface ModelElement {
  from: [number, number, number];
  to: [number, number, number];
  texture: string | null;
  rotation?: { origin: [number, number, number]; axis: 'x' | 'y' | 'z'; angle: number };
  shade: boolean;
}

export interface ModelPart {
  elements: ModelElement[];
  rotationX: number;
  rotationY: number;
}

function matches(when: any, props: Record<string, string>): boolean {
  if (!when) return true;
  if (when.OR) return (when.OR as any[]).some((entry) => matches(entry, props));
  if (when.AND) return (when.AND as any[]).every((entry) => matches(entry, props));
  return Object.entries(when).every(([key, expected]) => {
    if (key === 'OR' || key === 'AND') return true;
    const value = props[key];
    if (typeof expected === 'string') {
      return expected.split('|').includes(value);
    }
    return true;
  });
}

async function resolveModel(modelId: string, depth = 0): Promise<{ elements: any[]; textures: Record<string, string> }> {
  if (!modelId || depth > 8) return { elements: [], textures: {} };
  const clean = modelId.replace(/^minecraft:/, '');
  const model = await loadJson(`models/${clean}.json`);
  if (!model) return { elements: [], textures: {} };
  let elements = Array.isArray(model.elements) ? model.elements : [];
  let textures = { ...(model.textures ?? {}) };
  if (model.parent) {
    const parent = await resolveModel(model.parent, depth + 1);
    if (!elements.length) elements = parent.elements;
    textures = { ...parent.textures, ...textures };
  }
  return { elements, textures };
}

function texturePath(value: string | undefined, textures: Record<string, string>, depth = 0): string | null {
  if (typeof value !== 'string' || !value || depth > 8) return null;
  if (value.startsWith('#')) {
    const key = value.slice(1);
    return texturePath(textures[key], textures, depth + 1);
  }
  const clean = value.replace(/^minecraft:/, '');
  return `${ASSET_ROOT}/textures/${clean}.png`;
}

function firstTexture(textures: Record<string, string>): string | null {
  for (const key of ['particle', 'all', 'side', 'top', 'front', 'texture', 'layer0', 'end']) {
    const path = texturePath(textures[key], textures);
    if (path) return path;
  }
  for (const value of Object.values(textures)) {
    const path = texturePath(value, textures);
    if (path) return path;
  }
  return null;
}

function elementTexture(element: any, textures: Record<string, string>): string | null {
  for (const face of Object.values(element.faces ?? {})) {
    const value = (face as any)?.texture;
    const path = texturePath(value, textures);
    if (path) return path;
  }
  return firstTexture(textures);
}

export async function blockModel(block: BlockState): Promise<ModelPart[]> {
  const name = block.id.replace(/^minecraft:/, '');
  const blockstate = await loadJson(`blockstates/${name}.json`);
  if (!blockstate) return [];

  const parts: Array<{ model: string; x?: number; y?: number; weight?: number }> = [];
  if (blockstate.variants) {
    const variants = blockstate.variants as Record<string, any>;
    const keys = Object.keys(variants);
    const matched = keys.filter((key) => matches(Object.fromEntries(key.split(',').filter(Boolean).map((pair) => pair.split('='))), block.properties));
    const chosen = variants[matched[0] ?? keys[0]];
    const entry = Array.isArray(chosen) ? chosen[0] : chosen;
    if (entry?.model) parts.push(entry);
  } else if (Array.isArray(blockstate.multipart)) {
    for (const part of blockstate.multipart) {
      if (matches(part.when, block.properties) && part.apply?.model) parts.push(part.apply);
    }
  }

  if (!parts.length) return [];
  const output: ModelPart[] = [];
  for (const part of parts) {
    const model = await resolveModel(part.model);
    let elements = model.elements;
    const fallbackTexture = firstTexture(model.textures);
    if (!elements.length) {
      elements = [{ from: [0, 0, 0], to: [16, 16, 16], texture: fallbackTexture }];
    }
    const resolved = elements
      .filter((element) => Array.isArray(element.from) && Array.isArray(element.to))
      .map((element) => ({
        from: element.from as [number, number, number],
        to: element.to as [number, number, number],
        texture: element.texture ?? elementTexture(element, model.textures) ?? fallbackTexture,
        rotation: element.rotation,
        shade: element.shade !== false,
      }));
    output.push({
      elements: resolved,
      rotationX: Number(part.x ?? 0),
      rotationY: Number(part.y ?? 0),
    });
  }
  return output;
}

export function textureUrlFromPath(path: string | null): string | null {
  return path;
}

export function preloadTexture(path: string): Promise<string | null> {
  if (!textureCache.has(path)) {
    textureCache.set(
      path,
      fetch(path)
        .then((response) => (response.ok ? path : null))
        .catch(() => null),
    );
  }
  return textureCache.get(path) ?? Promise.resolve(null);
}
