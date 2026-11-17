/** 科学计算器表达式解析 / Tiny expression parser with LaTeX output. */

export type AngleMode = 'deg' | 'rad' | 'grad';

type Node =
  | { type: 'number'; value: number }
  | { type: 'variable'; name: string }
  | { type: 'unary'; op: '+' | '-'; value: Node }
  | { type: 'binary'; op: '+' | '-' | '*' | '/' | '^'; left: Node; right: Node }
  | { type: 'postfix'; op: '!' | '%'; value: Node }
  | { type: 'call'; name: string; args: Node[] };

interface Token {
  type: 'number' | 'name' | 'op' | '(' | ')' | ',' | '!' | '%';
  value: string;
}

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
  'log', 'ln', 'sqrt', 'cbrt', 'abs', 'exp', 'floor', 'ceil', 'round',
  'min', 'max', 'pow', 'npr', 'ncr', 'gcd', 'lcm', 'int', 'intg', 'rnd',
  'rand', 'ranint', 'pol', 'rec', 'sign',
]);

function normalize(input: string): string {
  return input
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–]/g, '-')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/Ans/g, 'ans')
    .replace(/\s+/g, '');
}

function tokenize(input: string): Token[] {
  const source = normalize(input);
  const tokens: Token[] = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index];
    if (/[0-9.]/.test(char)) {
      let value = char;
      index += 1;
      while (index < source.length && /[0-9.]/.test(source[index])) value += source[index++];
      while (index < source.length && /[eE]/.test(source[index])) {
        value += source[index++];
        if (source[index] === '+' || source[index] === '-') value += source[index++];
        while (index < source.length && /[0-9]/.test(source[index])) value += source[index++];
      }
      tokens.push({ type: 'number', value });
      continue;
    }
    if (/[a-zA-Z_]/.test(char)) {
      let value = char;
      index += 1;
      while (index < source.length && /[a-zA-Z_0-9]/.test(source[index])) value += source[index++];
      tokens.push({ type: 'name', value });
      continue;
    }
    if ('+-*/^'.includes(char)) {
      tokens.push({ type: 'op', value: char });
      index += 1;
      continue;
    }
    if (char === '(' || char === ')' || char === ',' || char === '!' || char === '%') {
      tokens.push({ type: char, value: char });
      index += 1;
      continue;
    }
    throw new Error(`无法识别字符：${char}`);
  }
  return tokens;
}

class Parser {
  private index = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): Node {
    const node = this.expression();
    if (this.index < this.tokens.length) throw new Error('表达式末尾存在多余内容');
    return node;
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private take(): Token | undefined {
    return this.tokens[this.index++];
  }

  private expression(): Node {
    let left = this.term();
    while (this.peek()?.type === 'op' && (this.peek()?.value === '+' || this.peek()?.value === '-')) {
      const op = this.take()!.value as '+' | '-';
      left = { type: 'binary', op, left, right: this.term() };
    }
    return left;
  }

  private term(): Node {
    let left = this.power();
    for (;;) {
      const token = this.peek();
      if (token?.type === 'op' && (token.value === '*' || token.value === '/')) {
        this.take();
        left = { type: 'binary', op: token.value as '*' | '/', left, right: this.power() };
        continue;
      }
      // 隐式乘法：2pi / 2(3+4) / 2sin(30)
      if (token && (token.type === 'number' || token.type === 'name' || token.type === '(')) {
        left = { type: 'binary', op: '*', left, right: this.power() };
        continue;
      }
      return left;
    }
  }

  private power(): Node {
    const left = this.unary();
    if (this.peek()?.type === 'op' && this.peek()?.value === '^') {
      this.take();
      return { type: 'binary', op: '^', left, right: this.power() };
    }
    return left;
  }

  private unary(): Node {
    const token = this.peek();
    if (token?.type === 'op' && (token.value === '+' || token.value === '-')) {
      this.take();
      return { type: 'unary', op: token.value, value: this.unary() };
    }
    return this.postfix();
  }

  private postfix(): Node {
    let value = this.primary();
    for (;;) {
      const token = this.peek();
      if (token?.type === '!' || token?.type === '%') {
        this.take();
        value = { type: 'postfix', op: token.type, value };
        continue;
      }
      return value;
    }
  }

  private primary(): Node {
    const token = this.take();
    if (!token) throw new Error('表达式不完整');
    if (token.type === 'number') {
      const value = Number(token.value);
      if (!Number.isFinite(value)) throw new Error('数字格式错误');
      return { type: 'number', value };
    }
    if (token.type === 'name') {
      const lower = token.value.toLowerCase();
      if (lower === 'pi' || lower === 'e' || lower === 'ans' || 'abcdefxyz'.includes(lower)) {
        return { type: 'variable', name: lower };
      }
      if (!FUNCTIONS.has(lower)) throw new Error(`未知函数或变量：${token.value}`);
      if (this.peek()?.type !== '(') throw new Error(`函数 ${token.value} 需要括号`);
      this.take();
      const args: Node[] = [];
      if (this.peek()?.type !== ')') {
        args.push(this.expression());
        while (this.peek()?.type === ',') {
          this.take();
          args.push(this.expression());
        }
      }
      if (this.take()?.type !== ')') throw new Error('缺少右括号');
      return { type: 'call', name: lower, args };
    }
    if (token.type === '(') {
      const node = this.expression();
      if (this.take()?.type !== ')') throw new Error('缺少右括号');
      return node;
    }
    throw new Error('表达式位置错误');
  }
}

export function parseExpression(input: string): Node {
  if (!input.trim()) throw new Error('表达式为空');
  return new Parser(tokenize(input)).parse();
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) [x, y] = [y, x % y];
  return x;
}

function factorial(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 170) throw new Error('阶乘只支持 0–170 的整数');
  let result = 1;
  for (let i = 2; i <= value; i += 1) result *= i;
  return result;
}

function trig(value: number, mode: AngleMode): number {
  if (mode === 'deg') return (value * Math.PI) / 180;
  if (mode === 'grad') return (value * Math.PI) / 200;
  return value;
}

function inverseTrig(value: number, mode: AngleMode): number {
  if (mode === 'deg') return (value * 180) / Math.PI;
  if (mode === 'grad') return (value * 200) / Math.PI;
  return value;
}

export interface EvalOptions {
  angleMode?: AngleMode;
  variables?: Record<string, number>;
  ans?: number;
}

export function evaluateNode(node: Node, options: EvalOptions = {}): number {
  const { angleMode = 'deg', variables = {}, ans = 0 } = options;
  const evaluate = (value: Node): number => evaluateNode(value, options);
  switch (node.type) {
    case 'number':
      return node.value;
    case 'variable':
      if (node.name === 'pi') return Math.PI;
      if (node.name === 'e') return Math.E;
      if (node.name === 'ans') return ans;
      if (node.name in variables) return variables[node.name];
      if (node.name.toUpperCase() in variables) return variables[node.name.toUpperCase()];
      throw new Error(`未知变量：${node.name}`);
    case 'unary':
      return node.op === '-' ? -evaluate(node.value) : evaluate(node.value);
    case 'binary': {
      const left = evaluate(node.left);
      const right = evaluate(node.right);
      if (node.op === '+') return left + right;
      if (node.op === '-') return left - right;
      if (node.op === '*') return left * right;
      if (node.op === '/') {
        if (right === 0) throw new Error('除数不能为 0');
        return left / right;
      }
      return left ** right;
    }
    case 'postfix':
      return node.op === '!' ? factorial(evaluate(node.value)) : evaluate(node.value) / 100;
    case 'call': {
      const args = node.args.map(evaluate);
      switch (node.name) {
        case 'sin': return Math.sin(trig(args[0], angleMode));
        case 'cos': return Math.cos(trig(args[0], angleMode));
        case 'tan': return Math.tan(trig(args[0], angleMode));
        case 'asin': return inverseTrig(Math.asin(args[0]), angleMode);
        case 'acos': return inverseTrig(Math.acos(args[0]), angleMode);
        case 'atan': return inverseTrig(Math.atan(args[0]), angleMode);
        case 'sinh': return Math.sinh(args[0]);
        case 'cosh': return Math.cosh(args[0]);
        case 'tanh': return Math.tanh(args[0]);
        case 'log':
          if (args.length === 2) return Math.log(args[1]) / Math.log(args[0]);
          return Math.log10(args[0]);
        case 'ln': return Math.log(args[0]);
        case 'sqrt': return Math.sqrt(args[0]);
        case 'cbrt': return Math.cbrt(args[0]);
        case 'abs': return Math.abs(args[0]);
        case 'exp': return Math.exp(args[0]);
        case 'floor': return Math.floor(args[0]);
        case 'ceil': return Math.ceil(args[0]);
        case 'round': return Math.round(args[0]);
        case 'min': return Math.min(...args);
        case 'max': return Math.max(...args);
        case 'pow': return args[0] ** args[1];
        case 'sign': return Math.sign(args[0]);
        case 'int': return Math.trunc(args[0]);
        case 'intg': return Math.floor(args[0]);
        case 'rnd': return Number(args[0].toFixed(args[1] ?? 0));
        case 'gcd': return gcd(args[0], args[1]);
        case 'lcm': return Math.abs(args[0] * args[1]) / gcd(args[0], args[1]);
        case 'npr': return factorial(args[0]) / factorial(args[0] - args[1]);
        case 'ncr': return factorial(args[0]) / (factorial(args[1]) * factorial(args[0] - args[1]));
        case 'rand': return Math.random();
        case 'ranint': return Math.floor(Math.random() * (args[1] - args[0] + 1)) + args[0];
        case 'pol': return Math.hypot(args[0], args[1]);
        case 'rec': return args[0] * Math.cos(trig(args[1], angleMode));
        default: throw new Error(`不支持函数：${node.name}`);
      }
    }
  }
}

export function evaluateExpression(input: string, options: EvalOptions = {}): number {
  const value = evaluateNode(parseExpression(input), options);
  if (!Number.isFinite(value)) throw new Error('结果不是有限数值');
  return value;
}

function latexNode(node: Node, parentPrecedence = 0): string {
  const wrap = (value: string, precedence: number) => (precedence < parentPrecedence ? `\\left(${value}\\right)` : value);
  switch (node.type) {
    case 'number':
      return String(node.value);
    case 'variable':
      return node.name === 'pi' ? '\\pi' : node.name === 'e' ? 'e' : node.name === 'ans' ? '\\mathrm{Ans}' : node.name;
    case 'unary':
      return `${node.op}${latexNode(node.value, 3)}`;
    case 'binary': {
      if (node.op === '/') return `\\frac{${latexNode(node.left)}}{${latexNode(node.right)}}`;
      if (node.op === '^') return `${latexNode(node.left, 4)}^{${latexNode(node.right)}}`;
      const precedence = node.op === '+' || node.op === '-' ? 1 : 2;
      const operator = node.op === '*' ? '\\cdot ' : node.op;
      return wrap(`${latexNode(node.left, precedence)} ${operator} ${latexNode(node.right, precedence + 1)}`, precedence);
    }
    case 'postfix':
      return node.op === '!' ? `${latexNode(node.value, 4)}!` : `${latexNode(node.value, 4)}\\%`;
    case 'call':
      return `\\${node.name}\\left(${node.args.map((arg) => latexNode(arg)).join(', ')}\\right)`;
  }
}

export function expressionToLatex(input: string): string {
  return latexNode(parseExpression(input));
}

function readGroup(source: string, start: number): { value: string; end: number } {
  if (source[start] !== '{') throw new Error('LaTeX 命令缺少 {}');
  let depth = 1;
  let index = start + 1;
  while (index < source.length && depth > 0) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    index += 1;
  }
  if (depth !== 0) throw new Error('LaTeX 花括号不匹配');
  return { value: source.slice(start + 1, index - 1), end: index };
}

export function latexToExpression(input: string): string {
  let source = input
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    .replace(/\\left|\\right/g, '')
    .replace(/\\,|\\;|\\!/g, '')
    .replace(/\\cdot|\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\pi/g, 'pi')
    .replace(/\^\{([^{}]*)\}/g, '^($1)')
    .replace(/_\{([^{}]*)\}/g, '')
    .replace(/\\mathrm\{([^{}]*)\}/g, '$1')
    .replace(/\\text\{([^{}]*)\}/g, '$1');

  for (let guard = 0; guard < 20; guard += 1) {
    const frac = source.indexOf('\\frac');
    if (frac >= 0) {
      const numerator = readGroup(source, frac + 5);
      const denominator = readGroup(source, numerator.end);
      source = `${source.slice(0, frac)}((${latexToExpression(numerator.value)})/(${latexToExpression(denominator.value)}))${source.slice(denominator.end)}`;
      continue;
    }
    const sqrt = source.indexOf('\\sqrt');
    if (sqrt >= 0) {
      const group = readGroup(source, sqrt + 5);
      source = `${source.slice(0, sqrt)}sqrt(${latexToExpression(group.value)})${source.slice(group.end)}`;
      continue;
    }
    break;
  }
  return source.replace(/\\(sin|cos|tan|asin|acos|atan|log|ln|abs|exp|floor|ceil|round)/g, '$1');
}
