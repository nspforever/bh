var level1 = [
    // Start, End, Gap, Type, Override
    [ 0, 4000, 800, "step" ],
    [ 6000, 11000, 300, "ltr" ],
    [ 12000, 16000, 400, "circle" ],
    [ 18200, 20000, 500, "straight", { x: 150 } ],
    [ 18200, 20000, 500, "straight", { x: 100 } ],
    [ 18400, 20000, 500, "straight", { x: 200 } ],
    [ 21000, 25000, 400, "wiggle", { x: 200 }],
    [ 21000, 25000, 400, "wiggle", { x: 150 }]
];

var spriteMap = {
    ship : {sx: 0, sy: 0, w: 37, h: 42, frames: 1},
    
    missile : {sx: 0, sy: 30, w: 2, h: 10, frames : 1},
    
    enemy_purple: {sx: 37, sy: 0, w: 42, h: 43, frame: 1},
    
    enemy_bee: {sx: 79, sy: 0, w: 37, h: 43, frames: 1},
    
    enemy_ship: {sx: 116, sy: 0, w: 42, h: 43, frames: 1},
    
    enemy_circle: {sx: 158, sy: 0, w: 32, h: 33, frames: 1},
    
    explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12},
    
    enemy_missile: { sx: 9, sy: 42, w: 3, h: 20, frame: 1 },
};

var enemies = {
    step: { x: 0, y: 0, spriteName: 'enemy_circle', health: 10, A:150, B: 30, C: 1.5, E: 30},
    ltr: { x: 0, y: -100, spriteName: 'enemy_purple', health: 10, A: 100, B: 200, C: 1, E: 200, missiles: 2 },
    circle: { x: 100, y: 100, spriteName: 'enemy_circle', health: 10, A: 100, B: -200, C: 1, E: 20, F: 20, G: 1, H: Math.PI/2 },
    straight: { x: 0, y: -50, spriteName: 'enemy_ship', health: 10, E: 100, firePercentage: 0.001 },
    wiggle: { x: 100, y: -50, spriteName: 'enemy_bee', health: 20, A: -200, B: 100, C: 4, E: 100, firePercentage: 0.001, missles: 2 }
    
}; 

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16;

var startGame = function() {
    //SpriteSheet.draw(Game.ctx, "ship", 100, 100, 1);
    Game.setBoard(0, new Starfield(20, 0.4, 100, true));
    Game.setBoard(1, new Starfield(50, 0.6, 100));
    Game.setBoard(2, new Starfield(100, 1.0, 50));
    Game.setBoard(3, new TitleScreen("Loading...", "Please wait")); 
    Game.setBoard(4, new Score(0));
    /*if(Game.mobile) {
           Game.setBoard(5, new TouchControls());
    }*/
};

var playGame = function() {
    Game.setBoard(3, new TitleScreen("Alien Invasion", "Game Started"));
    Game.started = true;
    var board = new GameBoard();
    var player = new PlayerShip();
    Game.playerShip = player;
    board.add(player);
    board.add(new HealthPoint(player));
    board.add(new Level(level1, winGame));
    Game.setBoard(3, board);
    Game.BGSoundInstance = createjs.Sound.play("bg");
};

var winGame = function() {
    Game.started = false;
    if(Game.mobile) {
        Game.setBoard(3, new TitleScreen("You win!", "Tap to start.", playGame));
    } else {
        Game.setBoard(3, new TitleScreen("You win!", "Press 'Enter' to start.", playGame));   
    }
    
    if(Game.BGSoundInstance) {
        Game.BGSoundInstance.stop();    
    }
    
};

var loseGame = function() {
    Game.started = false;
    if(Game.mobile) {
        Game.setBoard(3, new TitleScreen("You lose!", "Tap to start.", playGame));   
    } else {
        Game.setBoard(3, new TitleScreen("You lose!", "Press 'Enter' to start.", playGame));   
    }
    
    if(Game.BGSoundInstance) {
        Game.BGSoundInstance.stop();    
    }
};

var body = document.getElementById("body");
var container = document.getElementById("container");
container.width = window.innerWidth;
container.height = window.innerHeight;

window.addEventListener("load", function() {
    console.log("loading game...");
    var gameCanvas = document.getElementById('game');
    gameCanvas.width = container.width;
    gameCanvas.height = container.height;
    
    window.addEventListener("resize", function(e)
    {   
        //var widthToHeight = gameCanvas.width / gameCanvas.height;
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        console.log("resize: " + newWidth + "*" + newHeight);
        /*var newWidthToHeight = newWidth / newHeight;
        if(newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
        } else {
            newHeight = newWidth / widthToHeight;
        }*/
        //var newWidth = window.innerWidth;
        //var newHeight = window.innerHeight;
        //var newWidthToHeight = newWidth / newHeight;
       
        container.style.height = newHeight + 'px';
        container.style.width = newWidth + 'px';
        
        container.style.fontSize = (newWidth / 400) + 'em';
        Game.canvas.width = newWidth;
        Game.canvas.height = newHeight;
        Game.width = newWidth; 
        Game.height = newHeight;
    }, false);
    
    var queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    Game.initialize("game", spriteMap, startGame);
    console.log("Game initialzied.");
    
    
    queue.addEventListener("complete", function()
    {
        if(Game.mobile) {
            Game.setBoard(3, new TitleScreen("Alien Invasion", "Tap to start.", playGame));   
        } else {
            Game.setBoard(3, new TitleScreen("Alien Invasion", "Press 'Enter' to start.", playGame));   
        }
    });
    queue.loadManifest([{id: "laser", src:"sound/laserweapon.mp3"}, 
                        {id: "explosion", src:"sound/explosion.mp3"},
                        {id: "bg", src:"sound/daybreak.mp3"}
                        ]);
    
    
});

var PlayerShip = function() {
    this.setup("ship", {vx: 0, vy: 0, reloadTime: 0.25, maxVel: 200});
    this.x = Game.width / 2 - this.w / 2;
    this.y = Game.height - Game.playerOffset - this.h;
    // Avoid player immediately firing a missle when press fir to start the game
    this.reload = this.reloadTime; 
    this.health = 100;
    this.missileSoundStopped = true;
    
    this.step = function(dt) {
        if (Game.keys["left"]) {
            this.vx = -this.maxVel;
        }
        else if (Game.keys["right"]) {
            this.vx = this.maxVel;
        }
        else {
            this.vx = 0;
        }

        if (Game.keys["up"]) {
            this.vy = -this.maxVel;
        }
        else if (Game.keys["down"]) {
            this.vy = this.maxVel;
        }
        else {
            this.vy = 0;
        }
        if(!this.targetX) {
            this.x += this.vx * dt;
        }
        else if(Math.abs(this.targetX - this.x) > 5) {
            this.x += this.vx * dt;
        }
        
        this.y += this.vy * dt;
        if (this.x < 0) {
            this.x = 0;
        }
        else if (this.x > Game.width - this.w) {
            this.x = Game.width - this.w;
        }

        if (this.y < 0) {
            this.y = 0;
        }
        else if (this.y > Game.height - 10 - this.h) {
            this.y = Game.height - 10 - this.h;
        }
        this.reload -= dt;
        if(Game.keys["fire"] && this.reload < 0) {
            //Game.keys["fire"] = false;
            this.reload = this.reloadTime;
            // Shooting left
            this.board.add(new PlayerMissile(this.x, this.y + this.h /2)); 
            // Shooting right
            this.board.add(new PlayerMissile(this.x + this.w, this.y + this.h / 2));
            if(this.missileSoundStopped) {
                console.log("Play sound after it stopped");
                var that = this;
                this.missileSoundStopped = false;
                if(this.missileSoundIns) {
                    console.log("Re-play the sound");
                    console.log("Before setTimeout");
                    setTimeout(function() {
                        console.log("In setTimout");
                        that.missileSoundIns.play();
                        
                    }, dt * 1000);
                } else {
                   console.log("Play sound for the 1st time");
                   this.missileSoundIns = createjs.Sound.play("laser");
                   this.missileSoundIns.addEventListener("complete", function() {
                       console.log("Stopping the sound");
                       that.missileSoundIns.stop();
                       that.missileSoundStopped = true;    
                   });
                }
            } 
        }
    };
};

PlayerShip.prototype = new Sprite();

PlayerShip.prototype.type = OBJECT_PLAYER;

PlayerShip.prototype.hit = function(damage) {
    this.health -= damage;
    if(this.health <= 0) {
        if(this.board.remove(this)) {
            this.board.add(new Explosion(this.x + this.w / 2, this.y + this.h / 2));
            setTimeout(loseGame, 2000);
        }
    }
};

PlayerShip.type = OBJECT_PLAYER;

var PlayerMissile = function (x, y) {
    this.setup("missile", { vy: -700, damage: 10 });
    this.x = x - this.w / 2;
    this.y = y - this.h;
};

PlayerMissile.prototype = new Sprite();

PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

PlayerMissile.prototype.step = function(dt) {
    this.y += dt * this.vy;
    var collision = this.board.collide(this, OBJECT_ENEMY);
    if(collision) {
        collision.hit(this.damage);
        this.board.remove(this);
    } else if(this.y < -this.h) {
        this.board.remove(this);
    }
};

var Enemy = function(blueprint, override) {
    this.merge(this.baseParameters);
    this.setup(blueprint.spriteName, blueprint);
    this.merge(override);
    //this.onScreen = false;
    this.direction = 1;
    this.t = 0;
};
    
Enemy.prototype = new Sprite();

Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0,
                           E: 0, F: 0, G: 0, H: 0, score: 200, 
                           t: 0, firePercentage: 0.01, reloadTime: 1, reload: 0, damage: 50};  

Enemy.prototype.step = function(dt) {
    this.t += dt * 100;     
    var arc = this.t % 360 * Math.PI/2;
    //console.log(this.spriteName + ":" + arc);
    this.vx = this.direction * (this.A + this.B * Math.sin(this.C * arc + this.D));
    //console.log("vx:" + this.vx);
    this.vy = this.E + this.F * Math.sin(this.G + this.H);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    
    var collision = this.board.collide(this, OBJECT_PLAYER);
    if(collision) {
        collision.hit(this.damage);
        this.board.remove(this);
    }
    
    if(this.reload <= 0 && Math.random() < this.firePercentage) {
        this.reload = this.reloadTime;
        if(this.missiles === 2) {
            this.board.add(new EnemyMissile(this.x + this.w - 2, this.y + this.h / 2));
            this.board.add(new EnemyMissile(this.x + 2,this.y + this.h/2));
        } else {
            this.board.add(new EnemyMissile(this.x + this.w / 2, this.y + this.h));
        }
    } 
    
    this.reload -= dt;
        
    if((this.x < 0 || this.x > Game.width - this.w)) {
        this.direction = -this.direction;
    }
    
    if(this.y > Game.height) {
        this.board.remove(this);
    }
};

Enemy.prototype.hit = function(damage) {
    this.health -= damage;
    if(this.health <= 0) {
        if(this.board.remove(this)) {
            Game.score += this.score || 100;
            this.board.add(new Explosion(this.x + this.w / 2, this.y + this.h / 2));
        }
    }
}
var Explosion = function(x, y) {
    this.setup("explosion", { frame: 0 });
    this.x = x - this.w / 2;
    this.y = y - this.h / 2;
    this.subFrame = 0;
    createjs.Sound.play("explosion");
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt){
    this.subFrame++;
    this.frame = Math.floor(this.subFrame / 3);
    if(this.subFrame >= 36) {
        this.board.remove(this);
    }
};

var EnemyMissile = function(x, y) {
    this.setup("enemy_missile", {vy: 200, damage: 10});
    this.x = x - this.w / 2;
    this.y = y;
};

EnemyMissile.prototype = new Sprite();

EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;

EnemyMissile.prototype.step = function(dt) {
    this.y += this.vy * dt;
    var collision = this.board.collide(this, OBJECT_PLAYER);
    if(collision) {
        collision.hit(this.damage);
        this.board.remove(this);
    } else if(this.y > Game.height) {
        this.board.remove(this);
    }
};




