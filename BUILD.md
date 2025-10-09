Guía para compilar manualmente la extensión "Facebook Video Controls"

Este documento explica cómo preparar el entorno, compilar, empaquetar y probar la extensión localmente en Linux (Ubuntu/Bash). Está escrito para el repositorio que usa `wxt` como herramienta de construcción (ver `package.json`).

Requisitos mínimos

- Node.js 18+ (se recomienda la última LTS)
- npm (v9+), pnpm o yarn
- Git (para clonar o actualizar repo)
- Navegador para pruebas: Chrome/Edge/Brave o Firefox

1) Clonar y preparar el repositorio

Si aún no lo tienes, clona el repositorio y entra en la carpeta:

```bash
git clone https://github.com/yacine-bens/facebook-video-controls-extension.git
cd facebook-video-controls-extension
```

2) Instalar Node.js (si es necesario)

- Recomendado: usar nvm para instalar la versión LTS:

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh | bash
# luego cerrar/abrir terminal o source ~/.bashrc
nvm install --lts
nvm use --lts
```

3) Instalar dependencias

El proyecto usa `wxt` y `@wxt-dev/module-react` (en `devDependencies`). Puedes instalar con npm, pnpm o yarn. Ejemplo con npm:

```bash
npm install
```

Notas:
- El `package.json` contiene scripts útiles: `dev`, `build`, `zip`, `dev:firefox`, `build:firefox`, `zip:firefox`.
- Hay un `postinstall` que corre `wxt prepare` para generar carpetas internas si es necesario.

4) Desarrollo en vivo (modo watch)

Para arrancar en modo desarrollador (carga de extensiones con servidor local de `wxt`):

```bash
npm run dev
# o para Firefox
npm run dev:firefox
```

`wxt` servirá los archivos y facilitará recarga en caliente según el módulo React usado.

5) Compilar para producción

Para producir los artefactos listos para empaquetar:

```bash
npm run build
# o para Firefox
npm run build:firefox
```

Salida esperada:
- `dist/` (carpeta generada por wxt) o similar, conteniendo `manifest.json`, `entrypoints`, `assets` y los bundles.

Comandos y verificación detallada

- Ejecuta `npm run build` y espera a que termine. Deberías ver en la salida de la terminal mensajes de `wxt` indicando archivos generados.
- Verifica la presencia del `manifest.json` en la carpeta de salida. Ejemplo rápido para comprobar desde la raíz del proyecto:

```bash
# lista los archivos principales en la carpeta de salida
ls -la dist || ls -la .wxt/package || echo "Revisa la salida de wxt en la terminal para localizar la carpeta generada"

# mostrar el manifest generado (si existe)
[ -f dist/manifest.json ] && cat dist/manifest.json || [ -f .wxt/package/manifest.json ] && cat .wxt/package/manifest.json
```

Si `ls` no encuentra `dist` ni `.wxt/package`, revisa la salida de `npm run build` para ver la ruta exacta que está usando `wxt`.

6) Empaquetar la extensión (ZIP)

`wxt` proporciona un script `zip` que empaqueta la salida en un .zip listo para distribuir:

```bash
npm run zip
# o para Firefox
npm run zip:firefox
```

El zip resultante suele ubicarse en `.wxt/package` o `dist/` según la configuración; revisa la salida por la ruta exacta.

Empaquetado manual (si prefieres no usar `wxt zip`)

1. Localiza la carpeta de salida (por ejemplo `dist/` o `.wxt/package/`).
2. Verifica que dentro exista `manifest.json` y las carpetas `entrypoints`, `assets` (u otras que aparezcan según la build).
3. Crea un zip desde la raíz del proyecto con la estructura correcta:

```bash
# desde la raíz del repo
cd dist
zip -r ../facebook-video-controls-extension.zip .
cd -

# ahora tienes ../facebook-video-controls-extension.zip
```

Estructura mínima esperada dentro del zip:

- manifest.json
- background.js (o carpeta `entrypoints` con background)
- content scripts / page scripts
- assets/ (imágenes, CSS)

Si el `manifest.json` está en `.wxt/package/manifest.json`, zippea esa carpeta en su lugar.

7) Cargar la extensión en Chrome/Edge/Brave

- Abre chrome://extensions/
- Activa "Modo desarrollador" (Developer mode)
- Haz clic en "Cargar descomprimida" (Load unpacked) y selecciona la carpeta `dist/` (o la carpeta indicada por `wxt` donde está el `manifest.json`).

8) Cargar la extensión en Firefox (temporal)

- Abre about:debugging#/runtime/this-firefox
- Haz clic en "Load Temporary Add-on..." y selecciona el `manifest.json` dentro de la carpeta de salida.

Instrucciones paso a paso y depuración

Chrome / Edge / Brave:

1. Abre `chrome://extensions/` (o `edge://extensions/`).
2. Activa "Developer mode" (arriba a la derecha).
3. Haz clic en "Load unpacked" y selecciona la carpeta de salida (`dist/` o `.wxt/package/`). Asegúrate de seleccionar la carpeta que contiene `manifest.json`.
4. Para ver logs del background script: en la tarjeta de la extensión, haz clic en "background page" o "Service Worker" -> "Inspect". Esto abre la DevTools para el contexto de background.
5. Para ver logs de content scripts: navega a la página objetivo (facebook.com) y abre DevTools de la página (F12). Busca mensajes relacionados con la extensión o filtra por el nombre del archivo.

Firefox:

1. Abre `about:debugging#/runtime/this-firefox`.
2. Haz clic en "Load Temporary Add-on..." y selecciona el `manifest.json` dentro de la carpeta de salida.
3. Para depurar, en la lista de extensiones cargadas busca la extensión y haz clic en "Inspect" para abrir las herramientas de depuración del background.

Consejos rápidos:
- Si no ves la extensión al cargarla, revisa que `manifest.json` sea válido (versión del manifest y campos obligatorios).
- Revisa permisos en el manifest si tus scripts no se inyectan en `facebook.com`.
- Si el background es un Service Worker, las herramientas de DevTools pueden mostrar estado activo/inactivo; recarga la extensión para despertar el worker.

9) Pruebas y ver logs

- Mensajes desde `background.ts` y `entrypoints` aparecen en la consola de extensiones (inspeccionar background) o en la consola de contenido para scripts inyectados.
- Si algo falla al build, ejecutar `npm run compile` (hace `tsc --noEmit`) mostrará errores de TypeScript.

10) Errores comunes y soluciones

- Versión de Node incompatible: usa `nvm` para fijar la versión.
- Dependencias nativas faltantes: verificar errores en `npm install` y reinstalar.
- `manifest.json` no se encuentra: revisar la carpeta de salida generada por `wxt`.

11) Solución de problemas avanzada y CI

- Ver errores de TypeScript:

```bash
# muestra errores sin generar artefactos
npm run compile
```

- Revisar la salida completa del build:

```bash
npm run build 2>&1 | tee build.log
# luego inspecciona build.log para buscar errores o rutas de salida
```

- Integración continua (ejemplo mínimo con GitHub Actions):

1. Crea un workflow `.github/workflows/build.yml` con pasos:
	 - configurar Node (setup-node)
	 - npm ci
	 - npm run build
	 - opcional: npm run zip y subir el ZIP como artifact

Ejemplo simplificado (resumen):

- name: CI
	on: [push]
	jobs:
		build:
			runs-on: ubuntu-latest
			steps:
				- uses: actions/checkout@v4
				- uses: actions/setup-node@v4
					with:
						node-version: 'lts/*'
				- run: npm ci
				- run: npm run build
				- run: npm run zip

- Si `wxt` falla en CI por permisos, añade `--silent` o exporta variables de entorno necesarias según el error.

12) Conclusión

He aquí un resumen de los comandos más usados:

```bash
npm install          # instalar dependencias
npm run dev          # desarrollo con recarga
npm run build        # build de producción
npm run zip          # empaquetar en zip
npm run compile      # chequear TypeScript
```

Si quieres, puedo añadir un `workflow` de GitHub Actions completo, o un `Dockerfile` para builds reproducibles. Dime cuál prefieres.

11) Opcional: publicar en Chrome Web Store / AMO

- Sigue las guías oficiales de cada store. El artefacto empaquetado (ZIP) debe contener el `manifest.json` y todos los archivos estáticos.

Notas finales

Este repositorio usa `wxt` (https://wxt.dev). Si necesitas una configuración más avanzada (scripts adicionales, SSO build, CI), puedo añadir ejemplos de `github-actions` o `Dockerfile`.
