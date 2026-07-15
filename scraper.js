const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const TARGET_URL = 'https://simuladoroficial.tsje.gov.py/app.html?ubicacion=59.0.0';
const BASE_HOST = 'simuladoroficial.tsje.gov.py';
const OUT_DIR = path.join(__dirname, 'www');

// Create output directory
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Guardar la ruta original
const savePathFromUrl = (requestUrl) => {
  try {
    const urlObj = new URL(requestUrl);
    if (urlObj.hostname !== BASE_HOST) return null;
    
    let pathname = urlObj.pathname;
    if (pathname === '/') pathname = '/sufragio.html';
    
    return path.join(OUT_DIR, decodeURIComponent(pathname));
  } catch (e) {
    return null;
  }
};

// Crear el index.html envoltorio
const createIndexHtml = () => {
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Simulador Offline</title>
    <style>body,html,iframe{width:100%;height:100%;margin:0;padding:0;border:none;overflow:hidden;background:#000;}</style>
</head>
<body>
    <iframe src="app.html?ubicacion=59.0.0"></iframe>
</body>
</html>`;
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), htmlContent);
};


(async () => {
  console.log('===========================================================');
  console.log('Iniciando el clonador del Simulador TSJE...');
  console.log('Por favor, espera a que se abra el navegador.');
  console.log('IMPORTANTE: Deberás navegar por todas las opciones de Capital');
  console.log('para que el script pueda descargar todas las fotos de los candidatos.');
  console.log('===========================================================');

  createIndexHtml();

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  // Guardar respuestas
  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    
    // Ignorar redirecciones y errores
    if (status >= 300 && status <= 399) return;
    if (status >= 400) return;

    const filePath = savePathFromUrl(url);
    if (!filePath) return; // No es del dominio

    try {
      const buffer = await response.buffer();
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, buffer);
      console.log(`[Descargado] ${url.split('/').pop() || 'index.html'}`);
    } catch (err) {
      // Ignorar errores de buffers vacíos
    }
  });

  // Interceptar la URL principal para forzar a que sea el punto de entrada
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  console.log('\n✅ Página cargada. Ahora POR FAVOR haz click en todas las opciones.');
  console.log('👉 Simula un voto completo para que se descarguen las fotos de los candidatos.');
  console.log('🛑 Cuando termines, simplemente CIERRA la ventana del navegador.');

  // Esperar a que el usuario cierre el navegador
  browser.on('disconnected', () => {
    console.log('\nNavegador cerrado. Proceso de clonación finalizado.');
    console.log('Todos los archivos se guardaron en la carpeta "www" de este proyecto.');
    console.log('Ahora puedes compilar tu APK que funcionará 100% offline.');
    process.exit(0);
  });
})();
