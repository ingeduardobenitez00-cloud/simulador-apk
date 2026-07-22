const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const filePath = path.join(__dirname, 'www', 'datos', '59.0.0', 'Candidaturas.json');

try {
    console.log("Restaurando Candidaturas.json original desde el commit 6d0fb1a...");
    // 6d0fb1a es el commit de "Ajustes de centrado...", justo antes de los borrados.
    execSync('git checkout 6d0fb1a -- www/datos/59.0.0/Candidaturas.json');
} catch (error) {
    console.log("Error haciendo checkout. Asegurate de no tener cambios locales sin commitear.");
}

try {
  let data = fs.readFileSync(filePath, 'utf8');
  let candidaturas = JSON.parse(data);

  let nuevasCandidaturas = [];

  candidaturas.forEach(c => {
    // Para Intendentes (INT)
    if (c.cod_categoria === 'INT') {
        if (String(c.cod_lista) !== '1') { 
            c.imagenes = c.imagenes && c.imagenes.includes('default_mujer') ? ['default_mujer'] : ['default'];
            c.nombre = '';
            c.asistida = '';
        }
        nuevasCandidaturas.push(c);
    }
    // Para Concejales (JUN)
    else if (c.cod_categoria === 'JUN') {
        if (String(c.cod_lista) === '1') {
            // En la Lista 1, SOLO dejamos a El Arki (opcion 5) y ELIMINAMOS los demas 
            // Esto forzara al simulador a mostrarlo gigante ocupando todo el espacio.
            if (String(c.nro_orden) === '5') {
                nuevasCandidaturas.push(c);
            }
        } else {
            // Para otras listas, borramos nombres y fotos pero dejamos los cuadros
            c.imagenes = c.imagenes && c.imagenes.includes('default_mujer') ? ['default_mujer'] : ['default'];
            c.nombre = '';
            c.asistida = '';
            nuevasCandidaturas.push(c);
        }
    } else {
        nuevasCandidaturas.push(c);
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(nuevasCandidaturas, null, 2), 'utf8');
  console.log(`✅ ¡Proceso completado! Se ha recuperado la foto de El Arki y ahora aparecera GRANDE en la pantalla.`);
} catch (error) {
  console.error('Error al procesar el archivo JSON:', error);
}
