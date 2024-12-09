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
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  document.body.appendChild(canvas);

  const context = canvas.getContext('2d');

  const points = [
    new Point({ x: 200, y: 540 }),
    new Point({ x: 400, y: 300, control: true }),
    new Point({ x: 800, y: 540 }),
  ];

  const onmousedown = (e) => {
    window.addEventListener('mousemove', onmousemove);
    window.addEventListener('mouseup', onmouseup);
  };

  const onmousemove = (e) => {
    console.log(e.offsetX, e.offsetY);
  };

  const onmouseup = () => {
    window.removeEventListener('mousemove', onmousemove);
    window.removeEventListener('mouseup', onmouseup);
  };

  canvas.addEventListener('mousedown', onmousedown);

  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  context.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
  context.stroke();

  points.forEach(point => {
    point.draw(context);
  });
});
