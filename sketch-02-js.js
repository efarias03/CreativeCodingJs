const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ]
};


const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.fillStyle = "black";
    context.strokeStyle = "black";

    const cx = width * .5;
    const cy = height * .5;

    const w = width * .01;
    const h = height * .1;
    let x, y;

    const num = 40;
    const radius = width * .3;

    for (let i = 0; i < num; i++) {
      const slice = math.degToRad((360 / num));
      const angle = (slice * i);

      x = radius * Math.sin(angle);
      y = radius * Math.cos(angle);
      
      // Pointers
      context.save();
      context.translate(x, y);
      context.translate(cx, cy);
      context.rotate(-angle)
      context.scale(random.range(.2, 2), random.range(.2, .5));
  
      context.beginPath();
      context.rect(-w * .5, random.range(0, -h *.5), w, h);
      context.fill();
      context.restore();


      // Arcs
      context.save();
      context.translate(cx, cy);
      context.rotate(-angle);
      

      context.lineWidth = random.range(5, 20);

      context.beginPath();
      context.arc(0, 0, radius * random.range(.7, 1.4), slice * random.range(1, -4), slice * random.range(1, 4));
      context.stroke();
      context.restore();
    }
  };
};

canvasSketch(sketch, settings);
