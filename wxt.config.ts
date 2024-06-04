import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

// See https://wxt.dev/api/config.html
export default defineConfig({
    vite: () => ({
        plugins: [react()],
    }),
    manifest: {
        name: "Facebook Video Controls",
        author: "https://github.com/yacine-bens",
        homepage_url: "https://github.com/yacine-bens/facebook-video-controls-extension",
        permissions: [
            "contextMenus",
            "scripting",
            "activeTab",
            "storage",
        ],
        optional_permissions: [
            "tabs",
            "declarativeNetRequestWithHostAccess",
        ],
        // @ts-expect-error
        optional_host_permissions: [
            "*://*.facebook.com/*",
            "https://*/*",
        ]
    }
});
