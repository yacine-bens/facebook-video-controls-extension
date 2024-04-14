import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifest: {
        name: "Facebook Video Controls",
        author: "https://github.com/yacine-bens",
        homepage_url: "https://github.com/yacine-bens/facebook-video-controls-extension",
        permissions: [
            "contextMenus",
            "scripting",
            "activeTab",
        ],
    }
});
