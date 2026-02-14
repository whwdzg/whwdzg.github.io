(function(){
    var container = document.querySelector('[data-column-directory]');
    if (!container) return;
    var content = container.querySelector('[data-column-directory-content]');
    if (!content) return;

    var headingSelector = '.column-stack h3, .column-stack h4, .column-stack h5';
    var matches = Array.prototype.slice.call(document.querySelectorAll(headingSelector));
    var entries = [];

    for (var i = 0; i < matches.length; i++) {
        var heading = matches[i];
        var text = heading.textContent.trim();
        if (!text) continue;
        entries.push({ node: heading, text: text, level: parseInt(heading.tagName.charAt(1), 10) });
    }

    if (!entries.length) {
        content.innerHTML = '<p class="column-directory__empty">暂无可用于构建目录的小标题。</p>';
        return;
    }

    content.innerHTML = '';
    var list = document.createElement('ul');
    list.className = 'column-directory__list';

    entries.forEach(function(entry, index){
        if (!entry.node) return;
        if (isNaN(entry.level) || entry.level < 3 || entry.level > 5) return;

        if (!entry.node.id) {
            var slug = slugify(entry.text) || 'heading-' + index;
            entry.node.id = 'column-' + entry.level + '-' + slug + '-' + index;
        }

        var item = document.createElement('li');
        item.className = 'column-directory__item column-directory__level-' + entry.level;

        var link = document.createElement('a');
        link.className = 'column-directory__link';
        link.href = '#' + entry.node.id;
        link.textContent = entry.text;

        item.appendChild(link);
        list.appendChild(item);
    });

    if (!list.childElementCount) {
        content.innerHTML = '<p class="column-directory__empty">暂无可用于构建目录的小标题。</p>';
        return;
    }

    content.appendChild(list);

    function slugify(value) {
        return value.toLowerCase()
            .replace(/[\s]+/g, '-')
            .replace(/[^\w\u4e00-\u9fff\u3040-\u30ff\u3130-\u318f\u0400-\u04ff-]+/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
})();