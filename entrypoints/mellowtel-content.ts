import Mellowtel from "mellowtel";
import { CONFIGURATION_KEY, MAX_DAILY_RATE, DISABLE_LOGS } from "@/constants";

export default defineContentScript({
    matches: ["<all_urls>"],
    runAt: "document_start",
    allFrames: true,
    main: async () => {
        const mellowtel = new Mellowtel(CONFIGURATION_KEY, {
            MAX_DAILY_RATE,
            disableLogs: DISABLE_LOGS,
        });

        await mellowtel.initContentScript({
            pascoliFilePath: 'pascoli.html',
            meucciFilePath: 'meucci.js',
        });
    }
});