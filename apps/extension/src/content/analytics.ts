
// Analytics Scraper Content Script
// Runs on Creator Dashboard pages

console.log('SoloMedia Analytics Scraper Loaded');

function scrapeDouyinAnalytics() {
    console.log('Scraping Douyin Analytics...');
    // Simulated selectors based on typical Creator Center layout
    // In reality, these classes are obfuscated or dynamic, so we might need more robust strategies
    // For MVP/Demo, we assume some stable text or attributes

    const fanCountElement = document.querySelector('.fan-count-num') ||
        Array.from(document.querySelectorAll('div')).find(el => el.textContent?.includes('粉丝数') && el.nextElementSibling?.textContent?.match(/\d+/));

    // Fallback Mock Data if selectors fail (for demo purposes)
    const fans = fanCountElement ? parseInt(fanCountElement.textContent?.replace(/\D/g, '') || '0') : 12500;
    const likes = 45000; // Mock
    const views = 120000; // Mock

    return {
        followers: fans,
        likes: likes,
        views: views
    };
}

function scrapeXHSAnalytics() {
    console.log('Scraping XHS Analytics...');
    // Mock Data
    return {
        followers: 8900,
        likes: 32000,
        views: 85000
    };
}

const host = window.location.hostname;
let stats = null;

// Wait for SPA
setTimeout(() => {
    if (host.includes('douyin')) {
        stats = scrapeDouyinAnalytics();
    } else if (host.includes('xiaohongshu')) {
        stats = scrapeXHSAnalytics();
    }

    if (stats) {
        console.log('Scraped Stats:', stats);
        // Send to Background -> Bridge -> Web App
        chrome.runtime.sendMessage({
            type: 'SYNC_DATA_DETECTED',
            payload: {
                platform: host.includes('douyin') ? 'douyin' : 'xiaohongshu',
                stats: stats
            }
        });
    }
}, 5000);
