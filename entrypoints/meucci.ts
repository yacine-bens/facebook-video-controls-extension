import ModuleMeucci from "@mellowtel/module-meucci";

export default defineUnlistedScript(() => {
    (async () => {
        const moduleMeucci = new ModuleMeucci();
        await moduleMeucci.init();
    })();
});