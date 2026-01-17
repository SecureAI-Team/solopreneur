// Xiaohongshu Content Filler

console.log('SoloMedia Xiaohongshu Assistant Loaded');

const createHelper = () => {
    const btn = document.createElement('div');
    btn.innerHTML = '📕 填充笔记';
    btn.style.cssText = `
        position: fixed;
        bottom: 15px;
        right: 15px;
        z-index: 9999;
        background: #ff2442;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-weight: bold;
        transition: all 0.2s;
    `;

    btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
    btn.onmouseout = () => btn.style.transform = 'translateY(0)';

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
    // Xiaohongshu Creator Center Logic

    // 1. Title Input
    const titleInput = document.querySelector('.c-input_inner') as HTMLInputElement; // Common class in XHS
    // Heuristic: Input with placeholder "填写标题"
    const inputs = document.querySelectorAll('input');
    let targetTitleInput = null;
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].placeholder.includes('标题')) {
            targetTitleInput = inputs[i];
            break;
        }
    }

    if (targetTitleInput) {
        setNativeValue(targetTitleInput, draft.title);
        targetTitleInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetTitleInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 2. Content Input (Usually custom div or textarea)
    // Often it's a div with id="post-textarea" or similar text editor
    const editor = document.querySelector('.ql-editor') || document.getElementById('post-textarea');
    if (editor) {
        (editor as HTMLElement).innerText = draft.content;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    alert('内容已填充，请核对');
};

function setNativeValue(element: HTMLInputElement, value: string) {
    const lastValue = element.value;
    element.value = value;
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
    const tracker = (element as any)._valueTracker;
    if (tracker) {
        tracker.setValue(lastValue);
    }
}

setTimeout(createHelper, 2000);
