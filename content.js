let pinnedChats = [];

// Native WhatsApp SVG Icons
const icons = {
    pin: `<svg viewBox="0 0 24 24" height="20" width="20" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M16 5V12L17.7 13.7C17.8 13.8 17.875 13.9125 17.925 14.0375C17.975 14.1625 18 14.2917 18 14.425V15C18 15.2833 17.9042 15.5208 17.7125 15.7125C17.5208 15.9042 17.2833 16 17 16H13V21.85C13 22.1333 12.9042 22.3708 12.7125 22.5625C12.5208 22.7542 12.2833 22.85 12 22.85C11.7167 22.85 11.4792 22.7542 11.2875 22.5625C11.0958 22.3708 11 22.1333 11 21.85V16H7C6.71667 16 6.47917 15.9042 6.2875 15.7125C6.09583 15.5208 6 15.2833 6 15V14.425C6 14.2917 6.025 14.1625 6.075 14.0375C6.125 13.9125 6.2 13.8 6.3 13.7L8 12V5C7.71667 5 7.47917 4.90417 7.2875 4.7125C7.09583 4.52083 7 4.28333 7 4C7 3.71667 7.09583 3.47917 7.2875 3.2875C7.47917 3.09583 7.71667 3 8 3H16C16.2833 3 16.5208 3.09583 16.7125 3.2875C16.9042 3.47917 17 3.71667 17 4C17 4.28333 16.9042 4.52083 16.7125 4.7125C16.5208 4.90417 16.2833 5 16 5ZM8.85 14H15.15L14 12.85V5H10V12.85L8.85 14Z"></path></svg>`,
    unpin: `<svg viewBox="0 0 24 24" height="20" width="20" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>`
};

browser.storage.local.get("customPins").then((res) => {
    if (res.customPins) {
        pinnedChats = res.customPins;
    }
});

const observer = new MutationObserver(() => {
    // 1. PIN BOARD INJECTION
    const chatListContainer = document.getElementById('pane-side') || document.querySelector('[aria-label="Chats"]');
    
    if (chatListContainer && !document.getElementById('custom-pin-board')) {
        const pinBoard = document.createElement('div');
        pinBoard.id = 'custom-pin-board';
        chatListContainer.parentElement.insertBefore(pinBoard, chatListContainer);
        renderPins();
    }

    // 2. GEOMETRY-BASED BUTTON INJECTION
    const headers = document.querySelectorAll('header');
    let activeChatHeader = null;

    for (let i = 0; i < headers.length; i++) {
        const rect = headers[i].getBoundingClientRect();
        if (rect.width > 0 && rect.left > 200) {
            activeChatHeader = headers[i];
            break;
        }
    }
    
    if (activeChatHeader && !document.getElementById('custom-pin-action')) {
        const titleSpans = activeChatHeader.querySelectorAll('span[dir="auto"]');
        let chatNameElement = null;
        
        for (let span of titleSpans) {
            if (span.innerText && span.innerText.trim().length > 0) {
                chatNameElement = span;
                break;
            }
        }
        
        if (chatNameElement) {
            const pinBtn = document.createElement('button');
            pinBtn.id = 'custom-pin-action';
            pinBtn.innerHTML = icons.pin;
            pinBtn.title = "Pin to Custom Board";
            
            Object.assign(pinBtn.style, {
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                marginLeft: '15px',
                marginRight: '15px',
                outline: 'none',
                flexShrink: '0', 
                display: 'flex',
                alignItems: 'center',
                color: 'var(--panel-header-icon)', // Native WA header icon color
                zIndex: '999'
            });

            // Hover effects
            pinBtn.onmouseover = () => pinBtn.style.opacity = '0.7';
            pinBtn.onmouseout = () => pinBtn.style.opacity = '1';

            pinBtn.onclick = () => {
                const chatName = chatNameElement.innerText;
                if (!pinnedChats.includes(chatName)) {
                    pinnedChats.push(chatName);
                    browser.storage.local.set({ customPins: pinnedChats });
                    renderPins();
                }
            };
            
            activeChatHeader.appendChild(pinBtn);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

function renderPins() {
    const board = document.getElementById('custom-pin-board');
    if (!board) return;
    board.innerHTML = ''; 
    
    Object.assign(board.style, {
        borderBottom: '1px solid var(--border-default)',
        backgroundColor: 'var(--background-default)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '200px',
        overflowY: 'auto',
        flexShrink: '0' 
    });

    if (pinnedChats.length === 0) {
        board.innerHTML = '<div style="padding: 15px; font-size: 13px; color: var(--secondary-lighter);">No custom pins yet. Open a chat and click the pin icon in the header.</div>';
        return;
    }

    pinnedChats.forEach(chatName => {
        const item = document.createElement('div');
        
        Object.assign(item.style, {
            padding: '12px 15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-list)',
            minHeight: '50px', 
            flexShrink: '0'
        });

        // Container for icon + text so they click together
        const nameContainer = document.createElement('div');
        Object.assign(nameContainer.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexGrow: '1',
            color: 'var(--primary-title)',
            fontFamily: 'inherit',
            fontSize: '15px'
        });

        const pinIcon = document.createElement('div');
        pinIcon.innerHTML = icons.pin;
        Object.assign(pinIcon.style, {
            display: 'flex',
            color: 'var(--icon-fixed)' // Native WA icon grey
        });

        const nameSpan = document.createElement('span');
        nameSpan.innerText = chatName;

        nameContainer.appendChild(pinIcon);
        nameContainer.appendChild(nameSpan);
        
        // Advanced Search Automation Macro
        nameContainer.onclick = () => {
            const searchBox = document.querySelector('input[aria-label="Search or start a new chat"]') || 
                              document.querySelector('input[type="text"]');
                              
            if (searchBox) {
                searchBox.focus();
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(searchBox, chatName);
                searchBox.dispatchEvent(new Event('input', { bubbles: true }));

                setTimeout(() => {
                    searchBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', keyCode: 13 }));

                    setTimeout(() => {
                        nativeInputValueSetter.call(searchBox, '');
                        searchBox.dispatchEvent(new Event('input', { bubbles: true }));
                        searchBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape', keyCode: 27 }));
                        searchBox.blur(); 
                    }, 150);
                    
                }, 400);
            }
        };

        const unpinBtn = document.createElement('div');
        unpinBtn.innerHTML = icons.unpin;
        
        Object.assign(unpinBtn.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--icon-fixed)',
            opacity: '0.6',
            padding: '5px',
            cursor: 'pointer'
        });
        
        unpinBtn.onmouseover = () => unpinBtn.style.opacity = '1';
        unpinBtn.onmouseout = () => unpinBtn.style.opacity = '0.6';
        
        unpinBtn.onclick = (e) => {
            e.stopPropagation(); 
            pinnedChats = pinnedChats.filter(c => c !== chatName);
            browser.storage.local.set({ customPins: pinnedChats });
            renderPins();
        };

        item.appendChild(nameContainer);
        item.appendChild(unpinBtn);
        board.appendChild(item);
    });
}