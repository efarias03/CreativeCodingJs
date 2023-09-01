const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const eases = require('eases');
const colormap = require('colormap');

const settings = {
  dimensions: [ 1080, 1080 ],
  animation: true
};

const particles = [];

let elCanvas;
let imgA;

const cursor = {
  x: 9999, y: 9999
};

const colors = colormap({
  colormap: "cool",
  nshades: 20
})

const sketch = ({ width, height, canvas }) => {
  let x, y, particle, radius;
  
  const imgACanvas = document.createElement("canvas");
  const imgAContext = imgACanvas.getContext("2d");

  imgACanvas.width = imgA.width;
  imgACanvas.height = imgA.height;

  imgAContext.drawImage(imgA, 0, 0);

  const imgAData = imgAContext.getImageData(0, 0, imgA.width, imgA.height).data;

  const numCircles = 22;
  const gapCircle = 1;
  const gapDot = 1;
  let dotRadius = 12;
  let cirRadius = 0;
  const fitRadius = dotRadius;

  elCanvas = canvas;
  canvas.addEventListener("mousedown", onMouseDown);

  for (let i = 0; i < numCircles; i++) {
    const circumference = Math.PI * 2 * cirRadius;
    const numFit = i ? Math.floor(circumference / (fitRadius * 2 + gapDot)) : 1;
    const fitSlice = Math.PI * 2 / numFit;
    let ix, iy, idx, r, g, b, colA;

    for (let j = 0; j < numFit; j++) {
      const theta = fitSlice * j;

      x = Math.cos(theta) * cirRadius;
      y = Math.sin(theta) * cirRadius;

      x += width * .5;
      y += height * .5;

      ix = Math.floor((x / width) * imgA.width);
      iy = Math.floor((y / height) * imgA.height);
      idx = (iy * imgA.width + ix) * 4;

      r = imgAData[idx + 0];
      g = imgAData[idx + 1];
      b = imgAData[idx + 2];
      colA = `rgba(${r}, ${g}, ${b})`

      radius = math.mapRange(r, 0, 255, 2, 15);

      particle = new Particle({ x, y, radius, colA });
      particles.push(particle);
    }

    cirRadius += fitRadius * 2 + gapCircle;
    dotRadius = (1 - eases.quadOut(i / numCircles)) * fitRadius; 
  }


  // for (let i = 0; i < 200; i++) {
  //   x = width * .5;
  //   y = height * .5;

  //   random.insideCircle(400, pos);
  //   x += pos[0];
  //   y += pos[1];

  //   particle = new Particle({x, y});

  //   particles.push(particle);
  // }
  
  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    particles.sort((a, b) => a.scale - b.scale);
    
    particles.forEach(particle => {
      particle.update();
      particle.draw(context);
    })
  };
};

const onMouseDown = (e) => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  onMouseMove(e);
};

const onMouseMove = (e) => {
  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  cursor.x = x;
  cursor.y = y;
};

const onMouseUp = () => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);

  cursor.x = 9999;
  cursor.y = 9999;
};


const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  })
};

const start = async () => {
  imgA = await loadImage("src/images/eye.jpg");

  canvasSketch(sketch, settings);
};

start();



class Particle {
  constructor ({x, y, radius = 10, colA}) {
    // position
    this.x = x;
    this.y = y;

    // acceleration
    this.ax = 0;
    this.ay = 0;

    // velocity
    this.vx = 0;
    this.vy = 0;

    //initial position
    this.ix = x;
    this.iy = y;


    this.radius = radius;
    this.scale = 1;
    this.color = colA;

    // this.minDist = 100;
    // this.pushFactor = .02;
    // this.pullFactor = .004;
    // this.dampFactor = .95;
    
    this.minDist = random.range(100, 200);
    this.pushFactor = random.range(.01, .02);
    this.pullFactor = random.range(.002, .006);
    this.dampFactor = random.range(.90, .95);

  }

  update() {
    let dx, dy, dd, distDelta;
    let idxColor;

    // pull force
    dx  = this.ix - this.x;
    dy  = this.iy - this.y;
    dd = Math.sqrt(dx * dx + dy * dy);

    this.ax = dx * this.pullFactor;
    this.ay = dy * this.pullFactor;

    this.scale = math.mapRange(dd, 0, 200, 1, 5);

    // idxColor = Math.floor(math.mapRange(dd, 0, 200, 0, colors.length - 1, true))
    // this.color = colors[idxColor];

    // push force
    dx = this.x - cursor.x;
    dy = this.y - cursor.y;
    dd = Math.sqrt(dx * dx + dy * dy);

    distDelta = this.minDist - dd;

    if (dd < this.minDist) {
      this.ax += (dx / dd) * distDelta * this.pushFactor;
      this.ay += (dy / dd) * distDelta * this.pushFactor;
    }

    this.vx += this.ax;
    this.vy += this.ay;
    
    this.vx *= this.dampFactor;
    this.vy *= this.dampFactor;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);

    context.beginPath();
    context.fillStyle = this.color;
    context.arc(0, 0, this.radius * this.scale, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
};

