const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const Pane = require("tweakpane");
const colormap = require('colormap');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const params = {
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 30,
  frequency: -.001,
  amplitude: .02,
  animate: true,
  frame: 0,
  lineCap: "butt",
};

const sketch = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const cols = params.cols;
    const rows = params.rows;
    const numCells = cols * rows;

    const gridw = width * .8;
    const gridh = height * .8;
    const cellw = gridw / cols;
    const cellh = gridh / rows;

    const margx = (width - gridw) * .5 ;
    const margy = (height - gridh) * .5;


    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const x = col * cellw;
      const y = row * cellh;
      const w = cellw * .8;
      const h = cellh * .8;

      const f = params.animate ? frame : params.frame;

      const n = random.noise3D(x , y, f * 10, params.frequency);
      const angle = n * Math.PI * params.amplitude;
      // const scale = (n + 1) / 2 * 30;
      // const scale = (n * .5 + .5) * 30;
      const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax);

      context.save();
      context.lineWidth = scale;
      context.strokeStyle = "black";
      context.lineCap = params.lineCap;
      context.translate(x, y);
      context.translate(margx, margy);
      context.translate(cellw *.5, cellh*.5);
      context.rotate(angle);


      context.beginPath();
      context.moveTo(w * -.5, 0);
      context.lineTo(w * .5, 0);
      context.stroke();

      context.restore();
    }
  };
};

const createPane = () => {
  const pane = new Pane.Pane();
  let folder;

  folder = pane.addFolder({title: "Grid"});
  folder.addBinding(params, "lineCap", {options: {butt: "butt", round: "round", square: "square"}})
  folder.addBinding(params, "cols", {min: 2, max: 50, step: 1});
  folder.addBinding(params, "rows", {min: 2, max: 50, step: 1})
  folder.addBinding(params, "scaleMin", {min: 1, max: 100 });
  folder.addBinding(params, "scaleMax", {min: 1, max: 100 });
  
  folder = pane.addFolder({title: "Noise"});
  folder.addBinding(params, "frequency", {min: -.01, max: .01});
  folder.addBinding(params, "amplitude", {min: 0, max: 1});
  folder.addBinding(params, "animate");
  folder.addBinding(params, "frame", {min: 0, max: 999 })

};


createPane();
canvasSketch(sketch, settings);
