const express = require('express');
const path = require('path');

const app = express();
const port = 3003; // Cambiado a 3001

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'sonido.html'));
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});