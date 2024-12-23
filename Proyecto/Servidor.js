const express = require('express');
const path = require('path');

const app = express();
const port = 3004;

// Servir archivos estáticos desde el directorio raíz
app.use('/Sonido', express.static(path.join(__dirname, 'Sonido')));
app.use('/', express.static(__dirname));

// Ruta principal para servir el HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
