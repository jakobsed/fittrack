/* ========================================
   Modal Component - Fitapp
   Bottom sheets and center modals
   ======================================== */

const Modal = {
    container: null,
    currentModal: null,
    onClose: null,

    init() {
        this.container = document.getElementById('modal-container');
    },

    // Show a bottom sheet modal
    showSheet(options) {
        const { title, content, footer, onClose } = options;
        this.onClose = onClose;

        const html = `
            <div class="modal-backdrop" onclick="Modal.close()"></div>
            <div class="modal-sheet">
                <div class="modal-handle"></div>
                ${title ? `
                    <div class="modal-header">
                        <h2 class="modal-title">${title}</h2>
                        <button class="modal-close" onclick="Modal.close()">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                ` : ''}
                <div class="modal-content">
                    ${content}
                </div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;

        this.container.innerHTML = html;
        this.currentModal = this.container.querySelector('.modal-sheet');

        // Trigger animation
        requestAnimationFrame(() => {
            this.container.querySelector('.modal-backdrop').classList.add('active');
            this.currentModal.classList.add('active');
        });

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    },

    // Show a center modal
    showCenter(options) {
        const { title, content, footer, onClose } = options;
        this.onClose = onClose;

        const html = `
            <div class="modal-backdrop" onclick="Modal.close()"></div>
            <div class="modal-center">
                ${title ? `
                    <div class="modal-header" style="padding: var(--spacing-md); border-bottom: 1px solid var(--color-border);">
                        <h2 class="modal-title">${title}</h2>
                        <button class="modal-close" onclick="Modal.close()">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                ` : ''}
                <div class="modal-content" style="padding: var(--spacing-md);">
                    ${content}
                </div>
                ${footer ? `<div class="modal-footer" style="padding: var(--spacing-md); border-top: 1px solid var(--color-border);">${footer}</div>` : ''}
            </div>
        `;

        this.container.innerHTML = html;
        this.currentModal = this.container.querySelector('.modal-center');

        // Trigger animation
        requestAnimationFrame(() => {
            this.container.querySelector('.modal-backdrop').classList.add('active');
            this.currentModal.classList.add('active');
        });

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    },

    // Show a confirm dialog
    confirm(options) {
        return new Promise((resolve) => {
            const { title, message, confirmText = 'Bestätigen', cancelText = 'Abbrechen', danger = false } = options;

            const content = `<p style="color: var(--color-text-secondary);">${message}</p>`;
            const footer = `
                <div style="display: flex; gap: var(--spacing-sm);">
                    <button class="btn btn-outline btn-full" onclick="Modal.close(); Modal._resolve(false);">
                        ${cancelText}
                    </button>
                    <button class="btn ${danger ? 'btn-primary' : 'btn-primary'} btn-full" 
                            style="${danger ? 'background: var(--color-error);' : ''}"
                            onclick="Modal.close(); Modal._resolve(true);">
                        ${confirmText}
                    </button>
                </div>
            `;

            this._resolve = resolve;
            this.showCenter({ title, content, footer });
        });
    },

    // Close current modal
    close() {
        if (!this.currentModal) return;

        const backdrop = this.container.querySelector('.modal-backdrop');
        backdrop.classList.remove('active');
        this.currentModal.classList.remove('active');

        // Wait for animation
        setTimeout(() => {
            this.container.innerHTML = '';
            this.currentModal = null;
            document.body.style.overflow = '';

            if (this.onClose) {
                this.onClose();
                this.onClose = null;
            }
        }, 300);
    },

    // Check if modal is open
    isOpen() {
        return this.currentModal !== null;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Modal.init();
});
