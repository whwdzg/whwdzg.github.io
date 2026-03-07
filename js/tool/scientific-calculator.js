(() => {
    const toastApi = window.globalCopyToast || { show () {} };

    let inputEl = null;
    let latexRawEl = null;
    let latexRenderEl = null;
    let resultEl = null;
    let ansEl = null;
    let stepsEl = null;
    let canvasEl = null;
    let calcGridEl = null;
    let fxEl = null;
    let gxEl = null;
    let workModeEl = null;
    let angleModeEl = null;
    let complexModeEl = null;

    let modeDropdown = null;
    let modeListEl = null;
    let modeToggleEl = null;
    let modeLabelEl = null;

    let angleDropdown = null;
    let angleListEl = null;
    let angleToggleEl = null;
    let angleLabelEl = null;

    let complexDropdown = null;
    let complexListEl = null;
    let complexToggleEl = null;
    let complexLabelEl = null;

    let ans = 0;
    let delegatedBound = false;
    let copyBound = false;

    const graphState = {
        xMin: -10,
        xMax: 10,
        yMin: -10,
        yMax: 10,
        manualY: false,
        lastExpr: '',
        hasGraph: false,
        pad: 24,
        dragging: false,
        dragStartX: 0,
        dragStartY: 0,
        cursorPoint: null,
        keyPoints: { zeros: [], extrema: [] }
    };

    function captureElements() {
        inputEl = document.getElementById('calc-input');
        latexRawEl = document.getElementById('calc-latex-raw');
        latexRenderEl = document.getElementById('calc-latex-render');
        resultEl = document.getElementById('calc-result');
        ansEl = document.getElementById('calc-ans');
        stepsEl = document.getElementById('calc-steps');
        canvasEl = document.getElementById('calc-graph-canvas');
        calcGridEl = document.getElementById('calc-grid');
        fxEl = document.getElementById('calc-fx');
        gxEl = document.getElementById('calc-gx');
        workModeEl = document.getElementById('calc-work-mode');
        angleModeEl = document.getElementById('calc-angle-mode');
        complexModeEl = document.getElementById('calc-complex-mode');

        modeDropdown = document.querySelector('[data-calc-dropdown="mode"]');
        modeListEl = document.getElementById('calc-work-mode-list');
        modeToggleEl = document.getElementById('calc-work-mode-toggle');
        modeLabelEl = document.getElementById('calc-work-mode-label');

        angleDropdown = document.querySelector('[data-calc-dropdown="angle"]');
        angleListEl = document.getElementById('calc-angle-mode-list');
        angleToggleEl = document.getElementById('calc-angle-mode-toggle');
        angleLabelEl = document.getElementById('calc-angle-mode-label');

        complexDropdown = document.querySelector('[data-calc-dropdown="complex"]');
        complexListEl = document.getElementById('calc-complex-mode-list');
        complexToggleEl = document.getElementById('calc-complex-mode-toggle');
        complexLabelEl = document.getElementById('calc-complex-mode-label');
    }

    function setAns(value) {
        ans = value;
        if (ansEl) ansEl.textContent = String(value);
    }

    function pushSteps(list) {
        if (!stepsEl) return;
        stepsEl.innerHTML = '';
        if (!list || !list.length) {
            const li = document.createElement('li');
            li.textContent = '等待计算';
            stepsEl.appendChild(li);
            return;
        }
        list.forEach((line) => {
            const li = document.createElement('li');
            li.textContent = line;
            stepsEl.appendChild(li);
        });
    }

    function setResult(message, ok) {
        if (!resultEl) return;
        resultEl.textContent = message;
        resultEl.dataset.state = ok ? 'success' : 'error';
    }

    function getMode() {
        return workModeEl && workModeEl.value ? workModeEl.value : 'expr';
    }

    function isRadMode() {
        return angleModeEl && angleModeEl.value === 'rad';
    }

    function allowComplex() {
        return complexModeEl && complexModeEl.value === 'complex';
    }

    function degToRad(v) { return v * Math.PI / 180; }
    function radToDeg(v) { return v * 180 / Math.PI; }

    function factorial(n) {
        if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) {
            throw new Error('阶乘仅支持非负整数');
        }
        let out = 1;
        for (let i = 2; i <= n; i += 1) out *= i;
        return out;
    }

    function nCr(n, r) {
        if (n < 0 || r < 0 || r > n) return 0;
        return factorial(n) / (factorial(r) * factorial(n - r));
    }

    function nPr(n, r) {
        if (n < 0 || r < 0 || r > n) return 0;
        return factorial(n) / factorial(n - r);
    }

    function normalizeExpr(raw) {
        let expr = String(raw || '').trim();
        expr = expr.replace(/×/g, '*').replace(/÷/g, '/');
        expr = expr.replace(/\^/g, '**');
        expr = expr.replace(/(\d+)\s*!/g, 'factorial($1)');
        expr = expr.replace(/(\d)\s*(x|\()/gi, '$1*$2');
        expr = expr.replace(/(\d)\s*(pi|e)\b/gi, '$1*$2');
        expr = expr.replace(/(\d)\s*([A-Za-z]+)\s*\(/g, '$1*$2(');
        expr = expr.replace(/\)\s*(\d|x|pi|e)/gi, ')*$1');
        expr = expr.replace(/\)\s*\(/g, ')*(');
        expr = expr.replace(/Ans/g, 'Ans');
        expr = expr.replace(/\bpi\b/gi, 'pi');
        expr = expr.replace(/\be\b/g, 'e');

        const fx = fxEl && fxEl.value ? normalizeExprNoFG(fxEl.value) : '';
        const gx = gxEl && gxEl.value ? normalizeExprNoFG(gxEl.value) : '';
        if (fx) expr = expr.replace(/\bf\s*\(\s*x\s*\)/gi, '(' + fx + ')');
        if (gx) expr = expr.replace(/\bg\s*\(\s*x\s*\)/gi, '(' + gx + ')');

        return expr;
    }

    // Avoid recursive replacement when normalizing function definitions themselves.
    function normalizeExprNoFG(raw) {
        let expr = String(raw || '').trim();
        expr = expr.replace(/×/g, '*').replace(/÷/g, '/');
        expr = expr.replace(/\^/g, '**');
        expr = expr.replace(/(\d+)\s*!/g, 'factorial($1)');
        expr = expr.replace(/(\d)\s*(x|\()/gi, '$1*$2');
        expr = expr.replace(/(\d)\s*(pi|e)\b/gi, '$1*$2');
        expr = expr.replace(/(\d)\s*([A-Za-z]+)\s*\(/g, '$1*$2(');
        expr = expr.replace(/\)\s*(\d|x|pi|e)/gi, ')*$1');
        expr = expr.replace(/\)\s*\(/g, ')*(');
        expr = expr.replace(/Ans/g, 'Ans');
        expr = expr.replace(/\bpi\b/gi, 'pi');
        expr = expr.replace(/\be\b/g, 'e');
        return expr;
    }

    function buildScope(xValue) {
        const toIn = isRadMode() ? (v) => v : degToRad;
        const toOut = isRadMode() ? (v) => v : radToDeg;
        return {
            Ans: ans,
            x: xValue,
            P: nPr,
            C: nCr,
            p: nPr,
            c: nCr,
            pi: Math.PI,
            e: Math.E,
            abs: Math.abs,
            sqrt: Math.sqrt,
            log: (x) => Math.log10(x),
            ln: (x) => Math.log(x),
            sin: (x) => Math.sin(toIn(x)),
            cos: (x) => Math.cos(toIn(x)),
            tan: (x) => Math.tan(toIn(x)),
            asin: (x) => toOut(Math.asin(x)),
            acos: (x) => toOut(Math.acos(x)),
            atan: (x) => toOut(Math.atan(x)),
            nCr,
            nPr,
            factorial
        };
    }

    function evalWithScope(expr, xValue) {
        const scope = buildScope(xValue);
        const keys = Object.keys(scope);
        const values = keys.map((k) => scope[k]);
        const fn = new Function(...keys, 'return (' + expr + ');');
        return fn(...values);
    }

    function gcd(a, b) {
        let x = Math.abs(a);
        let y = Math.abs(b);
        while (y > 1e-12) {
            const t = y;
            y = x % y;
            x = t;
        }
        return x;
    }

    function approxFraction(x, maxDen) {
        if (!Number.isFinite(x)) return null;
        let bestN = 0;
        let bestD = 1;
        let bestErr = Infinity;
        for (let d = 1; d <= maxDen; d += 1) {
            const n = Math.round(x * d);
            const err = Math.abs(x - n / d);
            if (err < bestErr) {
                bestErr = err;
                bestN = n;
                bestD = d;
                if (err < 1e-10) break;
            }
        }
        if (bestErr > 1e-8) return null;
        const g = gcd(bestN, bestD);
        return { n: bestN / g, d: bestD / g };
    }

    function approxMultipleOf(value, base, maxDen) {
        const ratio = value / base;
        const fr = approxFraction(ratio, maxDen);
        if (!fr) return null;
        return fr;
    }

    function fmtNum(n) {
        if (Math.abs(n) < 1e-12) return '0';
        return Number(n.toFixed(12)).toString();
    }

    function formatSmart(value) {
        if (!Number.isFinite(value)) return String(value);

        const piMul = approxMultipleOf(value, Math.PI, 64);
        if (piMul) {
            if (piMul.n === 0) return '0';
            if (piMul.d === 1 && Math.abs(piMul.n) === 1) return (piMul.n < 0 ? '-' : '') + 'pi';
            if (piMul.d === 1) return piMul.n + 'pi';
            return (piMul.n < 0 ? '-' : '') + Math.abs(piMul.n) + 'pi/' + piMul.d;
        }

        const eMul = approxMultipleOf(value, Math.E, 64);
        if (eMul) {
            if (eMul.n === 0) return '0';
            if (eMul.d === 1 && Math.abs(eMul.n) === 1) return (eMul.n < 0 ? '-' : '') + 'e';
            if (eMul.d === 1) return eMul.n + 'e';
            return (eMul.n < 0 ? '-' : '') + Math.abs(eMul.n) + 'e/' + eMul.d;
        }

        const sq = value * value;
        const sqRound = Math.round(sq);
        if (sqRound > 0 && Math.abs(sq - sqRound) < 1e-8) {
            const sign = value < 0 ? '-' : '';
            if (sqRound === 1) return sign + '1';
            return sign + 'sqrt(' + sqRound + ')';
        }

        const frac = approxFraction(value, 200);
        if (frac && frac.d !== 1) {
            return frac.n + '/' + frac.d;
        }

        return fmtNum(value);
    }

    function evaluateExpression(raw) {
        const expr = normalizeExpr(raw);
        if (!expr) throw new Error('请输入表达式');
        const value = evalWithScope(expr, 0);
        if (!Number.isFinite(value)) throw new Error('结果不是有限数值');
        return value;
    }

    function exportLatex(raw) {
        let s = String(raw || '').trim();
        if (!s) return '';
        s = s.replace(/\*/g, ' \\cdot ');
        s = s.replace(/\bpi\b/gi, '\\pi');
        s = s.replace(/\be\b/g, 'e');
        s = s.replace(/\bsqrt\(([^)]+)\)/g, '\\sqrt{$1}');
        s = s.replace(/\blog\(([^)]+)\)/g, '\\log\\left($1\\right)');
        s = s.replace(/\bln\(([^)]+)\)/g, '\\ln\\left($1\\right)');
        s = s.replace(/\bsin\(([^)]+)\)/g, '\\sin\\left($1\\right)');
        s = s.replace(/\bcos\(([^)]+)\)/g, '\\cos\\left($1\\right)');
        s = s.replace(/\btan\(([^)]+)\)/g, '\\tan\\left($1\\right)');
        s = s.replace(/\bC\(([^,]+),([^\)]+)\)/g, '\\binom{$1}{$2}');
        s = s.replace(/\bP\(([^,]+),([^\)]+)\)/g, 'P\\left($1,$2\\right)');
        s = s.replace(/([A-Za-z0-9\)]+)\^([A-Za-z0-9\(\.]+)/g, '$1^{$2}');
        return s;
    }

    function latexToHtml(s) {
        if (!s) return '<span class="calc-math-word">等待生成</span>';
        let out = s;
        out = out.replace(/\\binom\{([^}]+)\}\{([^}]+)\}/g, '<span class="calc-math-binom"><span>$1</span><span>$2</span></span>');
        out = out.replace(/\\sqrt\{([^}]+)\}/g, '<span class="calc-math-root">√<span class="calc-math-root-body">$1</span></span>');
        out = out.replace(/\\pi/g, '<span class="calc-math-symbol">π</span>');
        out = out.replace(/\\sin|\\cos|\\tan|\\ln|\\log/g, (m) => '<span class="calc-math-fn">' + m.slice(1) + '</span>');
        out = out.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
        out = out.replace(/\\cdot/g, '<span class="calc-math-op">·</span>');
        out = out.replace(/\\left\(|\\right\)/g, '');
        out = out.replace(/\n/g, '<br>');
        return out;
    }

    function setLatex(rawExpr) {
        const latex = exportLatex(rawExpr);
        if (latexRawEl) latexRawEl.value = latex;
        if (latexRenderEl) latexRenderEl.innerHTML = '<span class="calc-math">' + latexToHtml(latex || '\\text{等待生成}') + '</span>';
    }

    function splitEquation(raw) {
        const text = String(raw || '').trim();
        const idx = text.indexOf('=');
        if (idx === -1) throw new Error('方程请使用“=”连接左右表达式');
        const left = text.slice(0, idx).trim();
        const right = text.slice(idx + 1).trim();
        if (!left || !right) throw new Error('方程左右两边不能为空');
        return { left, right };
    }

    function solveEquation(raw) {
        const eq = splitEquation(raw);
        const normalized = normalizeExpr('(' + eq.left + ')-(' + eq.right + ')');
        const f = (x) => {
            const v = evalWithScope(normalized, x);
            if (!Number.isFinite(v)) throw new Error('方程包含不可计算项');
            return v;
        };

        const c = f(0);
        const v1 = f(1);
        const v2 = f(2);
        const a = (v2 - 2 * v1 + c) / 2;
        const b = v1 - c - a;
        const cc = c;

        const steps = [];
        steps.push('移项得到：(' + eq.left + ') - (' + eq.right + ') = 0');
        steps.push('识别系数：a=' + fmtNum(a) + ', b=' + fmtNum(b) + ', c=' + fmtNum(cc));

        const tol = 1e-8;
        if (Math.abs(a) < tol) {
            if (Math.abs(b) < tol) throw new Error('无法识别为一元一次/二次方程');
            const root = -cc / b;
            steps.push('一元一次方程：bx + c = 0');
            steps.push('x = -c / b = ' + formatSmart(root));
            return { message: 'x = ' + formatSmart(root), steps };
        }

        const delta = b * b - 4 * a * cc;
        steps.push('判别式：Δ = b^2 - 4ac = ' + fmtNum(delta));
        if (delta >= -tol) {
            const safeDelta = delta < 0 ? 0 : delta;
            const sqrtDelta = Math.sqrt(safeDelta);
            const x1 = (-b + sqrtDelta) / (2 * a);
            const x2 = (-b - sqrtDelta) / (2 * a);
            steps.push('x1 = (-b + √Δ)/(2a) = ' + formatSmart(x1));
            steps.push('x2 = (-b - √Δ)/(2a) = ' + formatSmart(x2));
            return { message: 'x1=' + formatSmart(x1) + ', x2=' + formatSmart(x2), steps };
        }

        if (!allowComplex()) {
            steps.push('Δ < 0，当前设置为仅实数解');
            return { message: '无实数解', steps };
        }

        const imag = Math.sqrt(-delta) / (2 * a);
        const real = -b / (2 * a);
        const x1 = formatSmart(real) + ' + ' + formatSmart(Math.abs(imag)) + 'i';
        const x2 = formatSmart(real) + ' - ' + formatSmart(Math.abs(imag)) + 'i';
        steps.push('Δ < 0，按复数公式求解');
        steps.push('x1 = ' + x1);
        steps.push('x2 = ' + x2);
        return { message: 'x1=' + x1 + ', x2=' + x2, steps };
    }

    function getCanvasSize() {
        if (!canvasEl) return { w: 900, h: 380 };
        const w = canvasEl.clientWidth || canvasEl.width || 900;
        const h = canvasEl.clientHeight || canvasEl.height || 380;
        return { w, h };
    }

    function fitCanvas(ctx, w, h) {
        const dpr = window.devicePixelRatio || 1;
        canvasEl.width = Math.floor(w * dpr);
        canvasEl.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function worldToPxX(x, w) {
        return graphState.pad + (x - graphState.xMin) * (w - graphState.pad * 2) / (graphState.xMax - graphState.xMin);
    }

    function worldToPxY(y, h) {
        return h - graphState.pad - (y - graphState.yMin) * (h - graphState.pad * 2) / (graphState.yMax - graphState.yMin);
    }

    function pxToWorldX(px, w) {
        return graphState.xMin + (px - graphState.pad) * (graphState.xMax - graphState.xMin) / (w - graphState.pad * 2);
    }

    function pxToWorldY(py, h) {
        return graphState.yMax - (py - graphState.pad) * (graphState.yMax - graphState.yMin) / (h - graphState.pad * 2);
    }

    function extractGraphKeyPoints(pts) {
        const zeros = [];
        const extrema = [];
        for (let i = 1; i < pts.length; i += 1) {
            const a = pts[i - 1];
            const b = pts[i];
            if (!a || !b) continue;
            if (a.y * b.y < 0) {
                const t = a.y / (a.y - b.y);
                zeros.push({ x: a.x + (b.x - a.x) * t, y: 0 });
            }
        }
        for (let i = 1; i < pts.length - 1; i += 1) {
            const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
            if (!p0 || !p1 || !p2) continue;
            if ((p1.y >= p0.y && p1.y >= p2.y) || (p1.y <= p0.y && p1.y <= p2.y)) {
                extrema.push({ x: p1.x, y: p1.y });
            }
        }
        return { zeros: zeros.slice(0, 5), extrema: extrema.slice(0, 5) };
    }

    function applyCanvasTheme(ctx, w, h) {
        const dark = document.body.classList.contains('dark-mode');
        const bg = dark ? '#111827' : '#ffffff';
        const grid = dark ? '#334155' : '#d1d5db';
        const axis = dark ? '#9ca3af' : '#6b7280';
        const curve = dark ? '#60a5fa' : '#2563eb';
        const text = dark ? '#e5e7eb' : '#111827';

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        return { grid, axis, curve, text };
    }

    function drawAxisLabels(ctx, w, h, color) {
        ctx.fillStyle = color;
        ctx.font = '12px Cambria Math, Times New Roman, serif';
        const x0 = worldToPxX(0, w);
        const y0 = worldToPxY(0, h);
        const xTicks = [-10, -5, 0, 5, 10];
        xTicks.forEach((v) => {
            const px = worldToPxX(v, w);
            ctx.fillText(String(v), px - 8, Math.min(h - 4, y0 + 14));
        });
        const yTicks = [graphState.yMin, 0, graphState.yMax];
        yTicks.forEach((v) => {
            const py = worldToPxY(v, h);
            ctx.fillText(fmtNum(v), Math.min(w - 52, x0 + 6), py - 4);
        });
    }

    function renderGraph(expr) {
        if (!canvasEl) throw new Error('画布未初始化');
        const ctx = canvasEl.getContext('2d');
        if (!ctx) throw new Error('无法获取画布上下文');

        const { w, h } = getCanvasSize();
        fitCanvas(ctx, w, h);

        const sample = 700;
        const pts = [];
        let autoYMin = Infinity;
        let autoYMax = -Infinity;

        for (let i = 0; i <= sample; i += 1) {
            const x = graphState.xMin + (graphState.xMax - graphState.xMin) * (i / sample);
            let y = NaN;
            try { y = evalWithScope(expr, x); } catch (_) { y = NaN; }
            if (Number.isFinite(y)) {
                pts.push({ x, y });
                autoYMin = Math.min(autoYMin, y);
                autoYMax = Math.max(autoYMax, y);
            } else {
                pts.push(null);
            }
        }

        if (!Number.isFinite(autoYMin) || !Number.isFinite(autoYMax)) {
            throw new Error('函数在当前范围内无有效点');
        }

        if (!graphState.manualY) {
            graphState.yMin = autoYMin;
            graphState.yMax = autoYMax;
            if (Math.abs(graphState.yMax - graphState.yMin) < 1e-9) {
                graphState.yMax += 1;
                graphState.yMin -= 1;
            }
        }

        const colors = applyCanvasTheme(ctx, w, h);

        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const xStep = Math.max(1, Math.round((graphState.xMax - graphState.xMin) / 12));
        const yStep = Math.max(1, Math.round((graphState.yMax - graphState.yMin) / 10));
        for (let gx = Math.floor(graphState.xMin); gx <= Math.ceil(graphState.xMax); gx += xStep) {
            const px = worldToPxX(gx, w);
            ctx.moveTo(px, graphState.pad);
            ctx.lineTo(px, h - graphState.pad);
        }
        for (let gy = Math.floor(graphState.yMin); gy <= Math.ceil(graphState.yMax); gy += yStep) {
            const py = worldToPxY(gy, h);
            ctx.moveTo(graphState.pad, py);
            ctx.lineTo(w - graphState.pad, py);
        }
        ctx.stroke();

        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1.2;
        const x0 = worldToPxY(0, h);
        const y0 = worldToPxX(0, w);
        ctx.beginPath();
        ctx.moveTo(graphState.pad, x0);
        ctx.lineTo(w - graphState.pad, x0);
        ctx.moveTo(y0, graphState.pad);
        ctx.lineTo(y0, h - graphState.pad);
        ctx.stroke();

        drawAxisLabels(ctx, w, h, colors.text);

        ctx.strokeStyle = colors.curve;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < pts.length; i += 1) {
            const p = pts[i];
            if (!p) { started = false; continue; }
            const px = worldToPxX(p.x, w);
            const py = worldToPxY(p.y, h);
            if (!started) {
                ctx.moveTo(px, py);
                started = true;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();

        const keys = extractGraphKeyPoints(pts);
        graphState.keyPoints = keys;

        ctx.fillStyle = '#ef4444';
        keys.zeros.forEach((p) => {
            ctx.beginPath();
            ctx.arc(worldToPxX(p.x, w), worldToPxY(p.y, h), 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#f59e0b';
        keys.extrema.forEach((p) => {
            ctx.beginPath();
            ctx.arc(worldToPxX(p.x, w), worldToPxY(p.y, h), 3, 0, Math.PI * 2);
            ctx.fill();
        });

        if (graphState.cursorPoint && Number.isFinite(graphState.cursorPoint.x) && Number.isFinite(graphState.cursorPoint.y)) {
            const cx = worldToPxX(graphState.cursorPoint.x, w);
            const cy = worldToPxY(graphState.cursorPoint.y, h);
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, graphState.pad);
            ctx.lineTo(cx, h - graphState.pad);
            ctx.moveTo(graphState.pad, cy);
            ctx.lineTo(w - graphState.pad, cy);
            ctx.stroke();

            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = colors.text;
            ctx.font = '12px Cambria Math, Times New Roman, serif';
            ctx.fillText('x=' + formatSmart(graphState.cursorPoint.x), cx + 8, Math.max(16, graphState.pad - 6));
            ctx.fillText('y=' + formatSmart(graphState.cursorPoint.y), Math.max(graphState.pad + 4, worldToPxX(0, w) + 6), cy - 8);
        }

        return {
            text: '图像已绘制，x∈[' + fmtNum(graphState.xMin) + ', ' + fmtNum(graphState.xMax) + ']',
            keyPoints: keys
        };
    }

    function drawGraph(raw, options) {
        const expr = normalizeExpr(raw);
        if (!expr) throw new Error('请输入函数表达式');
        const keepView = !!(options && options.keepView);
        if (!keepView || graphState.lastExpr !== expr) {
            graphState.xMin = -10;
            graphState.xMax = 10;
            graphState.manualY = false;
            graphState.cursorPoint = null;
        }
        graphState.lastExpr = expr;
        const rendered = renderGraph(expr);
        graphState.hasGraph = true;
        return rendered;
    }

    function nearestPointOnExpr(expr, targetX) {
        const sample = 1200;
        let best = null;
        for (let i = 0; i <= sample; i += 1) {
            const x = graphState.xMin + (graphState.xMax - graphState.xMin) * (i / sample);
            if (Math.abs(x - targetX) > (graphState.xMax - graphState.xMin) / 6) continue;
            let y = NaN;
            try { y = evalWithScope(expr, x); } catch (_) { y = NaN; }
            if (!Number.isFinite(y)) continue;
            const d = Math.abs(x - targetX);
            if (!best || d < best.d) best = { x, y, d };
        }
        return best ? { x: best.x, y: best.y } : null;
    }

    function evalExprAtX(expr, x) {
        try {
            const y = evalWithScope(expr, x);
            return Number.isFinite(y) ? y : NaN;
        } catch (_) {
            return NaN;
        }
    }

    function snapClickPoint(expr, targetX) {
        const rangeX = graphState.xMax - graphState.xMin;
        const extremaTol = rangeX * 0.04;
        const intTol = rangeX * 0.03;

        // 1) Snap to nearby extrema first.
        const extrema = graphState.keyPoints && graphState.keyPoints.extrema ? graphState.keyPoints.extrema : [];
        let bestExt = null;
        for (let i = 0; i < extrema.length; i += 1) {
            const p = extrema[i];
            if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
            const d = Math.abs(p.x - targetX);
            if (d <= extremaTol && (!bestExt || d < bestExt.d)) {
                bestExt = { x: p.x, y: p.y, d };
            }
        }
        if (bestExt) {
            return { x: bestExt.x, y: bestExt.y, snapped: 'extrema' };
        }

        // 2) Then snap to nearby integer x-position on curve.
        const intX = Math.round(targetX);
        if (Math.abs(intX - targetX) <= intTol) {
            const y = evalExprAtX(expr, intX);
            if (Number.isFinite(y)) {
                return { x: intX, y, snapped: 'integer' };
            }
        }

        // 3) Fallback to nearest sampled point.
        const nearest = nearestPointOnExpr(expr, targetX);
        if (!nearest) return null;
        return { x: nearest.x, y: nearest.y, snapped: 'nearest' };
    }

    function buildGraphStepLines(graphResult) {
        const lines = ['模式：函数图像', '支持滚轮缩放、拖拽平移、点击读值'];
        if (!graphResult || !graphResult.keyPoints) return lines;
        const zeros = graphResult.keyPoints.zeros || [];
        const extrema = graphResult.keyPoints.extrema || [];
        if (zeros.length) lines.push('零点约：' + zeros.map((p) => '(' + formatSmart(p.x) + ', 0)').join('，'));
        if (extrema.length) lines.push('极值点约：' + extrema.map((p) => '(' + formatSmart(p.x) + ', ' + formatSmart(p.y) + ')').join('，'));
        if (graphState.cursorPoint) lines.push('点击读值：x=' + formatSmart(graphState.cursorPoint.x) + ', y=' + formatSmart(graphState.cursorPoint.y));
        return lines;
    }

    function bindCanvasInteractions() {
        if (!canvasEl) return;
        if (canvasEl.dataset.bound === '1') return;

        canvasEl.addEventListener('wheel', (evt) => {
            if (!graphState.hasGraph || !graphState.lastExpr) return;
            evt.preventDefault();
            const rect = canvasEl.getBoundingClientRect();
            const px = evt.clientX - rect.left;
            const py = evt.clientY - rect.top;
            const { w, h } = getCanvasSize();
            const xCenter = pxToWorldX(px, w);
            const yCenter = pxToWorldY(py, h);
            const factor = evt.deltaY < 0 ? 0.9 : 1.12;
            graphState.xMin = xCenter + (graphState.xMin - xCenter) * factor;
            graphState.xMax = xCenter + (graphState.xMax - xCenter) * factor;
            graphState.yMin = yCenter + (graphState.yMin - yCenter) * factor;
            graphState.yMax = yCenter + (graphState.yMax - yCenter) * factor;
            graphState.manualY = true;
            try {
                const rendered = renderGraph(graphState.lastExpr);
                pushSteps(buildGraphStepLines(rendered));
                setResult('结果: 已缩放视图', true);
            } catch (err) {
                setResult('结果: ' + (err && err.message ? err.message : '缩放失败'), false);
            }
        }, { passive: false });

        canvasEl.addEventListener('mousedown', (evt) => {
            if (!graphState.hasGraph) return;
            graphState.dragging = true;
            graphState.dragStartX = evt.clientX;
            graphState.dragStartY = evt.clientY;
        });

        window.addEventListener('mousemove', (evt) => {
            if (!graphState.dragging || !graphState.hasGraph || !graphState.lastExpr) return;
            const dx = evt.clientX - graphState.dragStartX;
            const dy = evt.clientY - graphState.dragStartY;
            graphState.dragStartX = evt.clientX;
            graphState.dragStartY = evt.clientY;

            const { w, h } = getCanvasSize();
            const rangeX = graphState.xMax - graphState.xMin;
            const rangeY = graphState.yMax - graphState.yMin;
            const worldDx = dx * rangeX / (w - graphState.pad * 2);
            const worldDy = dy * rangeY / (h - graphState.pad * 2);

            graphState.xMin -= worldDx;
            graphState.xMax -= worldDx;
            graphState.yMin += worldDy;
            graphState.yMax += worldDy;
            graphState.manualY = true;
            try { renderGraph(graphState.lastExpr); } catch (_) {}
        });

        window.addEventListener('mouseup', () => {
            if (!graphState.dragging) return;
            graphState.dragging = false;
            if (!graphState.hasGraph || !graphState.lastExpr) return;
            try {
                const rendered = renderGraph(graphState.lastExpr);
                pushSteps(buildGraphStepLines(rendered));
                setResult('结果: 已平移视图', true);
            } catch (err) {
                setResult('结果: ' + (err && err.message ? err.message : '平移失败'), false);
            }
        });

        canvasEl.addEventListener('click', (evt) => {
            if (!graphState.hasGraph || !graphState.lastExpr) return;
            const rect = canvasEl.getBoundingClientRect();
            const px = evt.clientX - rect.left;
            const { w } = getCanvasSize();
            const targetX = pxToWorldX(px, w);
            const hit = snapClickPoint(graphState.lastExpr, targetX);
            if (!hit) return;
            graphState.cursorPoint = { x: hit.x, y: hit.y };
            try {
                const rendered = renderGraph(graphState.lastExpr);
                pushSteps(buildGraphStepLines(rendered));
                const label = hit.snapped === 'extrema'
                    ? '（吸附极值）'
                    : (hit.snapped === 'integer' ? '（吸附整数 x）' : '（最近点）');
                setResult('结果: x=' + formatSmart(hit.x) + ', y=' + formatSmart(hit.y) + ' ' + label, true);
            } catch (err) {
                setResult('结果: ' + (err && err.message ? err.message : '读取点值失败'), false);
            }
        });

        canvasEl.dataset.bound = '1';
    }

    function applyModeUI() {
        if (!inputEl) return;
        const mode = getMode();
        if (mode === 'equation') {
            inputEl.placeholder = '示例：x^2+2x+5=0，或 2x+1=7';
        } else if (mode === 'graph') {
            inputEl.placeholder = '示例：f(x)-g(x) 或 sin(x)+x/3';
        } else {
            inputEl.placeholder = '示例：sin(30)+2^3，C(10,3)，sqrt(2)+ln(5)';
        }
    }

    function handleSolve() {
        const mode = getMode();
        const raw = inputEl ? inputEl.value : '';
        if (!raw.trim()) throw new Error('请输入内容');

        if (mode === 'equation') {
            const solved = solveEquation(raw);
            pushSteps(solved.steps);
            setResult('结果: ' + solved.message, true);
            setLatex(raw);
            return;
        }

        if (mode === 'graph') {
            const rendered = drawGraph(raw);
            pushSteps(buildGraphStepLines(rendered));
            setResult('结果: ' + rendered.text, true);
            setLatex(raw);
            return;
        }

        const value = evaluateExpression(raw);
        setAns(value);
        pushSteps(['模式：表达式', '计算结果 = ' + formatSmart(value)]);
        setResult('结果: ' + formatSmart(value), true);
        setLatex(raw);
    }

    function handleCopyButton(button) {
        if (!button) return;
        const targetId = button.dataset.copyTarget;
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (!target) return;
        const value = target.value || '';
        if (!value) {
            toastApi.show('没有可复制的 LaTeX 内容', 'error', 'icon-ic_fluent_error_circle_24_regular');
            return;
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(value).then(() => {
                toastApi.show('LaTeX 已复制', 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
            }).catch(() => {
                toastApi.show('复制失败', 'error', 'icon-ic_fluent_error_circle_24_regular');
            });
            return;
        }
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toastApi.show('LaTeX 已复制', 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
    }

    function handleAction(action) {
        if (!inputEl) return;
        if (action === 'clear') {
            inputEl.value = '';
            graphState.lastExpr = '';
            graphState.hasGraph = false;
            graphState.cursorPoint = null;
            setLatex('');
            pushSteps([]);
            setResult('结果: -', true);
            return;
        }
        if (action === 'del') {
            inputEl.value = inputEl.value.slice(0, -1);
            return;
        }
        if (action === 'latex') {
            setLatex(inputEl.value);
            setResult('结果: LaTeX 已更新', true);
            return;
        }
        if (action === 'plot') {
            try {
                const rendered = drawGraph(inputEl.value, { keepView: true });
                pushSteps(buildGraphStepLines(rendered));
                setResult('结果: ' + rendered.text, true);
                setLatex(inputEl.value);
            } catch (err) {
                setResult('结果: ' + (err && err.message ? err.message : '绘图失败'), false);
            }
            return;
        }
        if (action === 'solve') {
            try {
                handleSolve();
            } catch (err) {
                setResult('结果: ' + (err && err.message ? err.message : '求解失败'), false);
            }
        }
    }

    function insertToken(token) {
        if (!inputEl) return;
        const start = inputEl.selectionStart;
        const end = inputEl.selectionEnd;
        const left = inputEl.value.slice(0, start);
        const right = inputEl.value.slice(end);
        inputEl.value = left + token + right;
        const next = start + token.length;
        inputEl.focus();
        inputEl.setSelectionRange(next, next);
    }

    function setDropdownValueMulti(hiddenEl, labelEl, lists, value, text) {
        if (hiddenEl) hiddenEl.value = value;
        if (labelEl) labelEl.textContent = text || value;
        (lists || []).forEach((listEl) => {
            if (!listEl) return;
            listEl.querySelectorAll('.dropdown-item').forEach((item) => {
                const match = item.dataset.value === value;
                item.classList.toggle('selected', match);
                item.setAttribute('aria-selected', match ? 'true' : 'false');
            });
        });
        applyModeUI();
    }

    function bindPortalDropdown(dropdown, toggle, listEl, hiddenEl, labelEl, portalKey) {
        if (!dropdown || !toggle || !listEl || !hiddenEl || !labelEl) return;
        if (dropdown.dataset.bound === '1') return;

        const portalId = 'calc-dropdown-portal-' + portalKey;
        const old = document.getElementById(portalId);
        if (old && old.parentNode) old.parentNode.removeChild(old);

        const portalEl = document.createElement('div');
        portalEl.className = 'settings-dropdown-portal basex-dropdown-portal hidden';
        portalEl.id = portalId;
        const portalList = document.createElement('div');
        portalList.className = 'settings-dropdown-list';
        portalEl.appendChild(portalList);
        document.body.appendChild(portalEl);

        listEl.querySelectorAll('.dropdown-item').forEach((item) => {
            const clone = item.cloneNode(true);
            clone.addEventListener('click', () => {
                setDropdownValueMulti(hiddenEl, labelEl, [listEl, portalList], clone.dataset.value || '', clone.textContent || '');
                close();
            });
            portalList.appendChild(clone);
        });

        const positionPortal = () => {
            const rect = toggle.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const gap = 8;
            const pw = portalEl.offsetWidth || Math.min(Math.max(220, rect.width + 24), vw - 16);
            let left = rect.left;
            left = Math.min(Math.max(8, left), Math.max(8, vw - pw - 8));
            portalEl.style.left = left + 'px';

            const ph = portalEl.offsetHeight || 240;
            const below = vh - rect.bottom;
            const preferBelow = below > ph + gap || rect.top < 120;
            portalEl.style.top = (preferBelow ? Math.min(vh - ph - 8, rect.bottom + gap) : Math.max(8, rect.top - ph - gap)) + 'px';
        };

        const close = () => {
            dropdown.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            portalList.classList.remove('open');
            portalList.style.maxHeight = '0px';
            portalEl.classList.add('hidden');
        };
        const open = () => {
            dropdown.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
            portalList.classList.add('open');
            portalList.style.maxHeight = portalList.scrollHeight + 'px';
            portalEl.classList.remove('hidden');
            positionPortal();
        };

        toggle.addEventListener('click', () => {
            if (dropdown.classList.contains('open')) close(); else open();
        });

        document.addEventListener('click', (evt) => {
            if (dropdown.contains(evt.target) || portalEl.contains(evt.target)) return;
            close();
        });
        window.addEventListener('resize', positionPortal);
        window.addEventListener('scroll', positionPortal, true);

        const initVal = hiddenEl.value || '';
        const initItem = listEl.querySelector('[data-value="' + initVal + '"]') || listEl.querySelector('.dropdown-item');
        if (initItem) {
            setDropdownValueMulti(hiddenEl, labelEl, [listEl, portalList], initItem.dataset.value || initVal, initItem.textContent || initVal);
        }

        dropdown.dataset.bound = '1';
    }

    function renderButtonMath(token, fallback) {
        const normalized = String(token || '').trim().replace(/^\\+/, '\\');
        const map = {
            '\\sin': '<span class="calc-math-fn">sin</span>',
            '\\cos': '<span class="calc-math-fn">cos</span>',
            '\\tan': '<span class="calc-math-fn">tan</span>',
            '\\log': '<span class="calc-math-fn">log</span>',
            '\\ln': '<span class="calc-math-fn">ln</span>',
            '\\arcsin': '<span class="calc-math-fn">sin</span><sup>-1</sup>',
            '\\arccos': '<span class="calc-math-fn">cos</span><sup>-1</sup>',
            '\\arctan': '<span class="calc-math-fn">tan</span><sup>-1</sup>',
            '\\pi': '<span class="calc-math-symbol">π</span>',
            '\\sqrt{x}': '<span class="calc-math-root">√<span class="calc-math-root-body">x</span></span>',
            'x^{y}': '<span class="calc-math-var">x</span><sup>y</sup>',
            'C(n,r)': '<span class="calc-math-word">C</span>(<span class="calc-math-var">n</span>,<span class="calc-math-var">r</span>)',
            'P(n,r)': '<span class="calc-math-word">P</span>(<span class="calc-math-var">n</span>,<span class="calc-math-var">r</span>)',
            'x': '<span class="calc-math-var">x</span>',
            'f(x)': '<span class="calc-math-word">f</span>(<span class="calc-math-var">x</span>)',
            'g(x)': '<span class="calc-math-word">g</span>(<span class="calc-math-var">x</span>)',
            'Ans': '<span class="calc-math-word">Ans</span>',
            '=': '<span class="calc-math-op">=</span>',
            '+': '<span class="calc-math-op">+</span>',
            '-': '<span class="calc-math-op">−</span>',
            '*': '<span class="calc-math-op">×</span>',
            '/': '<span class="calc-math-op">÷</span>',
            '%': '<span class="calc-math-op">%</span>',
            '(': '<span class="calc-math-op">(</span>',
            ')': '<span class="calc-math-op">)</span>',
            '.': '<span class="calc-math-op">.</span>',
            ',': '<span class="calc-math-op">,</span>',
            'DEL': '<span class="calc-math-word">DEL</span>',
            'AC': '<span class="calc-math-word">AC</span>',
            '导出 LaTeX': '<span class="calc-math-word">LaTeX</span>',
            '绘制图像': '<span class="calc-math-word">Graph</span>',
            '求解': '<span class="calc-math-word">Solve</span>'
        };
        if (map[normalized]) return map[normalized];
        if (/^\d$/.test(normalized)) return '<span class="calc-math-num">' + normalized + '</span>';
        if (fallback && map[fallback]) return map[fallback];
        return '<span class="calc-math-word">' + String(fallback || normalized || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
    }

    function renderCalcButtonLatex() {
        if (!calcGridEl) return;
        if (calcGridEl.dataset.mathRendered === '1') return;
        calcGridEl.querySelectorAll('button').forEach((btn) => {
            const title = (btn.getAttribute('title') || '').trim();
            const fallback = (btn.textContent || '').trim();
            const html = renderButtonMath(title || fallback, fallback);
            btn.innerHTML = '<span class="calc-math">' + html + '</span>';
            btn.setAttribute('aria-label', fallback || title);
        });
        calcGridEl.dataset.mathRendered = '1';
    }

    function bindDelegated() {
        if (delegatedBound) return;
        delegatedBound = true;
        document.addEventListener('click', (evt) => {
            const calcBtn = evt.target.closest('#calc-grid button');
            if (calcBtn) {
                captureElements();
                const insert = calcBtn.dataset.insert;
                const action = calcBtn.dataset.action;
                if (insert) insertToken(insert);
                if (action) handleAction(action);
                return;
            }
            const copyBtn = evt.target.closest('[data-copy-target="calc-latex-raw"]');
            if (copyBtn) {
                handleCopyButton(copyBtn);
            }
        });
    }

    function init() {
        captureElements();
        bindDelegated();
        if (!inputEl || !latexRawEl || !latexRenderEl || !resultEl || !ansEl || !stepsEl || !canvasEl || !calcGridEl || !fxEl || !gxEl || !workModeEl || !angleModeEl || !complexModeEl) return false;

        bindPortalDropdown(modeDropdown, modeToggleEl, modeListEl, workModeEl, modeLabelEl, 'mode');
        bindPortalDropdown(angleDropdown, angleToggleEl, angleListEl, angleModeEl, angleLabelEl, 'angle');
        bindPortalDropdown(complexDropdown, complexToggleEl, complexListEl, complexModeEl, complexLabelEl, 'complex');
        bindCanvasInteractions();
        renderCalcButtonLatex();

        if (!copyBound) {
            copyBound = true;
        }

        setAns(0);
        setResult('结果: -', true);
        pushSteps([]);
        setLatex('');
        applyModeUI();
        return true;
    }

    function bootstrap() {
        let tries = 0;
        const maxTries = 40;
        const tick = () => {
            if (init()) return;
            tries += 1;
            if (tries < maxTries) setTimeout(tick, 50);
        };
        tick();
    }

    bootstrap();
    window.addEventListener('load', bootstrap);
    window.addEventListener('spa:page:loaded', bootstrap);
})();
