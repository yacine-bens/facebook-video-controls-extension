import { defineConfig, UserManifest } from 'wxt';

const perBrowserManifest: Record<string, Record<number, UserManifest>> = ({
    chrome: {
        3: {
            permissions: [
                "contextMenus",
                "scripting",
                "activeTab",
                "storage",
                "declarativeNetRequestWithHostAccess",
            ],
            optional_host_permissions: [
                "*://*.facebook.com/*",
                "https://*/*",
            ],
        }
    },
    firefox: {
        2: {
            permissions: [
                "contextMenus",
                "scripting",
                "activeTab",
                "storage",
                "declarativeNetRequestWithHostAccess",
            ],
            optional_permissions: [
                // @ts-expect-error
                "*://*.facebook.com/*",
                // @ts-expect-error
                "https://*/*",
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
        web_accessible_resources: [
            {
                resources: [
                    "pascoli.html",
                    "meucci.js",
                ],
                matches: [
                    "<all_urls>",
                ]
            }
        ]
    })
});
