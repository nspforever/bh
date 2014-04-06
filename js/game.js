var canvas = document.getElementById("game");

var ctx = canvas.getContext && canvas.getContext('2d');
if(!ctx) {
    //No 2d context available
    alert("Your browser is too old, please upgrade it.");
}
else {
    startGame();
}

function startGame() {
    ctx.fillStyle = "#FFFF00";
    ctx.fillRect(50, 100, 380, 400);
    //semi-transparent blue rectangle
    ctx.fillStyle = "rgba(0, 0, 128, 0.5)";
    ctx.fillRect(0, 50, 380, 400);
    
    var img = new Image();
    // Do not change the order of this callback
    // and the set img.src or in some browser if
    // the image is cached the callback won't be 
    // triggered
    img.onload = function() {
        ctx.drawImage(img, 1, 0, 36, 42, 110, 110, 36, 42);
    }
    img.src = "images/sprites.png";
    
}