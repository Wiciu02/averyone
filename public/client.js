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
window.addEventListener('load', function () {

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
    isDrawing: false,
    touchstart: function (coors) {
        context.beginPath();
        context.moveTo(coors.x, coors.y);
        this.isDrawing = true;
    },
    touchmove: function (coors) {
        if (this.isDrawing) {
            context.lineTo(coors.x, coors.y);
            context.stroke();
        }
    },
    touchend: function (coors) {
        if (this.isDrawing) {
            this.touchmove(coors);
            this.isDrawing = false;
        }
    }
};
// create a function to pass touch events and coordinates to drawer
function draw(event) { 
    var type = null;
    // map mouse events to touch events
    switch(event.type){
        case "mousedown":
                event.touches = [];
                event.touches[0] = { 
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                type = "touchstart";                  
        break;
        case "mousemove":                
                event.touches = [];
                event.touches[0] = { 
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                type = "touchmove";                
        break;
        case "mouseup":                
                event.touches = [];
                event.touches[0] = { 
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                type = "touchend";
        break;
    }        

    // touchend clear the touches[0], so we need to use changedTouches[0]
    var coors;
    if(event.type === "touchend") {
        coors = {
            x: event.changedTouches[0].pageX,
            y: event.changedTouches[0].pageY
        };
    }
    else {
        // get the touch coordinates
        coors = {
            x: event.touches[0].pageX,
            y: event.touches[0].pageY
        };
    }
    type = type || event.type
    // pass the coordinates to the appropriate handler
    drawer[type](coors);
}

document.body.addEventListener('touchmove', function (event) {
    event.preventDefault();
}, false); // end body.onTouchMove

}, false); // end window.onLoad

var touchAvailable = ('createTouch' in document) || ('onstarttouch' in window);

if (touchAvailable) {
   canvas.addEventListener('touchstart', draw, false);
   canvas.addEventListener('touchmove', draw, false);
   canvas.addEventListener('touchend', draw, false);
}
document.body.addEventListener('touchmove', function (event) {
   event.preventDefault();
}, false);
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
