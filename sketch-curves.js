const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const colormap = require('colormap');

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

const sketch = ({ context, width, height, frame }) => {
  const cols = 20;
  const rows = 60;
  const numCells = cols * rows;
  let f = frame;

  // grid
  const gw = width * 1.2;
  const gh = height * 1.2;
  // cell
  const cw = gw / cols;
  const ch = gh / rows;
  // margin
  const mx = (width - gw) * .5;
  const my = (height - gh) * .5;

  const points = [];

  let x, y, n, lineWidth, color;
  let frequency = .002;
  let amplitude = 90;

  const colors = colormap({
    colormap: "inferno",
    nshades: amplitude,
  });

  // criar o grid (adicionar ao notion dps)
  for (let i = 0; i < numCells; i++) {
    x = i % cols * cw;
    y = Math.floor(i / cols) * ch;


    n = random.noise2D(x, y, frequency, amplitude);
    // x += n;
    // y += n;

    lineWidth = math.mapRange(n, -amplitude, amplitude, 2, 30);

    color = colors[Math.floor(math.mapRange(n, -amplitude, amplitude, 0, amplitude))]

    points.push(new Point({ x, y, lineWidth, color}));
  };



  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.beginPath();
    context.arc(width * .5, height * .5, width *.45, 0, Math.PI * 2);
    context.strokeStyle = "black";
    context.fillStyle = "black";
    context.lineWidth = 20;
    context.fill();
    context.stroke();
    context.clip();

    context.save();
    context.translate(mx, my);
    context.translate(cw * .5, ch * .5);
    context.strokeStyle = "red";
    context.lineWidth = 4;

    points.forEach(point => {
      n = random.noise2D(point.ix + frame * 3, point.iy + frame, frequency, amplitude);
      point.x = point.ix + n;
      point.y = point.iy + n;
    })

    let lastx, lasty;

    // draw lines
    for (let r = 0; r < rows; r++) {
      
      for (let c = 0; c < cols - 1; c++) {
        const curr = points[r * cols + c + 0];
        const next = points[r * cols + c + 1];
        
        const mx = curr.x + (next.x - curr.x) * .5;
        const my = curr.y + (next.y - curr.y) * .5;

        if (!c) {
          lastx = curr.x;
          lasty = curr.y;
        }

        
        context.beginPath();
        context.lineWidth = curr.lineWidth;
        context.strokeStyle = curr.color;

        // if (c == 0) context.moveTo(curr.x, curr.y);
        // else if (c == cols - 2) context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
        // else context.quadraticCurveTo(curr.x, curr.y, mx, my);
        context.moveTo(lastx, lasty);
        context.quadraticCurveTo(curr.x, curr.y, mx, my);
        
        context.stroke();

        lastx = mx;
        lasty = my;
      }
    }

    points.forEach(point => {
      // point.draw(context);
    })

    context.restore();

    context.beginPath();
    context.arc(width * .5, height * .5, width *.45, 0, Math.PI * 2);
    context.strokeStyle = "black";
    context.lineWidth = 40;
    context.stroke();

  };
};

canvasSketch(sketch, settings);



class Point {
  constructor({ x, y, lineWidth, color }) {
    this.x = x;
    this.y = y;
    this.lineWidth = lineWidth;
    this.color = color;

    this.ix = x;
    this.iy = y;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = "red";

    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}