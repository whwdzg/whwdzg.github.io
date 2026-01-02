// image-loader.nomodule.js - non-module fallback
(function(){
    if(window.__imageLoaderInitialized) return;
    window.__imageLoaderInitialized = true;

    if(!document.getElementById('image-loader-style')){
        var css = "\
.img-loader-wrap{position:relative;display:inline-block;}\
.img-loader-overlay{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.6);backdrop-filter:blur(2px);}\
.img-loader-progress{background:rgba(0,0,0,0.6);color:#fff;padding:6px 10px;border-radius:14px;font-size:12px;}\
";
        var s = document.createElement('style'); s.id='image-loader-style'; s.textContent = css; document.head.appendChild(s);
    }

    function attachLoader(img){
        try{
            if(!img || img.dataset.__loaderAttached) return;
            img.dataset.__loaderAttached = '1';
            var src = img.getAttribute('data-src') || img.getAttribute('src') || '';
            if(!src){ var ss = img.getAttribute('data-srcset') || img.getAttribute('srcset') || ''; if(ss){ src = ss.split(',')[0].trim().split(' ')[0]; } }
            if(!src) return;
            var parent = img.parentNode;
            var wrap = document.createElement('span'); wrap.className='img-loader-wrap'; parent.replaceChild(wrap,img); wrap.appendChild(img);
            var overlay = document.createElement('div'); overlay.className='img-loader-overlay'; var pct = document.createElement('div'); pct.className='img-loader-progress'; pct.textContent='0%'; overlay.appendChild(pct); wrap.appendChild(overlay);
            function done(){ overlay.remove(); }
            if(img.complete && img.naturalWidth){ done(); return; }
            try{
                var xhr = new XMLHttpRequest(); xhr.open('GET', src, true); xhr.responseType='blob';
                xhr.onprogress = function(e){ if(e.lengthComputable){ var v=Math.round(e.loaded/e.total*100); pct.textContent=v+'%'; }};
                xhr.onload = function(){ if(xhr.status>=200 && xhr.status<300){ var blob=xhr.response; var url=URL.createObjectURL(blob); img.src=url; img.addEventListener('load', function(){ done(); setTimeout(function(){ URL.revokeObjectURL(url); },1000); }, { once: true }); img.addEventListener('error', function(){ pct.textContent='加载失败'; }, { once: true }); } else { fallback(); } };
                xhr.onerror = xhr.onabort = function(){ fallback(); };
                xhr.send(null);
            }catch(err){ fallback(); }
            function fallback(){ pct.textContent='加载中'; img.src = src; img.addEventListener('load', function(){ done(); }, { once: true }); img.addEventListener('error', function(){ pct.textContent='加载失败'; }, { once: true }); }
        }catch(e){ console.error('[image-loader] attach error', e); }
    }

    function scanInitial(){ var imgs = Array.prototype.slice.call(document.getElementsByTagName('img')); imgs.forEach(function(img){ if(img.classList.contains('no-progress')) return; if(!img.getAttribute('data-src') && !img.classList.contains('lazyload')){ attachLoader(img); } }); }
    document.addEventListener('lazybeforeunveil', function(e){ var el = e.target; if(el && el.tagName === 'IMG'){ attachLoader(el); } }, true);
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scanInitial, { once: true }); else scanInitial();
})();
