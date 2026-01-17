// code.js
// 代码块一键复制功能

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.code-block').forEach(function (block) {
    var btn = block.querySelector('.copy-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var codeLines = block.querySelectorAll('.code-line');
      var code = Array.from(codeLines).map(line => line.textContent).join('\n');
      if (!code) {
        alert('未找到可复制的代码内容');
        return;
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(function () {
          btn.classList.add('copied');
          btn.title = '已复制!';
          setTimeout(function () {
            btn.classList.remove('copied');
            btn.title = '复制';
          }, 1200);
        }).catch(function (err) {
          alert('复制失败: ' + err);
        });
      } else {
        // fallback
        try {
          var textarea = document.createElement('textarea');
          textarea.value = code;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          btn.classList.add('copied');
          btn.title = '已复制!';
          setTimeout(function () {
            btn.classList.remove('copied');
            btn.title = '复制';
          }, 1200);
        } catch (e) {
          alert('复制失败: ' + e);
        }
      }
    });
  });
});
