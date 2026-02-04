import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { resizeLayout } from '../../utils/windowResize.js';

export class MainView extends LitElement {
    static styles = css`
        * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            cursor: default;
            user-select: none;
        }

        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .start-button {
            background: var(--start-button-background);
            color: var(--start-button-color);
            border: none;
            padding: 12px 24px;
            border-radius: 3px;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background 0.1s ease;
        }

        .start-button:hover {
            background: var(--start-button-hover-background);
        }

        .start-button.initializing {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .shortcut-hint {
            font-size: 11px;
            color: var(--text-muted);
            font-family: 'SF Mono', Monaco, monospace;
        }
    `;

    static properties = {
        onStart: { type: Function },
        isInitializing: { type: Boolean },
    };

    constructor() {
        super();
        this.onStart = () => {};
        this.isInitializing = false;
        this.boundKeydownHandler = this.handleKeydown.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        window.electron?.ipcRenderer?.on('session-initializing', (event, isInitializing) => {
            this.isInitializing = isInitializing;
        });
        document.addEventListener('keydown', this.boundKeydownHandler);
        resizeLayout();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.electron?.ipcRenderer?.removeAllListeners('session-initializing');
        document.removeEventListener('keydown', this.boundKeydownHandler);
    }

    handleKeydown(e) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isStartShortcut = isMac ? e.metaKey && e.key === 'Enter' : e.ctrlKey && e.key === 'Enter';
        if (isStartShortcut) {
            e.preventDefault();
            this.handleStartClick();
        }
    }

    handleStartClick() {
        if (this.isInitializing) return;
        this.onStart();
    }

    getStartButtonText() {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const shortcut = isMac ? 'Cmd+Enter' : 'Ctrl+Enter';
        return html`Start <span class="shortcut-hint">${shortcut}</span>`;
    }

    render() {
        return html`
            <button @click=${this.handleStartClick} class="start-button ${this.isInitializing ? 'initializing' : ''}">
                ${this.getStartButtonText()}
            </button>
        `;
    }
}

customElements.define('main-view', MainView);
