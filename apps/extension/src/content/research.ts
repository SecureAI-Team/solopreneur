
// Research Crawler Content Script
// Runs on Douyin/XHS Search Result Pages

console.log('SoloMedia Research Crawler Loaded');

function scrapeDouyin() {
    console.log('Scraping Douyin Results...');
    const items = document.querySelectorAll('[data-e2e="search-card-item"]'); // 抖音搜索卡片 selector (需根据实际 DOM 调整)
    // Fallback if specific selector fails
    const listItems = items.length ? items : document.querySelectorAll('ul li');

    const results = Array.from(listItems).slice(0, 20).map(item => {
        const titleEl = item.querySelector('.title') || item.querySelector('p') || item.querySelector('a');
        const likeEl = item.querySelector('.like-count') || item.innerText.match(/(\d+)赞/);

        return {
            title: titleEl?.textContent?.trim() || 'No Title',
            likes: likeEl ? (typeof likeEl === 'string' ? likeEl : likeEl.textContent) : '0',
            link: item.querySelector('a')?.href || ''
        };
    }).filter(r => r.title !== 'No Title');

    return results;
}

function scrapeXHS() {
    console.log('Scraping XHS Results...');
    const items = document.querySelectorAll('.note-item'); // 小红书笔记卡片

    const results = Array.from(items).slice(0, 20).map(item => {
        const titleEl = item.querySelector('.title');
        const likeEl = item.querySelector('.like-wrapper .count');
        const userEl = item.querySelector('.user .name');

        return {
            title: titleEl?.textContent?.trim() || 'No Title',
            likes: likeEl?.textContent?.trim() || '0',
            author: userEl?.textContent?.trim(),
            link: item.querySelector('a')?.href || ''
        };
    }).filter(r => r.title !== 'No Title');

    return results;
}

// Auto-run when page loads
const host = window.location.hostname;
let results = [];

// Wait a bit for SPA to load
setTimeout(() => {
    if (host.includes('douyin')) {
        results = scrapeDouyin();
    } else if (host.includes('xiaohongshu')) {
        results = scrapeXHS();
    }

    if (results.length > 0) {
        console.log('Crawled Data:', results);
        chrome.runtime.sendMessage({
            type: 'CRAWLER_DATA_DETECTED',
            payload: {
                platform: host.includes('douyin') ? 'douyin' : 'xiaohongshu',
                rawData: results
            }
        });
    } else {
        console.log('No results found, waiting more...');
        // Retry logic could go here
    }
}, 3000);
