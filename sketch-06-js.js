const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color');
const risoColors = require("riso-colors");

const seed = random.getRandomSeed();

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  name: seed
};


const sketch = ({ context, width, height }) => {
  random.setSeed(seed);

  let x, y, w, h, fill, stroke, blend;
  
  const num = 25;

  const rects = [];
  const rectColors = [
    random.pick(risoColors),
    random.pick(risoColors)
  ];
  
  const bgColor = random.pick(risoColors).hex;

  const mask = {
    radius: width * .4,
    sides: 3,
    x: width * .5,
    y: height * .58
  }

  for(i = 0; i < num; i++) {
    x = random.range(0, width);
    y = random.range(0, height);
    w = random.range(600, width);
    h = random.range(100, 250);

    fill = random.pick(rectColors).hex;
    stroke = random.pick(rectColors).hex;

    blend = (random.value() > .5 ? "overlay" : "source-over");

    rects.push({x, y, w, h, fill, stroke, blend})
  }


  return ({ context, width, height }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);


    context.save();
    context.translate(mask.x, mask.y);
    
    drawPolygon({ context, radius: mask.radius, sides: mask.sides });
  
    context.clip();
    
    rects.forEach(rect => {
      const {x, y, w, h, fill, stroke, blend} = rect;
      let shadowColor;
      
      context.save();
      context.translate(-mask.x, -mask.y);
      context.lineWidth = 10;
      context.fillStyle = fill;
      context.strokeStyle = stroke;
      context.translate(x, y);
      
      context.globalCompositeOperation = blend;
      
      
      drawSkewedRect({ context, w, h });
      
      shadowColor = Color.offsetHSL(fill, 0, 0, -20);
      shadowColor.rgba[3] = 0.5;
      
      context.shadowColor = Color.style(shadowColor.rgba);
      context.shadowOffsetX = 10;
      context.shadowOffsetY = 10;
      
      context.fill();
      
      context.shadowColor = null;
      context.stroke();
      
      context.globalCompositeOperation = "source-over";
      
      context.lineWidth = 2;
      context.strokeStyle = "black";
      context.stroke();
      
      context.restore();
    });

    
    context.restore();
    
    context.save();
    context.translate(mask.x, mask.y);
    context.lineWidth = 20;
    
    drawPolygon({ context, radius: mask.radius - context.lineWidth, sides: mask.sides });
    context.globalCompositeOperation = "color-burn";
    context.strokeStyle = rectColors[0].hex;
    

    context.stroke();
    context.restore();
  };
};

const drawPolygon = ({ context, radius = 100, sides = 3 }) => {
  const slice = Math.PI * 2 / sides;

  context.beginPath();
  context.moveTo(0, -radius);

  for (let i = 1; i < sides; i++) {
    const theta = i * slice - Math.PI * .5;
    context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
  }

  context.closePath();
};

const drawSkewedRect = ({ context, w = 600, h = 200, degrees = -30}) => {
  
  const angle = math.degToRad(degrees);
  const rx = Math.cos(angle) * w;
  const ry = Math.sin(angle) * w;
  
  
  context.save();
  context.translate(rx * -.5, (ry + h) * -.5);
  
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(rx, ry);
  context.lineTo(rx, ry + h);
  context.lineTo(0, h);
  context.closePath();
  
  
  context.restore();
}

canvasSketch(sketch, settings);
