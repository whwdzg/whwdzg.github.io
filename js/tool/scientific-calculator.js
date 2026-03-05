/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\tool\scientific-calculator.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
(() => {
    const toastApi = window.globalCopyToast || { show () {} };

    let inputEl = null;
    let latexEl = null;
    let resultEl = null;
    let ansEl = null;
    let stepsEl = null;
    let canvasEl = null;
    let calcGridEl = null;
    let pointX1El = null;
    let pointX2El = null;
    let workModeEl = null;
    let angleModeEl = null;
    let complexModeEl = null;

    let modeDropdown = null;
    let modeListEl = null;
    let modeToggleEl = null;
    let modeLabelEl = null;
    let modePortalEl = null;
    let modePortalListEl = null;

    let angleDropdown = null;
    let angleListEl = null;
    let angleToggleEl = null;
    let angleLabelEl = null;
    let anglePortalEl = null;
    let anglePortalListEl = null;

    let complexDropdown = null;
    let complexListEl = null;
    let complexToggleEl = null;
    let complexLabelEl = null;
    let complexPortalEl = null;
    let complexPortalListEl = null;

    let ans = 0;
    let delegatedBound = false;
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
        dragStartY: 0
    };

    function captureElements() {
        inputEl = document.getElementById('calc-input');
        latexEl = document.getElementById('calc-latex');
        resultEl = document.getElementById('calc-result');
        ansEl = document.getElementById('calc-ans');
        stepsEl = document.getElementById('calc-steps');
        canvasEl = document.getElementById('calc-graph-canvas');
        calcGridEl = document.getElementById('calc-grid');
        pointX1El = document.getElementById('calc-point-x1');
        pointX2El = document.getElementById('calc-point-x2');
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

    function degToRad(v) {
        return v * Math.PI / 180;
    }

    function radToDeg(v) {
        return v * 180 / Math.PI;
    }

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

    function evaluateExpression(raw) {
        const expr = normalizeExpr(raw);
        if (!expr) throw new Error('请输入表达式');
        const value = evalWithScope(expr, 0);
        if (!Number.isFinite(value)) throw new Error('结果不是有限数值');
        return value;
    }

    function derivativeAt(expr, x0) {
        const scale = Math.max(1, Math.abs(x0));
        const h = 1e-5 * scale;
        const y1 = evalWithScope(expr, x0 + h);
        const y2 = evalWithScope(expr, x0 - h);
        if (!Number.isFinite(y1) || !Number.isFinite(y2)) {
            throw new Error('导数点附近函数不可计算');
        }
        return (y1 - y2) / (2 * h);
    }

    function computeDerivativeForXPoints(raw) {
        const expr = normalizeExpr(raw);
        if (!expr) throw new Error('请输入表达式');
        const hasX1 = pointX1El && pointX1El.value !== '';
        const hasX2 = pointX2El && pointX2El.value !== '';
        if (!hasX1 && !hasX2) {
            throw new Error('请至少填写 X1 或 X2 的值');
        }

        const lines = ['模式：数值导数（中心差分）'];
        const messageParts = [];

        if (hasX1) {
            const x1Val = Number(pointX1El.value);
            if (!Number.isFinite(x1Val)) throw new Error('X1 不是有效数字');
            const d1 = derivativeAt(expr, x1Val);
            lines.push("f'(X1=" + formatNum(x1Val) + ") = " + formatNum(d1));
            messageParts.push("f'(X1)=" + formatNum(d1));
        }

        if (hasX2) {
            const x2Val = Number(pointX2El.value);
            if (!Number.isFinite(x2Val)) throw new Error('X2 不是有效数字');
            const d2 = derivativeAt(expr, x2Val);
            lines.push("f'(X2=" + formatNum(x2Val) + ") = " + formatNum(d2));
            messageParts.push("f'(X2)=" + formatNum(d2));
        }

        return {
            lines,
            message: messageParts.join('，')
        };
    }

    function exportLatex(raw) {
        let s = String(raw || '').trim();
        if (!s) return '';
        s = s.replace(/\*/g, ' \\cdot ');
        s = s.replace(/\bpi\b/gi, '\\pi');
        s = s.replace(/\bsqrt\(([^)]+)\)/g, '\\sqrt{$1}');
        s = s.replace(/\blog\(([^)]+)\)/g, '\\log\\left($1\\right)');
        s = s.replace(/\bln\(([^)]+)\)/g, '\\ln\\left($1\\right)');
        s = s.replace(/\bsin\(([^)]+)\)/g, '\\sin\\left($1\\right)');
        s = s.replace(/\bcos\(([^)]+)\)/g, '\\cos\\left($1\\right)');
        s = s.replace(/\btan\(([^)]+)\)/g, '\\tan\\left($1\\right)');
        s = s.replace(/nCr\(([^,]+),([^\)]+)\)/g, '\\binom{$1}{$2}');
        s = s.replace(/nPr\(([^,]+),([^\)]+)\)/g, 'P\\left($1,$2\\right)');
        s = s.replace(/\bC\(([^,]+),([^\)]+)\)/g, '\\binom{$1}{$2}');
        s = s.replace(/\bP\(([^,]+),([^\)]+)\)/g, 'P\\left($1,$2\\right)');
        s = s.replace(/([A-Za-z0-9\)]+)\^([A-Za-z0-9\(\.]+)/g, '$1^{$2}');
        return s;
    }

    function formatNum(n) {
        if (Math.abs(n) < 1e-12) return '0';
        return Number(n.toFixed(12)).toString();
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

    function bisectionRoot(f, left, right, maxIter) {
        let a = left;
        let b = right;
        let fa = f(a);
        let fb = f(b);
        if (!Number.isFinite(fa) || !Number.isFinite(fb)) return null;
        if (fa === 0) return a;
        if (fb === 0) return b;
        if (fa * fb > 0) return null;

        for (let i = 0; i < maxIter; i += 1) {
            const m = (a + b) / 2;
            const fm = f(m);
            if (!Number.isFinite(fm)) return null;
            if (Math.abs(fm) < 1e-10 || Math.abs(b - a) < 1e-9) return m;
            if (fa * fm <= 0) {
                b = m;
                fb = fm;
            } else {
                a = m;
                fa = fm;
            }
        }
        return (a + b) / 2;
    }

    function solveGeneralRealRoots(f) {
        const roots = [];
        const xMin = -100;
        const xMax = 100;
        const segments = 2000;
        const dx = (xMax - xMin) / segments;
        let px = xMin;
        let py = f(px);

        for (let i = 1; i <= segments; i += 1) {
            const x = xMin + i * dx;
            const y = f(x);
            if (!Number.isFinite(py) || !Number.isFinite(y)) {
                px = x;
                py = y;
                continue;
            }

            if (Math.abs(py) < 1e-8) {
                roots.push(px);
            }
            if (py * y < 0) {
                const r = bisectionRoot(f, px, x, 80);
                if (Number.isFinite(r)) roots.push(r);
            }

            px = x;
            py = y;
        }

        roots.sort((a, b) => a - b);
        const uniq = [];
        for (let i = 0; i < roots.length; i += 1) {
            const r = roots[i];
            if (!uniq.length || Math.abs(uniq[uniq.length - 1] - r) > 1e-5) {
                uniq.push(r);
            }
        }
        return uniq.slice(0, 8);
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
        steps.push('识别系数：a=' + formatNum(a) + ', b=' + formatNum(b) + ', c=' + formatNum(cc));

        const tol = 1e-8;
        if (Math.abs(a) < tol) {
            if (Math.abs(b) < tol) {
                const roots = solveGeneralRealRoots(f);
                if (!roots.length) {
                    if (allowComplex()) {
                        throw new Error('未识别出代数型方程，且当前仅支持一元二次复数公式解');
                    }
                    throw new Error('未在 [-100,100] 找到实数根');
                }
                const lines = roots.map((r, idx) => 'x' + (idx + 1) + ' ≈ ' + formatNum(r));
                steps.push('未识别为一次/二次，切换为数值法（区间扫描 + 二分）');
                lines.forEach((line) => steps.push(line));
                return { message: lines.join('，'), steps, roots };
            }
            const root = -cc / b;
            steps.push('一元一次方程：bx + c = 0');
            steps.push('x = -c / b = ' + formatNum(root));
            return { message: 'x = ' + formatNum(root), steps, roots: [root] };
        }

        const delta = b * b - 4 * a * cc;
        steps.push('判别式：Δ = b^2 - 4ac = ' + formatNum(delta));

        if (delta >= -tol) {
            const safeDelta = delta < 0 ? 0 : delta;
            const sqrtDelta = Math.sqrt(safeDelta);
            const x1 = (-b + sqrtDelta) / (2 * a);
            const x2 = (-b - sqrtDelta) / (2 * a);
            steps.push('x1 = (-b + √Δ)/(2a) = ' + formatNum(x1));
            steps.push('x2 = (-b - √Δ)/(2a) = ' + formatNum(x2));
            return { message: 'x1=' + formatNum(x1) + ', x2=' + formatNum(x2), steps, roots: [x1, x2] };
        }

        if (!allowComplex()) {
            steps.push('Δ < 0，当前设置为仅实数解');
            return { message: '无实数解', steps, roots: [] };
        }

        const imag = Math.sqrt(-delta) / (2 * a);
        const real = -b / (2 * a);
        const x1 = formatNum(real) + (imag >= 0 ? ' + ' : ' - ') + formatNum(Math.abs(imag)) + 'i';
        const x2 = formatNum(real) + (imag >= 0 ? ' - ' : ' + ') + formatNum(Math.abs(imag)) + 'i';
        steps.push('Δ < 0，按复数公式求解');
        steps.push('x1 = ' + x1);
        steps.push('x2 = ' + x2);
        return { message: 'x1=' + x1 + ', x2=' + x2, steps, roots: [x1, x2] };
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
            const p0 = pts[i - 1];
            const p1 = pts[i];
            if (!p0 || !p1) continue;
            if (Math.abs(p1.y) < 1e-7) {
                zeros.push({ x: p1.x, y: 0 });
                continue;
            }
            if (p0.y * p1.y < 0) {
                const t = p0.y / (p0.y - p1.y);
                const zx = p0.x + (p1.x - p0.x) * t;
                zeros.push({ x: zx, y: 0 });
            }
        }

        for (let i = 1; i < pts.length - 1; i += 1) {
            const a = pts[i - 1];
            const b = pts[i];
            const c = pts[i + 1];
            if (!a || !b || !c) continue;
            const upThenDown = b.y >= a.y && b.y >= c.y;
            const downThenUp = b.y <= a.y && b.y <= c.y;
            if (upThenDown || downThenUp) {
                extrema.push({ x: b.x, y: b.y, type: upThenDown ? 'max' : 'min' });
            }
        }

        const dedupe = (arr) => {
            const out = [];
            for (let i = 0; i < arr.length; i += 1) {
                const p = arr[i];
                if (!out.length || Math.abs(out[out.length - 1].x - p.x) > 0.06) out.push(p);
            }
            return out;
        };

        return {
            zeros: dedupe(zeros).slice(0, 5),
            extrema: dedupe(extrema).slice(0, 5)
        };
    }

    function renderGraph(expr) {
        if (!canvasEl) throw new Error('画布未初始化');
        const ctx = canvasEl.getContext('2d');
        if (!ctx) throw new Error('无法获取画布上下文');

        const { w, h } = getCanvasSize();
        fitCanvas(ctx, w, h);

        const sample = 600;
        const pts = [];
        let autoYMin = Infinity;
        let autoYMax = -Infinity;

        for (let i = 0; i <= sample; i += 1) {
            const x = graphState.xMin + (graphState.xMax - graphState.xMin) * (i / sample);
            let y = NaN;
            try {
                y = evalWithScope(expr, x);
            } catch (_) {
                y = NaN;
            }
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

        const pad = graphState.pad;
        const sx = (x) => pad + (x - graphState.xMin) * (w - pad * 2) / (graphState.xMax - graphState.xMin);
        const sy = (y) => h - pad - (y - graphState.yMin) * (h - pad * 2) / (graphState.yMax - graphState.yMin);

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const xStep = Math.max(1, Math.round((graphState.xMax - graphState.xMin) / 12));
        const yStep = Math.max(1, Math.round((graphState.yMax - graphState.yMin) / 10));
        for (let gx = Math.floor(graphState.xMin); gx <= Math.ceil(graphState.xMax); gx += xStep) {
            const px = sx(gx);
            ctx.moveTo(px, pad);
            ctx.lineTo(px, h - pad);
        }
        for (let gy = Math.floor(graphState.yMin); gy <= Math.ceil(graphState.yMax); gy += yStep) {
            const py = sy(gy);
            ctx.moveTo(pad, py);
            ctx.lineTo(w - pad, py);
        }
        ctx.stroke();

        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1.2;
        const x0 = sy(0);
        const y0 = sx(0);
        ctx.beginPath();
        ctx.moveTo(pad, x0);
        ctx.lineTo(w - pad, x0);
        ctx.moveTo(y0, pad);
        ctx.lineTo(y0, h - pad);
        ctx.stroke();

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < pts.length; i += 1) {
            const p = pts[i];
            if (!p) {
                started = false;
                continue;
            }
            const px = sx(p.x);
            const py = sy(p.y);
            if (!started) {
                ctx.moveTo(px, py);
                started = true;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();

        const keys = extractGraphKeyPoints(pts);
        ctx.fillStyle = '#ef4444';
        keys.zeros.forEach((p) => {
            ctx.beginPath();
            ctx.arc(sx(p.x), sy(0), 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#f59e0b';
        keys.extrema.forEach((p) => {
            ctx.beginPath();
            ctx.arc(sx(p.x), sy(p.y), 3, 0, Math.PI * 2);
            ctx.fill();
        });

        return {
            text: '图像已绘制，x∈[' + formatNum(graphState.xMin) + ', ' + formatNum(graphState.xMax) + ']',
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
        }

        graphState.lastExpr = expr;
        const rendered = renderGraph(expr);
        graphState.hasGraph = true;
        return rendered;
    }

    function buildGraphStepLines(graphResult) {
        const lines = ['模式：函数图像', '支持滚轮缩放与拖拽平移'];
        if (!graphResult || !graphResult.keyPoints) return lines;
        const zeros = graphResult.keyPoints.zeros || [];
        const extrema = graphResult.keyPoints.extrema || [];
        if (zeros.length) {
            lines.push('零点约：' + zeros.map((p) => '(' + formatNum(p.x) + ', 0)').join('，'));
        }
        if (extrema.length) {
            lines.push('极值点约：' + extrema.map((p) => '(' + formatNum(p.x) + ', ' + formatNum(p.y) + ')').join('，'));
        }
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
            const zoomIn = evt.deltaY < 0;
            const factor = zoomIn ? 0.9 : 1.12;

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

            try {
                renderGraph(graphState.lastExpr);
            } catch (_) {
                // Ignore transient render issues while dragging.
            }
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

        canvasEl.dataset.bound = '1';
    }

    function applyModeUI() {
        if (!inputEl) return;
        const mode = getMode();
        if (mode === 'equation') {
            inputEl.placeholder = '示例：x^2+2x+5=0，或 2x+1=7';
        } else if (mode === 'graph') {
            inputEl.placeholder = '示例：sin(x)+x/3 或 x^2-4';
        } else {
            inputEl.placeholder = '示例：sin(30)+2^3，nCr(10,3)，sqrt(2)+ln(5)';
        }
    }

    function handleEval() {
        const mode = getMode();
        const raw = inputEl ? inputEl.value : '';
        if (!raw.trim()) {
            throw new Error('请输入内容');
        }
        if (mode === 'equation') {
            const solved = solveEquation(raw);
            pushSteps(solved.steps);
            setResult('结果: ' + solved.message, true);
            if (latexEl) latexEl.value = exportLatex(raw);
            return;
        }
        if (mode === 'graph') {
            const rendered = drawGraph(raw);
            pushSteps(buildGraphStepLines(rendered));
            setResult('结果: ' + rendered.text, true);
            if (latexEl) latexEl.value = exportLatex(raw);
            return;
        }
        const value = evaluateExpression(raw);
        setAns(value);
        pushSteps(['模式：表达式', '计算结果 = ' + formatNum(value)]);
        setResult('结果: ' + formatNum(value), true);
        if (latexEl) latexEl.value = exportLatex(raw);
    }

    function handleAction(action) {
        if (!inputEl) return;
        if (action === 'clear') {
            inputEl.value = '';
            if (latexEl) latexEl.value = '';
            graphState.lastExpr = '';
            graphState.hasGraph = false;
            pushSteps([]);
            setResult('结果: -', true);
            return;
        }
        if (action === 'del') {
            inputEl.value = inputEl.value.slice(0, -1);
            return;
        }
        if (action === 'latex') {
            const latex = exportLatex(inputEl.value);
            if (latexEl) latexEl.value = latex;
            if (!latex) {
                setResult('结果: 请先输入表达式', false);
                return;
            }
            setResult('结果: LaTeX 已生成', true);
            toastApi.show('LaTeX 已生成', 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
            return;
        }
        if (action === 'plot') {
            try {
                const rendered = drawGraph(inputEl.value, { keepView: true });
                pushSteps(buildGraphStepLines(rendered));
                setResult('结果: ' + rendered.text, true);
            } catch (err) {
                setResult('结果: ' + (err && err.message ? err.message : '绘图失败'), false);
            }
            return;
        }
        if (action === 'derivative') {
            try {
                const deriv = computeDerivativeForXPoints(inputEl.value);
                pushSteps(deriv.lines);
                setResult('结果: ' + deriv.message, true);
            } catch (err) {
                setResult('结果: ' + (err && err.message ? err.message : '导数计算失败'), false);
            }
            return;
        }
        if (action === 'eval') {
            try {
                handleEval();
            } catch (err) {
                setResult('结果: ' + (err && err.message ? err.message : '计算失败'), false);
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

    function setDropdownValue(hiddenEl, labelEl, listEl, value, text) {
        if (hiddenEl) hiddenEl.value = value;
        if (labelEl) labelEl.textContent = text || value;
        [listEl].forEach((currentList) => {
            if (!currentList) return;
            currentList.querySelectorAll('.dropdown-item').forEach((item) => {
                const match = item.dataset.value === value;
                item.classList.toggle('selected', match);
                item.setAttribute('aria-selected', match ? 'true' : 'false');
            });
        });
        applyModeUI();
    }

    function setDropdownValueMulti(hiddenEl, labelEl, lists, value, text) {
        if (hiddenEl) hiddenEl.value = value;
        if (labelEl) labelEl.textContent = text || value;
        (lists || []).forEach((currentList) => {
            if (!currentList) return;
            currentList.querySelectorAll('.dropdown-item').forEach((item) => {
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
        const existing = document.getElementById(portalId);
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }

        const portalEl = document.createElement('div');
        portalEl.className = 'settings-dropdown-portal basex-dropdown-portal hidden';
        portalEl.id = portalId;
        const portalList = document.createElement('div');
        portalList.className = 'settings-dropdown-list';
        portalEl.appendChild(portalList);
        document.body.appendChild(portalEl);

        if (portalKey === 'mode') {
            modePortalEl = portalEl;
            modePortalListEl = portalList;
        } else if (portalKey === 'angle') {
            anglePortalEl = portalEl;
            anglePortalListEl = portalList;
        } else if (portalKey === 'complex') {
            complexPortalEl = portalEl;
            complexPortalListEl = portalList;
        }

        listEl.querySelectorAll('.dropdown-item').forEach((item) => {
            const clone = item.cloneNode(true);
            clone.addEventListener('click', () => {
                const val = clone.dataset.value || '';
                const labelText = clone.textContent || val;
                setDropdownValueMulti(hiddenEl, labelEl, [listEl, portalList], val, labelText);
                collapse();
            });
            portalList.appendChild(clone);
        });

        const positionPortal = () => {
            const rect = toggle.getBoundingClientRect();
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;
            const gap = 8;
            const portalW = portalEl.offsetWidth || Math.min(Math.max(220, rect.width + 24), viewportW - 16);
            let left = rect.left;
            left = Math.min(Math.max(8, left), Math.max(8, viewportW - portalW - 8));
            portalEl.style.left = left + 'px';

            const portalH = portalEl.offsetHeight || 240;
            const spaceBelow = viewportH - rect.bottom;
            const preferBelow = spaceBelow > portalH + gap || rect.top < 120;
            if (preferBelow) {
                portalEl.style.top = Math.min(viewportH - portalH - 8, rect.bottom + gap) + 'px';
            } else {
                portalEl.style.top = Math.max(8, rect.top - portalH - gap) + 'px';
            }
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
        const collapse = () => {
            close();
        };

        toggle.addEventListener('click', () => {
            const opened = dropdown.classList.contains('open');
            if (opened) close(); else open();
        });

        document.addEventListener('click', (evt) => {
            if (dropdown.contains(evt.target) || portalEl.contains(evt.target)) return;
            close();
        });
        window.addEventListener('resize', positionPortal);
        window.addEventListener('scroll', positionPortal, true);

        const initialVal = hiddenEl.value || '';
        const initialItem = listEl.querySelector('[data-value="' + initialVal + '"]') || listEl.querySelector('.dropdown-item');
        if (initialItem) {
            setDropdownValueMulti(hiddenEl, labelEl, [listEl, portalList], initialItem.dataset.value || initialVal, initialItem.textContent || initialVal);
        }

        dropdown.dataset.bound = '1';
    }

    function renderButtonMath(token) {
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
            '\\binom{n}{r}': '<span class="calc-math-binom"><span>n</span><span>r</span></span>'
        };
        return map[normalized] || '';
    }

    function renderCalcButtonLatex() {
        if (!calcGridEl) return;
        if (calcGridEl.dataset.mathRendered === '1') return;
        const buttons = calcGridEl.querySelectorAll('button[title]');
        buttons.forEach((btn) => {
            const token = (btn.getAttribute('title') || '').trim();
            const html = renderButtonMath(token);
            if (!html) return;
            btn.innerHTML = '<span class="calc-math">' + html + '</span>';
            btn.setAttribute('aria-label', token);
        });
        calcGridEl.dataset.mathRendered = '1';
    }

    function bindDelegated() {
        if (delegatedBound) return;
        delegatedBound = true;
        document.addEventListener('click', (evt) => {
            const btn = evt.target.closest('#calc-grid button');
            if (!btn) return;
            captureElements();
            const insert = btn.dataset.insert;
            const action = btn.dataset.action;
            if (insert) insertToken(insert);
            if (action) handleAction(action);
        });
    }

    function init() {
        captureElements();
        bindDelegated();
        if (!inputEl || !latexEl || !resultEl || !ansEl || !stepsEl || !canvasEl || !calcGridEl || !workModeEl || !angleModeEl || !complexModeEl || !pointX1El || !pointX2El) return false;

        bindPortalDropdown(modeDropdown, modeToggleEl, modeListEl, workModeEl, modeLabelEl, 'mode');
        bindPortalDropdown(angleDropdown, angleToggleEl, angleListEl, angleModeEl, angleLabelEl, 'angle');
        bindPortalDropdown(complexDropdown, complexToggleEl, complexListEl, complexModeEl, complexLabelEl, 'complex');
        bindCanvasInteractions();
        renderCalcButtonLatex();

        setAns(0);
        setResult('结果: -', true);
        pushSteps([]);
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
