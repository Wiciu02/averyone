const socket = io();

let mousePressed = false;
let lastPos = null;
let drawColor = "black";
let lineWidth = 6;



const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


var img = new Image();
  img.src = 'http://example.com/example.jpg';
 
  //Wait for image to finish loading
  img.onload = function() {
    //Draw the image on the canvas
    ctx.drawImage(img, x, y);
  }

  var imageLoader = document.getElementById('imageLoader');
  imageLoader.addEventListener('change', loadImage, false);
 
  function loadImage(e) {
    var reader = new FileReader();
    reader.onload = function(event){
        img = new Image();
        img.onload = function(){
          ctx.drawImage(img,200,200);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);  
    return false;    
  }


  
const download = document.getElementById('download');


download.addEventListener('click', function(e) {
  console.log(canvas.toDataURL());
  var link = document.createElement('a');
  link.download = 'e-lekcja.png';
  link.href = canvas.toDataURL();
  link.click();
  link.delete;
});



createPalette();

function createPalette() {
    const COLORS = [
        "black",
        "gray",
        "silver",
        "white",
        "lightblue",
        "cyan",
        "blue",
        "darkblue",
        "purple",
        "magenta",
        "red",
        "orange",
        "yellow",
        "lime",
        "green",
        "olive",
        "brown",
        "maroon",
    ];
    const palette = document.getElementById("palette");
    COLORS.forEach((colorName) => {
        const colorElement = document.createElement("div");
        colorElement.classList.add("colorSquare");
        colorElement.style.backgroundColor = colorName;
        palette.appendChild(colorElement);
    });
}

function draw(e) {
    const [x, y] = mousePos(e);
    if (lastPos) {
        socket.emit("drawing", drawColor, lineWidth, lastPos, [x, y]);
        lastPos = [x, y];
    } else {
        lastPos = [x, y];
        socket.emit("drawing", drawColor, lineWidth, lastPos, [x, y]);
    }
}

socket.on("drawing", (color, width, startPos, endPos) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.moveTo(...startPos);
    ctx.lineTo(...endPos);
    ctx.closePath();
    ctx.stroke();
    
});



function mousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        (e.clientX - rect.left) * (canvas.width / rect.width),
        (e.clientY - rect.top) * (canvas.height / rect.height),
    ];
}

function init() {
    // Get the specific canvas element from the HTML document
    canvas = document.getElementById('sketchpad');

    // If the browser supports the canvas tag, get the 2d drawing context for this canvas
    if (canvas.getContext)
        ctx = canvas.getContext('2d');

    // Check that we have a valid context to draw on/with before adding event handlers
    if (ctx) {
        canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
        canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
        window.addEventListener('mouseup', sketchpad_mouseUp, false);
    }
}

canvas.addEventListener("mousedown", (e) => {
    mousePressed = true;
    draw(e);
});

canvas.addEventListener("mousemove",  (e) => {
    if (mousePressed) {
        draw(e);
    }
});

canvas.addEventListener("mouseleave", () => {
    lastPos = null;
});

document.addEventListener("mouseup", (e) => {
    mousePressed = false;
    lastPos = null;
});

document.getElementById("clearBtn").addEventListener("click", () => {
    socket.emit("clearCanvas");
});

socket.on("clearCanvas", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.querySelectorAll(".colorSquare").forEach((square) => {
    square.addEventListener("click", () => {
        drawColor = square.style.backgroundColor;
        document.querySelectorAll(".widthExample").forEach((ex) => {
            ex.style.backgroundColor = drawColor;
        });
    });
});

document.querySelectorAll(".widthExample").forEach((ex) => {
    ex.addEventListener("click", () => {
        lineWidth = ex.clientWidth;
        document.querySelectorAll(".widthExample").forEach((other) => {
            other.style.opacity = 0.4;
        });
        ex.style.opacity = 1;
    });
});

const startDraw = (ev, strokeColor = paintColor, strokeWidth = strokeSize, blendMode = "normal") => {
    console.log("Start Draw!!", ev.center.x, ev.center.y);
    var path = new paper.Path({
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        strokeCap: "round",
        blendMode: blendMode
    });
}

// handle middleDraw
const middleDraw = (ev) => {
    console.log("Middle Draw!!", ev.center.x, ev.center.y);
    paper.project._activeLayer.lastChild.add({x: ev.center.x, y: ev.center.y})
}

// handle endDraw
const endDraw = (ev) => {
    console.log("End Draw!!", ev.center.x, ev.center.y);
    paper.project._activeLayer.lastChild.simplify(20)
}

socket.on("socketNumber", (number) => {
    document.getElementById("counter").innerText = number;
});
