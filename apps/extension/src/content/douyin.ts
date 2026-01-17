// Douyin Content Filler

console.log('SoloMedia Douyin Assistant Loaded');

// Create a floating helper button
const createHelper = () => {
    const btn = document.createElement('div');
    btn.innerHTML = '🤖 填充内容';
    btn.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(to right, #8b5cf6, #6366f1);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: bold;
        transition: transform 0.2s;
    `;

    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';

    btn.onclick = async () => {
        try {
            const data = await chrome.storage.local.get('current_draft');
            if (data.current_draft) {
                fillContent(data.current_draft);
            } else {
                alert('暂无待发布内容，请先在SoloMedia中创作并同步');
            }
        } catch (e) {
            console.error(e);
            alert('读取数据失败');
        }
    };

    document.body.appendChild(btn);
};

const fillContent = async (draft: any) => {
    console.log('Filling content:', draft);

    // Simulate typing or setting value logic needed for Douyin's React/Vue inputs
    // This is complex because Douyin uses custom editors (Prosemirror/DraftJS etc)

    // 1. Try to find Title Input
    // Selectors need to be up to date. This is a heuristic attempt.
    const titleInput = document.querySelector('input[placeholder*="标题"]') as HTMLInputElement;
    if (titleInput) {
        setNativeValue(titleInput, draft.title);
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.warn('Title input not found');
    }

    // 2. Try to find Content/Description Input
    // Douyin often uses a contenteditable div
    const editor = document.querySelector('.zone-container') || document.querySelector('[contenteditable="true"]');
    if (editor) {
        // For contenteditable, we might need to simply focus it and maybe paste?
        // Or set innerHTML if safe.
        (editor as HTMLElement).innerText = draft.content;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.warn('Editor not found');
    }

    // 3. Topics/Tags
    // Complex to automate...

    alert('内容填充尝试完成，请检查');
};

// Helper: Trigger React/Vue change events
function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
    const lastValue = element.value;
    element.value = value;
    const event = new Event('input', { bubbles: true });
    // React 16+ hack
    const tracker = (element as any)._valueTracker;
    if (tracker) {
        tracker.setValue(lastValue);
    }
    element.dispatchEvent(event);
}

// Initial delay to wait for page load
setTimeout(createHelper, 2000);
