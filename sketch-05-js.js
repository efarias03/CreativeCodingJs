const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random");
const Pane = require("tweakpane");

const settings = {
  dimensions: [ 1200, 1200 ],
  animate: true
};

const params = {
  glyphs: "01"
}

let manager;

let text = "A";
let fontSize = "1200";
let fontFamily = "serif";

const typeCanvas = document.createElement("canvas");
const typeContext = typeCanvas.getContext("2d");

const url = `./src/images/blue-colors.jpg`;
let image;
let cell;
let cols;
let rows;
let numCells;

const sketch = async ({ context, width, height, update }) => {
  image = await getImage(url);
  
  cell = 10;
  cols = Math.floor(width / cell );
  rows = Math.floor(height / cell);
  numCells = cols * rows;

  typeCanvas.width = cols;
  typeCanvas.height = rows;


  return ({ context, width, height, }) => {

    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, cols, rows);

    fontSize = cols;

    typeContext.fillStyle = "white";
    typeContext.font = `${fontSize}px ${fontFamily}`;


    // const metrics = typeContext.measureText(text);
    // const mx = metrics.actualBoundingBoxLeft * -1;
    // const my = metrics.actualBoundingBoxAscent * -1;
    // const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    // const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    // const tx = (cols - mw) * .5 - mx;
    // const ty = (rows - mh) * .5 - my;

    typeContext.save();
    typeContext.translate(0, 0);

    // typeContext.beginPath();
    // // typeContext.rect(mx, my, mw, mh);

    // typeContext.stroke();

    typeContext.drawImage(image, 0, 0, cols, rows);
    typeContext.restore();
  


    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    const typeData = typeContext.getImageData(0, 0, cols, rows).data;

    // context.drawImage(typeCanvas, 0, 0);
    
    context.textBaseline = "middle";
    context.textAlign = "center";
    

    

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols)
      
      const x = col * cell;
      const y = row * cell;

      const r = typeData[i * 4 + 0];
      const g = typeData[i * 4 + 1];
      const b = typeData[i * 4 + 2];
      const a = typeData[i * 4 + 3];

      const rGlyph = getGlyph(r);
      const gGlyph = getGlyph(g);
      const bGlyph = getGlyph(b);
      const aGlyph = getGlyph(a);

      context.font = `${cell * 2}px ${fontFamily}`;
      if (Math.random() < .1) context.font = `${cell * 6}px ${fontFamily}`;

      context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;

      context.save();
      context.translate(x, y);
      context.translate(cell * .5, cell * .5);
      // context.fillRect(0, 0, cell, cell);

      // context.beginPath();
      // context.arc(0, 0, cell * .5, 0, Math.PI * 2);
      // context.fill();
      
      context.fillText(rGlyph, 0, 0);
      context.fillText(gGlyph, 0, 0);
      context.fillText(bGlyph, 0, 0);
      context.fillText(aGlyph, 0, 0);

      context.restore();

    }
  };
};

const createPane = () => {
  const pane = new Pane.Pane();
  let folder;

  folder = pane.addFolder({title: "Image"});
  folder.addBinding(params, "glyphs");
  // folder.addBinding(params, "cell", {min: 1, max: 20, step: 1});
  // folder.addBinding(params, "amplitude", {min: 0, max: 1});
  // folder.addBinding(params, "animate");
  // folder.addBinding(params, "frame", {min: 0, max: 999 })

  pane.on('change', (ev) => {
    reRender();
    console.log('changed: ' + JSON.stringify(ev.value));
  });
};



const getImage = async (url) => {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
};


const getGlyph = (v) => {
  if (v < 50) return "";
  if (v < 100) return ".";
  if (v < 150) return "-";
  if (v < 200) return "/";
  
  const glyphs = `${params.glyphs}`.split();

  return random.pick(glyphs);
}

const reRender = () => {
  manager.render();
}

const start = async () => {
  manager =  await canvasSketch(sketch, settings);
}


createPane();
start();
