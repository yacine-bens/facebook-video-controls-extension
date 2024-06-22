import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

const perBrowserManifest: Record<string, any> = {
    chrome: {
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
        optional_host_permissions: [
            "*://*.facebook.com/*",
            "https://*/*",
        ],
    },
    firefox: {
        permissions: [
            "contextMenus",
            "scripting",
            "activeTab",
            "storage",
        ],
    }
};

// See https://wxt.dev/api/config.html
export default defineConfig({
    vite: () => ({
        plugins: [react()],
    }),
    manifest: ({ browser }) => ({
        name: "Facebook Video Controls",
        author: "https://github.com/yacine-bens",
        homepage_url: "https://github.com/yacine-bens/facebook-video-controls-extension",
        ...perBrowserManifest[browser],
    })
});
