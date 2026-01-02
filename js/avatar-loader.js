// avatar-loader.js
// 提供带百分比的头像加载器，导出 initAvatarLoader
export function initAvatarLoader(){
    try{
        var img = document.getElementById('avatar-btn');
        if(!img) return;

        var src = img.getAttribute('data-src') || img.getAttribute('src');
        if(!src) return;

        // 创建覆盖节点
        var wrap = document.createElement('div');
        wrap.className = 'avatar-loader-wrap';
        wrap.style.position = 'relative';
        wrap.style.display = 'inline-block';

        var progress = document.createElement('div');
        progress.className = 'avatar-loader-progress';
        progress.style.position = 'absolute';
        progress.style.left = '50%';
        progress.style.top = '50%';
        progress.style.transform = 'translate(-50%,-50%)';
        progress.style.background = 'rgba(0,0,0,0.5)';
        progress.style.color = '#fff';
        progress.style.padding = '4px 8px';
        progress.style.borderRadius = '12px';
        progress.style.fontSize = '12px';
        progress.textContent = '0%';

        // 将 img 包装
        var parent = img.parentNode;
        parent.replaceChild(wrap, img);
        wrap.appendChild(img);
        wrap.appendChild(progress);

        // Helper: finish cleanup
        function done(){
            progress.remove();
            wrap.style.position = '';
            img.classList.remove('loading');
        }

        // 优先尝试 XHR 以获取进度（同源或允许 CORS）
        try{
            var xhr = new XMLHttpRequest();
            xhr.open('GET', src, true);
            xhr.responseType = 'blob';
            xhr.onprogress = function(e){
                if(e.lengthComputable){
                    var pct = Math.round((e.loaded / e.total) * 100);
                    progress.textContent = pct + '%';
                }
            };
            xhr.onload = function(){
                if(xhr.status >= 200 && xhr.status < 300){
                    var blob = xhr.response;
                    var url = URL.createObjectURL(blob);
                    img.src = url;
                    img.addEventListener('load', function(){
                        done();
                        // 释放临时 URL
                        setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
                    }, { once: true });
                } else {
                    // fallback to Image
                    fallbackLoad();
                }
            };
            xhr.onerror = xhr.onabort = function(){ fallbackLoad(); };
            xhr.send(null);
        }catch(err){
            fallbackLoad();
        }

        function fallbackLoad(){
            // 使用 Image 对象加载，无法显示真实百分比，改为转圈动画
            progress.textContent = '加载中';
            img.src = src; // 直接赋值
            img.addEventListener('load', function(){ done(); }, { once: true });
            img.addEventListener('error', function(){ progress.textContent = '加载失败'; }, { once: true });
        }
    }catch(e){ console.error('[avatar-loader] error', e); }
}
