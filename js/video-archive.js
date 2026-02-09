(function () {
    function wrapPills(card) {
        if (!card || card.querySelector('.video-pill-row')) return;
        var pills = Array.prototype.filter.call(card.children, function (child) {
            return child.classList && child.classList.contains('pill');
        });
        if (!pills.length) return;
        var row = document.createElement('div');
        row.className = 'video-pill-row';
        pills.forEach(function (pill) {
            row.appendChild(pill);
        });
        var title = card.querySelector('h3');
        if (title && title.parentNode === card) {
            if (title.nextSibling) {
                card.insertBefore(row, title.nextSibling);
            } else {
                card.appendChild(row);
            }
        } else {
            card.appendChild(row);
        }
    }

    function markCollectionPills(card) {
        if (!card) return;
        card.querySelectorAll('.pill').forEach(function (pill) {
            if (pill.textContent && pill.textContent.includes('合集')) {
                pill.classList.add('collection');
            }
        });
    }

    function adjustActionButtons(card) {
        if (!card) return;
        card.querySelectorAll('.video-actions a').forEach(function (link) {
            var text = (link.textContent || '').trim();
            if (!text) return;
            if (text.indexOf('链接已失效') !== -1) {
                link.removeAttribute('aria-disabled');
                link.classList.add('stale-link');
            }
            if (text.indexOf('链接已丢失') !== -1) {
                link.setAttribute('aria-disabled', 'true');
            }
        });
    }

    function applyMasonry(grid) {
        if (!grid || !grid.classList.contains('grid-view')) return true;
        var styles = window.getComputedStyle(grid);
        var rowHeight = parseFloat(styles.getPropertyValue('grid-auto-rows'));
        var gapValue = parseFloat(styles.getPropertyValue('row-gap'));
        var rowGap = Number.isNaN(gapValue) ? 0 : gapValue;
        if (!rowHeight) return false;
        var cards = grid.querySelectorAll('.video-card');
        cards.forEach(function (card) {
            var cardHeight = card.getBoundingClientRect().height;
            var rowSpan = Math.ceil((cardHeight + rowGap) / (rowHeight + rowGap));
            card.style.gridRowEnd = 'span ' + rowSpan;
        });
        return true;
    }

    function resetMasonry(grid) {
        if (!grid) return;
        grid.querySelectorAll('.video-card').forEach(function (card) {
            card.style.gridRowEnd = '';
        });
    }

    function initVideoArchivePage(root) {
        var scope = root || document;
        var grid = scope.querySelector('.video-grid');
        if (!grid) return;

        var cards = grid.querySelectorAll('.video-card');
        cards.forEach(function (card) {
            wrapPills(card);
            markCollectionPills(card);
            adjustActionButtons(card);
        });

        if (grid.dataset.viewSwitchBound === '1') return;
        grid.dataset.viewSwitchBound = '1';

        // Add collection badge for multi-image thumbs.
        var thumbs = scope.querySelectorAll('.video-thumb');
        thumbs.forEach(function (thumb) {
            var imgs = thumb.querySelectorAll('img');
            if (imgs.length >= 2) {
                if (!thumb.querySelector('.video-badge.collection')) {
                    var badge = document.createElement('span');
                    badge.className = 'video-badge collection';
                    badge.textContent = '合集';
                    thumb.appendChild(badge);
                }
            }
        });

        var gridBtn = scope.querySelector('#grid-view-btn');
        var listBtn = scope.querySelector('#list-view-btn');
        if (!gridBtn || !listBtn) return;

        var masonryRaf = 0;
        function scheduleMasonry() {
            if (masonryRaf) {
                cancelAnimationFrame(masonryRaf);
            }
            masonryRaf = requestAnimationFrame(function () {
                masonryRaf = 0;
                if (!grid.classList.contains('grid-view')) return;
                if (!applyMasonry(grid)) {
                    scheduleMasonry();
                }
            });
        }

        function setGridView() {
            grid.classList.remove('list-view');
            grid.classList.add('grid-view');
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            scheduleMasonry();
        }

        function setListView() {
            if (masonryRaf) {
                cancelAnimationFrame(masonryRaf);
                masonryRaf = 0;
            }
            grid.classList.remove('grid-view');
            grid.classList.add('list-view');
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            resetMasonry(grid);
        }

        gridBtn.addEventListener('click', setGridView);
        listBtn.addEventListener('click', setListView);

        if (grid.dataset.masonryBound !== '1') {
            grid.dataset.masonryBound = '1';
            window.addEventListener('resize', scheduleMasonry);
            window.addEventListener('load', scheduleMasonry, { once: true });
            grid.querySelectorAll('img').forEach(function (img) {
                img.addEventListener('load', scheduleMasonry, { passive: true });
                if (img.complete) {
                    scheduleMasonry();
                }
            });
        }

        setGridView();
    }

    function init() {
        initVideoArchivePage(document);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    window.addEventListener('spa:page:loaded', function () {
        initVideoArchivePage(document);
    });
})();
