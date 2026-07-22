const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'www', 'datos', '59.0.0', 'Candidaturas.json');

try {
  let data = fs.readFileSync(filePath, 'utf8');
  let candidaturas = JSON.parse(data);

  let modificados = 0;

  candidaturas.forEach(c => {
    // Para Intendentes (INT): borrar todos excepto lista 1 (Camilo Perez)
    if (c.cod_categoria === 'INT') {
      if (c.cod_lista !== '1') {
        if (c.imagenes.includes('default_mujer')) {
            c.imagenes = ['default_mujer'];
        } else {
            c.imagenes = ['default'];
        }
        c.nombre = '';
        c.asistida = '';
        modificados++;
      }
    }
    // Para Concejales (JUN): borrar todos excepto lista 1, opcion 5 (EL ARKI)
    else if (c.cod_categoria === 'JUN') {
      // Condición: NO es (lista 1 Y opcion 5)
      if (!(c.cod_lista === '1' && c.nro_orden === 5)) {
        if (c.imagenes.includes('default_mujer')) {
            c.imagenes = ['default_mujer'];
        } else {
            c.imagenes = ['default'];
        }
        c.nombre = '';
        c.asistida = '';
        modificados++;
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(candidaturas, null, 2), 'utf8');
  console.log(`✅ ¡Proceso completado exitosamente! Se modificaron ${modificados} candidatos (se borraron fotos y nombres).`);
  console.log(`📸 Ahora debes hacer un commit y push para que se genere el nuevo APK.`);
} catch (error) {
  console.error('Error al procesar el archivo JSON:', error);
}
