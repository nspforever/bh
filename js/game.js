var spriteMap = {
    ship: {
        sx: 0,
        sy: 0,
        w: 37,
        h: 42,
        frames: 3
    }
};

var startGame = function() {
    //SpriteSheet.draw(Game.ctx, "ship", 100, 100, 1);
    Game.setBoard(0, new Starfield(20, 0.4, 100, true));
    Game.setBoard(1, new Starfield(50, 0.6, 100));
    Game.setBoard(2, new Starfield(100, 1.0, 50));
    Game.setBoard(3, new TitleScreen("Alien Invasion", "Press Space to start playing", playGame));

};

var playGame = function() {
    Game.setBoard(3, new TitleScreen("Alien Invasion", "Game Started"));
    Game.setBoard(3, new PlayerShip());
}

window.addEventListener("load", function() {
    Game.initialize("game", spriteMap, startGame);
});

var PlayerShip = function() {
    this.w = SpriteSheet.map["ship"].w;
    this.h = SpriteSheet.map["ship"].h;
    this.x = Game.width / 2 - this.w / 2;
    this.y = Game.height - 10 - this.h;
    this.vx = 0;
    this.vy = 0;
    this.maxVel = 200;
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

        this.x += this.vx * dt;
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
    };

    this.draw = function(ctx) {
        SpriteSheet.draw(ctx, "ship", this.x, this.y, 0);
    };
}
