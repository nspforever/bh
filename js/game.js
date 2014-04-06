var canvas = document.getElementById("game");
var ctx = canvas.getContext && canvas.getContext('2d');

if(!ctx) {
    //No 2d context available
    alert("Your browser is too old, please upgrade it.");
}
else {
    startGame();
}

// new function for signleton


function startGame() {
    var spriteMap = {
        ship : {
            sx: 0, 
            sy: 0, 
            w: 37, 
            h: 42, 
            frames: 3}
    };
    
    var callback = function() {
        SpriteSheet.draw(ctx, "ship", 0, 0);
        SpriteSheet.draw(ctx, "ship", 100, 50);
        SpriteSheet.draw(ctx, "ship", 150, 100, 1);
    };
    
    SpriteSheet.load(spriteMap, callback);
    
}



