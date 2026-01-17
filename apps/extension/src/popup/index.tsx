import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';

const Popup = () => {
    const [draft, setDraft] = useState<any>(null);

    useEffect(() => {
        chrome.storage.local.get('current_draft', (data) => {
            setDraft(data.current_draft);
        });
    }, []);

    const clearDraft = async () => {
        await chrome.storage.local.remove('current_draft');
        setDraft(null);
    };

    return (
        <div className="popup-container">
            <header>
                <div className="logo">SoloMedia</div>
                <div className="version">v0.1.0</div>
            </header>

            <main>
                {draft ? (
                    <div>
                        <div className="card">
                            <div className="label">当前待发布</div>
                            <h3>{draft.title || '无标题'}</h3>
                            <p className="content">{draft.content || '无内容'}</p>
                            <div className="tags">
                                {draft.platforms?.map((p: string) => (
                                    <span key={p} className="tag">{p}</span>
                                ))}
                            </div>
                        </div>

                        <div className="tips">
                            👉 前往目标平台创作中心，点击页面右下角的 "🤖 填充内容" 悬浮球。
                        </div>

                        <button onClick={clearDraft} className="btn-clear">
                            清除当前缓存
                        </button>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p style={{ fontSize: '14px' }}>暂无待发布内容</p>
                        <p style={{ fontSize: '12px', marginTop: '4px' }}>
                            在 SoloMedia 创作页面点击 "复制发布" 即可同步到此处
                        </p>
                    </div>
                )}
            </main>

            <footer>
                SoloMedia Browser Assistant
            </footer>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
