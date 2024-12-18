class Point {
  constructor({ x, y, control = false }) {
    this.x = x;
    this.y = y;
    this.control = control;
  }


  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = this.control ? 'red' : 'black';
    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  hitTest(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    const dd = Math.sqrt(dx * dx + dy * dy);

    return dd < 20;
  }
}

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let points;
let elCanvas;

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  canvas.style.display = 'block';
  canvas.style.margin = '50px auto';
  canvas.style.background = 'white';
  canvas.style.boxShadow = '0px 10px 30px rgba(0, 0, 0, 0.3)';
  canvas.style.borderRadius = '10px';
  canvas.style.border = '1px solid #ccc';
  document.body.style.background = '#f0f0f0';
  document.body.style.display = 'flex';
  document.body.style.flexDirection = 'column';
  document.body.style.alignItems = 'center';
  document.body.style.justifyContent = 'center';
  document.body.style.minHeight = '100vh';
  document.body.style.margin = '0';
  document.body.appendChild(canvas);

  const context = canvas.getContext('2d');
  points = [
    new Point({ x: 200, y: 540 }),
    new Point({ x: 400, y: 700 }),
    new Point({ x: 800, y: 540 }),
    new Point({ x: 600, y: 700 }),
    new Point({ x: 640, y: 900 }),
  ];

  // Dibujar contenido en el lienzo
  const drawCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar curva
    context.fillStyle = 'white';
    context.lineWidth = 2;
    context.strokeStyle = '#999';
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for(let i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }

    

   // for(let i = 1; i < points.length; i += 2) {
   //   context.quadraticCurveTo(points[i + 0].x, points[i + 0].y, points[i + 1].x, points[i + 1].y);
   // }

    // context.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
    // context.quadraticCurveTo(points[3].x, points[3].y, points[4].x, points[4].y);
    context.stroke();

    context.beginPath();
    for(let i = 0; i < points.length - 1; i++) {
      const curr = points[i + 0];
      const next = points[i + 1];

      const mx = curr.x + (next.x - curr.x) * 0.5;
      const my = curr.y + (next.y - curr.y) * 0.5;

      // context.beginPath();
      // context.arc(mx, my, 5, 0, Math.PI * 2);
      // context.fillStyle = 'blue';
      // context.fill();
      if(i == 0) context.moveTo(curr.x, curr.y);
      else if(i == points.length - 2) context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
      else context.quadraticCurveTo(curr.x, curr.y, mx, my);

      
    }
    context.lineWidth = 4;
    context.strokeStyle = 'blue';
    context.stroke();
    // Dibujar puntos
    points.forEach((point) => point.draw(context));
  };

  // Manejo de eventos para mover puntos
  let selectedPoint = null;

  const onmousedown = (e) => {
    const x = (e.offsetX / canvas.offsetWidth) * canvas.width;
    const y = (e.offsetY / canvas.offsetHeight) * canvas.height;

    selectedPoint = points.find((point) => point.hitTest(x, y));

    if (selectedPoint) {
      window.addEventListener('mousemove', onmousemove);
      window.addEventListener('mouseup', onmouseup);
    }
  };

  const onmousemove = (e) => {
    if (selectedPoint) {
      const x = (e.offsetX / canvas.offsetWidth) * canvas.width;
      const y = (e.offsetY / canvas.offsetHeight) * canvas.height;

      selectedPoint.x = x;
      selectedPoint.y = y;

      drawCanvas();
    }
  };

  const onmouseup = () => {
    selectedPoint = null;
    window.removeEventListener('mousemove', onmousemove);
    window.removeEventListener('mouseup', onmouseup);
  };

  canvas.addEventListener('mousedown', onmousedown);

  drawCanvas();
});
