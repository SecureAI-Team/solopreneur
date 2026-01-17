// Solomedia Bridge Content Script
// Listens for content from the web app and saves it to chrome storage
// Also relays messages between Web App and Extension Background

console.log('SoloMedia Bridge Loaded');

// 1. Web App -> Extension (Forwarding)
window.addEventListener('message', async (event) => {
    if (event.origin !== window.location.origin) return;

    // Handle Content Sync (Draft Save)
    if (event.data?.type === 'SOLOMEDIA_SYNC_CONTENT') {
        const { title, content, platforms } = event.data.payload;
        console.log('Bridge: Received content sync request');
        try {
            await chrome.storage.local.set({
                'current_draft': {
                    title, content, platforms, updatedAt: new Date().toISOString()
                }
            });
            window.postMessage({ type: 'SOLOMEDIA_SYNC_SUCCESS' }, window.location.origin);
        } catch (e) {
            console.error('Bridge Error:', e);
        }
    }

    // Handle Research Request
    if (event.data?.type === 'SOLOMEDIA_RESEARCH_START') {
        console.log('Bridge: Forwarding Research Request');
        chrome.runtime.sendMessage({
            type: 'SOLOMEDIA_RESEARCH_START',
            payload: event.data.payload
        });
    }

    // Handle Sync Request
    if (event.data?.type === 'SOLOMEDIA_SYNC_START') {
        console.log('Bridge: Forwarding Sync Request');
        chrome.runtime.sendMessage({
            type: 'SOLOMEDIA_SYNC_START',
            payload: event.data.payload
        });
    }
});

// 2. Extension Background -> Web App (Relay)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Bridge: Received message from background', message);

    // Forward research results to Web App
    if (message.type === 'SOLOMEDIA_RESEARCH_COMPLETE') {
        window.postMessage({
            type: 'SOLOMEDIA_RESEARCH_COMPLETE',
            payload: message.payload
        }, window.location.origin);
    }

    // Forward sync results to Web App
    if (message.type === 'SOLOMEDIA_SYNC_COMPLETE') {
        window.postMessage({
            type: 'SOLOMEDIA_SYNC_COMPLETE',
            payload: message.payload
        }, window.location.origin);
    }
});
