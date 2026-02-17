// code.js
// 代码块一键复制功能

document.addEventListener('DOMContentLoaded', function () {
  var toast = window.globalCopyToast || { show: function () {}, hide: function () {} };
  document.querySelectorAll('.code-block').forEach(function (block) {
    var btn = block.querySelector('.copy-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var codeLines = block.querySelectorAll('.code-line');
      var code = Array.from(codeLines).map(function (line) { return line.textContent; }).join('\n');
      if (!code) {
        toast.show('未找到可复制的代码内容', 'error', 'icon-ic_fluent_error_circle_24_regular');
        return;
      }
      var mark = function () {
        btn.classList.add('copied');
        btn.title = '已复制!';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.title = '复制';
        }, 1200);
      };
      var successToast = function () {
        toast.show('复制成功', 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
      };
      var failureToast = function (reason) {
        toast.show('复制失败：' + (reason || '未知错误'), 'error', 'icon-ic_fluent_error_circle_24_regular');
        alert('复制失败: ' + (reason || '未知错误'));
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(function () {
          mark();
          successToast();
        }).catch(function (err) {
          failureToast(err && err.message ? err.message : err);
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
          mark();
          successToast();
        } catch (e) {
          failureToast(e && e.message ? e.message : e);
        }
      }
    });
  });
});
