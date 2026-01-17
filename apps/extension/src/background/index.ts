// Background Service Worker
// Handles message routing between Web App, Popup, and Content Scripts

let solomediaTabId: number | null = null;

// Listen for connection from Solomedia Web Bridge
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 1. Handle messages from Solomedia Web App (via Bridge)
    if (message.type === 'SOLOMEDIA_RESEARCH_START') {
        console.log('[Background] Starting Research:', message.payload);

        // Save the Web App Tab ID to reply later
        if (sender.tab?.id) {
            solomediaTabId = sender.tab.id;
        }

        const { keyword, platform } = message.payload;

        if (platform === 'douyin') {
            const searchUrl = `https://www.douyin.com/search/${encodeURIComponent(keyword)}`;
            chrome.tabs.create({ url: searchUrl, active: true }, (tab) => {
                // Inject research script or wait for content script to activate
                // We will rely on manifest content_scripts matching douyin.com
            });
        } else if (platform === 'xiaohongshu') {
            const searchUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}&source=web_search_result_notes`;
            chrome.tabs.create({ url: searchUrl, active: true });
        }
    }

    // 2. Handle messages from Solomedia Web App (Sync Trigger)
    if (message.type === 'SOLOMEDIA_SYNC_START') {
        console.log('[Background] Starting Sync');
        if (sender.tab?.id) solomediaTabId = sender.tab.id;

        // Open different tabs for different platforms to scrape
        // For MVP, just open Douyin Creator
        chrome.tabs.create({ url: 'https://creator.douyin.com/creator-micro/home', active: false });
    }

    // 3. Handle data returned from Platform Content Scripts (Crawler results)
    if (message.type === 'CRAWLER_DATA_DETECTED') {
        console.log('[Background] Crawler Data Received:', message.payload);

        // Forward back to Solomedia Web App
        if (solomediaTabId) {
            chrome.tabs.sendMessage(solomediaTabId, {
                type: 'SOLOMEDIA_RESEARCH_COMPLETE',
                payload: message.payload
            });

            // Optional: Close the scraper tab if auto-opened
            if (sender.tab?.id) {
                // chrome.tabs.remove(sender.tab.id); 
                // Keep open for debug for now
            }
        }
    }

    // 4. Handle sync data from Platform
    if (message.type === 'SYNC_DATA_DETECTED') {
        console.log('[Background] Sync Data Received:', message.payload);
        if (solomediaTabId) {
            chrome.tabs.sendMessage(solomediaTabId, {
                type: 'SOLOMEDIA_SYNC_COMPLETE',
                payload: message.payload
            });
        }
    }
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('SoloMedia Assistant Installed');
});

