import { defineConfig, UserManifest } from 'wxt';

const perBrowserManifest: Record<string, Record<number, UserManifest>> = ({
    chrome: {
        3: {
            version: "1.1.1",
            permissions: [
                "contextMenus",
                "scripting",
                "activeTab",
                "storage",
            ],
            optional_host_permissions: [
                "*://*.facebook.com/*",
            ],
        }
    },
    firefox: {
        2: {
            version: "1.1.1",
            permissions: [
                "contextMenus",
                "scripting",
                "activeTab",
                "storage",
            ],
            optional_permissions: [
                // @ts-expect-error
                "*://*.facebook.com/*",
            ],
        }
    }
});

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    manifest: ({ browser, manifestVersion }) => ({
        name: "Facebook Video Controls",
        author: "https://github.com/yacine-bens",
        homepage_url: "https://github.com/yacine-bens/facebook-video-controls-extension",
        ...perBrowserManifest[browser][manifestVersion],
    })
});
