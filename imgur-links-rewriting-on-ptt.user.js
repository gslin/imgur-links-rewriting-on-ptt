// ==UserScript==
// @name        Imgur links rewriting on Ptt
// @namespace   https://github.com/gslin/imgur-links-rewriting-on-ptt
// @match       https://www.ptt.cc/bbs/*
// @grant       GM_xmlhttpRequest
// @version     0.20210822.0
// @author      Gea-Suan Lin <gslin@gslin.com>
// @description Rewrite imgur links to bypass referrer check.
// @license     MIT
// ==/UserScript==

(() => {
    'use strict';

    const get_imgur_id = url => {
        return url.replace(/^https?:\/\/(i\.)?imgur\.com\/(\w+).*/, '$2');
    };

    document.querySelectorAll('a[href^="https://imgur.com/"], a[href^="https://i.imgur.com/"]').forEach(async el => {
        // Remove .richcontent if existing.
        const next = el.nextElementSibling;
        if (next && next.classList.contains('richcontent')) {
            next.remove();
        }

        const href = el.getAttribute('href');
        let imgur_id = '';

        if (href.match(/^https:\/\/imgur\.com\/a\//)) {
            // album case.
            const res = await new Promise(resolve => {
                GM_xmlhttpRequest({
                    'anonymous': true,
                    'headers': {
                        'Referer': 'https://imgur.com/',
                    },
                    'method': 'GET',
                    'onload': res => {
                        resolve(res.responseText);
                    },
                    'url': href,
                });
            });

            const parser = new DOMParser();
            const doc = parser.parseFromString(res, 'text/html');

            const og_image = doc.querySelector('meta[property="og:image"]');
            const img_url = og_image.getAttribute('content');

            imgur_id = get_imgur_id(img_url);
            console.log(imgur_id);
        } else {
            // image case.
            imgur_id = get_imgur_id(href);
        }

        const container = document.createElement('div');
        container.setAttribute('style', 'margin-top:0.5em;text-align:center;');

        const img = document.createElement('img');
        img.setAttribute('referrerpolicy', 'no-referrer');
        img.setAttribute('src', 'https://i.imgur.com/' + imgur_id + '.webp');
        container.appendChild(img);

        el.insertAdjacentElement('afterend', container);
    });
})();
