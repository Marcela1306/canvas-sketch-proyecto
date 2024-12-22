const express = require('express');
const path = require('path');

const app = express();
const port = 3003;

// Configura la carpeta "public" como estática
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para servir el HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sonido.html'));
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
