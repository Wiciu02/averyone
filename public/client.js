const socket = io();

let mousePressed = false;
let lastPos = null;
let drawColor = "black";
let lineWidth = 5;
let img = [];

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

socket.on("img", function(img){
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
});

  
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

function preventDefault(e) {
    e.preventDefault();
}
function disableScroll() {
    document.body.addEventListener('touchmove', preventDefault, { passive: false });
}
function enableScroll() {
    document.body.removeEventListener('touchmove', preventDefault);
}

var drawer = {
   isDrawing: true,
   touchstart: function (coors) {
      ctx.beginPath();
      ctx.moveTo(coors.x, coors.y);
      this.isDrawing = true;
      disableScroll(); // add for new iOS support
   },
   touchmove: function (coors) {
      if (this.isDrawing) {
         ctx.lineTo(coors.x, coors.y);
         ctx.stroke();
      }
   },
   touchend: function (coors) {
      if (this.isDrawing) {
         this.touchmove(coors);
         this.isDrawing = true;
      }
      enableScroll(); // add for new iOS support
   }
};

var touchAvailable = ('createTouch' in document) || ('onstarttouch' in window);

if (touchAvailable) {
   canvas.addEventListener('touchstart', draw, false);
   canvas.addEventListener('touchmove', draw, false);
   canvas.addEventListener('touchend', draw, false);
}
document.body.addEventListener('touchmove', function (event) {
   event.preventDefault();
}, false);

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

document.body.addEventListener('touchmove', function (event) {
    event.preventDefault();
 }, false);

document.querySelectorAll(".widthExample").forEach((ex) => {
    ex.addEventListener("click", () => {
        lineWidth = ex.clientWidth;
        document.querySelectorAll(".widthExample").forEach((other) => {
            other.style.opacity = 0.4;
        });
        ex.style.opacity = 1;
    });
});

socket.on("socketNumber", (number) => {
    document.getElementById("counter").innerText = number;
});
