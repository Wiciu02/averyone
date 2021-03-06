
const socket = io();

let mousePressed = false;
let lastPos = null;
let drawColor = "black";
let lineWidth = 5;
let img = [];


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = 'white';
ctx.fillRect(0,0,canvas.width, canvas.height);

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

const change = document.getElementById('eraser');

change.addEventListener('click', function(e) {

    drawColor = "white";
    lineWidth = 50;
    canvas.style.cursor = "url('./eraser-fill.png'), auto";
    ctx.clearRect(0, 0, canvas.x, canvas.y);
});

const alertt = document.getElementById('alert');

alertt.addEventListener('click', function(e) {

    alert("Miłego dnia, życzy invisionapp.pl")
});

const pencil = document.getElementById('pencil');

pencil.addEventListener('click', function(e) {

    drawColor = "black";
    lineWidth = 5;
    canvas.style.cursor = "url('./jakiss.png'), auto";
});

// Get the container element
var btnContainer = document.getElementById("myDIV");

// Get all buttons with class="btn" inside the container
var btns = btnContainer.getElementsByClassName("btn");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}

const marker = document.getElementById('prostokat');

marker.addEventListener('click', function(e) {

    drawColor = "aquamarine";
    lineWidth = 5;
    canvas.style.cursor = "url('./pen-nib-fill.png'), auto";
});


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
    isDrawing: false,
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
          this.isDrawing = false;
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

document.getElementById("clearBtn").addEventListener("click", () => {
    let password = prompt("Czy na pewno chcesz wymazać całą kanwę? Podaj hasło admina: ")
    if(password == "admin2021")
    {
    socket.emit("clearCanvas");
    alert("Wymazałeś całą kanwę!");
    } else {
        alert("Nie masz stosownych uprawnień, aby wymazać kanwę!");
    }
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
