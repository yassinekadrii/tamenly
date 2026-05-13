/**
 * @file public/js/notifications.js
 * @description Client-side notification system using Toastify.
 */

// Configuration for notifications
(function () {
    // Inject Styles
    const styles = `
        #notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        }

        .toast-notification {
            min-width: 300px;
            max-width: 450px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            background: white;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(120%);
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.4s ease;
            opacity: 0;
            pointer-events: auto;
            border-left: 5px solid #6366f1;
            font-family: 'Inter', sans-serif;
        }

        .toast-notification.show {
            transform: translateX(0);
            opacity: 1;
        }

        .toast-notification.success {
            border-left-color: #10b981;
        }

        .toast-notification.error {
            border-left-color: #ef4444;
        }

        .toast-notification.info {
            border-left-color: #6366f1;
        }

        .toast-icon {
            font-size: 1.5rem;
        }

        .toast-content {
            flex: 1;
        }

        .toast-message {
            color: #1e293b;
            font-size: 0.95rem;
            font-weight: 500;
        }

        .toast-close {
            cursor: pointer;
            color: #94a3b8;
            font-size: 1.2rem;
            transition: color 0.2s ease;
        }

        .toast-close:hover {
            color: #1e293b;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Initialize Container safely
    let container;

    function initContainer() {
        if (document.getElementById('notification-container')) {
            container = document.getElementById('notification-container');
            return;
        }

        container = document.createElement('div');
        container.id = 'notification-container';
        if (document.body) {
            document.body.appendChild(container);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(container);
            });
        }
    }

    // Call init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContainer);
    } else {
        initContainer();
    }

    // Show Notification Function
    window.showNotification = function (message, type = 'info') {
        if (!container) initContainer();

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;


        const icons = {
            success: '✅',
            error: '❌',
            info: '🔔'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-close">&times;</div>
        `;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        const timeout = setTimeout(() => {
            removeToast(toast);
        }, 5000);

        // Close on click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeout);
            removeToast(toast);
        });
    };

    function removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 4000);
    }
})();
