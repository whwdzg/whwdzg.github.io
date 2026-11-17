/** 最小 NBT / 投影解析器 / Minimal NBT reader for litematic & schematic files. */
export interface BlockState {
  id: string;
  properties: Record<string, string>;
}

export interface ProjectionBlock extends BlockState {
  x: number;
  y: number;
  z: number;
}

export interface Projection {
  name: string;
  size: { x: number; y: number; z: number };
  blocks: ProjectionBlock[];
  counts: Array<{ id: string; count: number }>;
}

class Reader {
  view: DataView;
  offset = 0;

  constructor(private bytes: Uint8Array) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  u8(): number {
    return this.view.getUint8(this.offset++);
  }

  i8(): number {
    return this.view.getInt8(this.offset++);
  }

  i16(): number {
    const value = this.view.getInt16(this.offset);
    this.offset += 2;
    return value;
  }

  i32(): number {
    const value = this.view.getInt32(this.offset);
    this.offset += 4;
    return value;
  }

  i64(): bigint {
    const value = this.view.getBigInt64(this.offset);
    this.offset += 8;
    return value;
  }

  f32(): number {
    const value = this.view.getFloat32(this.offset);
    this.offset += 4;
    return value;
  }

  f64(): number {
    const value = this.view.getFloat64(this.offset);
    this.offset += 8;
    return value;
  }

  string(): string {
    const length = this.view.getUint16(this.offset);
    this.offset += 2;
    const bytes = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return new TextDecoder().decode(bytes);
  }

  array(length: number): Uint8Array {
    const value = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }
}

function readTag(reader: Reader, type: number): unknown {
  switch (type) {
    case 1: return reader.i8();
    case 2: return reader.i16();
    case 3: return reader.i32();
    case 4: return reader.i64();
    case 5: return reader.f32();
    case 6: return reader.f64();
    case 7: {
      const length = reader.i32();
      return reader.array(length);
    }
    case 8: return reader.string();
    case 9: {
      const itemType = reader.u8();
      const length = reader.i32();
      return Array.from({ length }, () => readTag(reader, itemType));
    }
    case 10: {
      const value: Record<string, unknown> = {};
      for (;;) {
        const childType = reader.u8();
        if (childType === 0) break;
        const name = reader.string();
        value[name] = readTag(reader, childType);
      }
      return value;
    }
    case 11: {
      const length = reader.i32();
      return Array.from({ length }, () => reader.i32());
    }
    case 12: {
      const length = reader.i32();
      return Array.from({ length }, () => reader.i64());
    }
    default:
      throw new Error(`未知 NBT 类型 ${type}`);
  }
}

export function parseNbt(bytes: Uint8Array): unknown {
  const reader = new Reader(bytes);
  const type = reader.u8();
  if (type === 0) return null;
  reader.string(); // root name
  return readTag(reader, type);
}

async function decompress(bytes: Uint8Array): Promise<Uint8Array> {
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return bytes;
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, any>) : {};
}

function paletteEntry(entry: unknown): BlockState {
  const record = asRecord(entry);
  return { id: String(record.Name ?? record.name ?? 'minecraft:air'), properties: asRecord(record.Properties ?? record.properties) as Record<string, string> };
}

function parseLitematic(root: Record<string, any>): Projection {
  const regions = asRecord(root.Regions);
  const blocks: ProjectionBlock[] = [];
  for (const region of Object.values(regions)) {
    const record = asRecord(region);
    const position = asRecord(record.Position);
    const size = asRecord(record.Size);
    const palette = (record.BlockStatePalette as unknown[] | undefined)?.map(paletteEntry) ?? [];
    const longs = (record.BlockStates as bigint[] | undefined) ?? [];
    const sx = Math.abs(Number(size.x ?? 0));
    const sy = Math.abs(Number(size.y ?? 0));
    const sz = Math.abs(Number(size.z ?? 0));
    const total = sx * sy * sz;
    if (!total || !palette.length) continue;
    const bits = Math.max(1, Math.ceil(Math.log2(palette.length)));
    const mask = (1n << BigInt(bits)) - 1n;
    const px = Number(position.x ?? 0);
    const py = Number(position.y ?? 0);
    const pz = Number(position.z ?? 0);
    for (let index = 0; index < total; index += 1) {
      const bit = index * bits;
      const longIndex = Math.floor(bit / 64);
      const bitOffset = bit % 64;
      let value = (longs[longIndex] ?? 0n) >> BigInt(bitOffset);
      if (bitOffset + bits > 64) value |= (longs[longIndex + 1] ?? 0n) << BigInt(64 - bitOffset);
      const paletteIndex = Number(value & mask);
      const state = palette[paletteIndex] ?? { id: 'minecraft:air', properties: {} };
      const x = index % sx;
      const z = Math.floor(index / sx) % sz;
      const y = Math.floor(index / (sx * sz));
      if (state.id === 'minecraft:air' || state.id === 'minecraft:cave_air') continue;
      blocks.push({ ...state, x: px + x, y: py + y, z: pz + z });
    }
  }

  return finishProjection(blocks);
}

function parseSchematic(root: Record<string, any>): Projection {
  const width = Number(root.Width ?? root.width ?? 0);
  const height = Number(root.Height ?? root.height ?? 0);
  const length = Number(root.Length ?? root.length ?? 0);
  const data = (root.BlockData ?? root.blocks ?? root.Blocks) as Uint8Array | undefined;
  if (!width || !height || !length || !data) throw new Error('schematic 缺少尺寸或方块数据');
  const paletteRaw = root.Palette ?? root.palette;
  const palette: BlockState[] = [];
  if (Array.isArray(paletteRaw)) {
    for (const entry of paletteRaw) palette.push(paletteEntry(entry));
  } else if (paletteRaw && typeof paletteRaw === 'object') {
    for (const [id, index] of Object.entries(paletteRaw)) {
      const match = id.match(/^([^[]+)(?:\[(.*)\])?$/);
      const properties: Record<string, string> = {};
      if (match?.[2]) {
        for (const pair of match[2].split(',')) {
          const [key, value] = pair.split('=');
          if (key && value) properties[key.trim()] = value.trim();
        }
      }
      palette[Number(index)] = { id: match?.[1]?.trim() ?? id, properties };
    }
  }
  const blocks: ProjectionBlock[] = [];
  for (let index = 0; index < data.length; index += 1) {
    const state = palette[data[index]];
    if (!state || state.id === 'minecraft:air') continue;
    const x = index % width;
    const z = Math.floor(index / width) % length;
    const y = Math.floor(index / (width * length));
    blocks.push({ ...state, x, y, z });
  }
  return finishProjection(blocks);
}

function finishProjection(blocks: ProjectionBlock[], transform?: (value: number) => number): Projection {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const block of blocks) {
    block.x = transform ? transform(block.x) : block.x;
    block.y = transform ? transform(block.y) : block.y;
    block.z = transform ? transform(block.z) : block.z;
    minX = Math.min(minX, block.x); minY = Math.min(minY, block.y); minZ = Math.min(minZ, block.z);
    maxX = Math.max(maxX, block.x); maxY = Math.max(maxY, block.y); maxZ = Math.max(maxZ, block.z);
  }
  if (!blocks.length) {
    minX = 0; minY = 0; minZ = 0; maxX = 0; maxY = 0; maxZ = 0;
  }
  const normalized = blocks.map((block) => ({ ...block, x: block.x - minX, y: block.y - minY, z: block.z - minZ }));
  const counts = new Map<string, number>();
  for (const block of normalized) counts.set(block.id, (counts.get(block.id) ?? 0) + 1);
  return {
    name: '',
    size: { x: maxX - minX + 1 || 1, y: maxY - minY + 1 || 1, z: maxZ - minZ + 1 || 1 },
    blocks: normalized,
    counts: [...counts.entries()].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count),
  };
}

export async function parseProjectionFile(file: File): Promise<Projection> {
  const decompressed = await decompress(new Uint8Array(await file.arrayBuffer()));
  const root = asRecord(parseNbt(decompressed));
  const projection = root.Regions ? parseLitematic(root) : parseSchematic(root);
  projection.name = file.name.replace(/\.(litematic|schematic|schem|nbt)$/i, '');
  return projection;
}

export function blockStateKey(block: BlockState): string {
  const entries = Object.entries(block.properties ?? {}).sort(([a], [b]) => a.localeCompare(b));
  return entries.length ? `${block.id}[${entries.map(([key, value]) => `${key}=${value}`).join(',')}]` : block.id;
}
