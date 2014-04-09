var Game = new function() {
        // Init Game
        var KEY_CODES = {
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            32: "fire"
        };
        var boards = [];

        this.initialize = function(canvasElementId, spriteData, callback) {
            this.canvas = document.getElementById(canvasElementId);
            this.width = this.canvas.width;
            this.height = this.canvas.height;

            this.ctx = this.canvas && this.canvas.getContext("2d");
            if (!this.ctx) {
                return alert("Please upgrade your browser");
            }

            // Setup user input
            this.setupInput();

            // Start game loop
            this.loop();

            SpriteSheet.load(spriteData, callback);

        };

        this.keys = {};
        this.setupInput = function() {
            window.addEventListener("keydown", function(e) {
                if (KEY_CODES[e.keyCode]) {
                    Game.keys[KEY_CODES[e.keyCode]] = true;
                    e.preventDefault();
                }
            }, false);

            window.addEventListener("keyup", function(e) {
                if (KEY_CODES[e.keyCode]) {
                    Game.keys[KEY_CODES[e.keyCode]] = false;
                    e.preventDefault();
                }
            }, false);

        };

        this.loop = function() {
            var dt = 30 / 1000;
            var i = 0;
            var len = boards.length;
            for (; i < len; ++i) {
                boards[i].step(dt);
                //step may get the board removed, check before calling the draw method
                boards[i] && boards[i].draw(Game.ctx);
            }
            setTimeout(Game.loop, 30);
        };

        this.setBoard = function(num, board) {
            boards[num] = board;
        };
    }

var SpriteSheet = new function() {
        this.map = {};
        this.load = function(spriteData, callback) {
            this.map = spriteData;
            this.image = new Image();
            this.image.onload = callback;
            this.image.src = 'images/sprites.png';
        };

        this.draw = function(ctx, sprite, x, y, frame) {
            var s = this.map[sprite];
            if (!frame) {
                frame = 0;
            }
            ctx.drawImage(this.image,
            s.sx + frame * s.w,
            s.sy,
            s.w, s.h,
            x, y,
            s.w, s.h);
        };
    }
    
var Sprite = function() { }

Sprite.prototype.setup = function(spriteName, props) {
    this.spriteName = spriteName;
    this.merge(props);
    this.frame = this.frame || 0;
    this.w = SpriteSheet.map[spriteName].w;
    this.h = SpriteSheet.map[spriteName].h;
};

Sprite.prototype.merge = function(props) {
    if(props) {
        for(var prop in props) {
            this[prop] = props[prop];
        }
    }
};

Sprite.prototype.draw = function(ctx) {
    SpriteSheet.draw(ctx, this.spriteName, this.x, this.y, this.frame);
};

var Starfield = function(speed, opacity, numStarts, clear) {
    var i = 0;
    var stars = document.createElement("canvas");
    stars.width = Game.width;
    stars.height = Game.height;

    var starCtx = stars.getContext("2d");
    var offset = 0;

    if (clear) {
        starCtx.fillStyle = "#000";
        starCtx.fillRect(0, 0, stars.width, stars.height);
    }

    starCtx.fillStyle = "#FFF";
    starCtx.globalAlpha = opacity;

    for (; i < numStarts; ++i) {
        starCtx.fillRect(Math.floor(Math.random() * stars.width),
        Math.floor(Math.random() * stars.height),
        2, 2);
    }

    this.draw = function(ctx) {
        var intOffset = Math.floor(offset);
        var remaining = stars.height - intOffset;
        if (intOffset > 0) {
            ctx.drawImage(stars, 0, remaining,
            stars.width, intOffset,
            0, 0,
            stars.width, intOffset);
        }

        if (remaining > 0) {
            ctx.drawImage(stars, 0, 0,
            stars.width, remaining,
            0, intOffset,
            stars.width, remaining);
        }
    };

    this.step = function(dt) {
        offset += dt * speed;
        offset = offset % stars.height;
    };


};

var TitleScreen = function TitleScreen(title, subtitle, callback) {
    this.step = function(dt) {
        if(Game.keys['fire'] && callback) callback();  
    };
    
    this.draw = function (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.font = "bold 40px bangers";
        ctx.fillText(title, Game.width / 2, Game.height / 2);
        
        ctx.font = "bold 20px bangers";
        ctx.fillText(subtitle, Game.width / 2, Game.height / 2 + 40);
        
    };
}

var GameBoard = function() {
    var board = this;
    
    this.objects = [];
    this.cnt = [];
    this.removed = [];
    
    this.add = function (obj) {
        obj.board = this;
        this.objects.push(obj);
        this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
        return obj;
    };
    
    this.remove = function(obj) {
        var wasStillAlive = this.removed.indexOf(obj) != -1;
        if(wasStillAlive) {
            this.removed.push(obj);
        }
        return wasStillAlive;
    };
    
    this.resetRemoved = function() {
        this.removed = [];
    };
    
    this.finalizeRemoved = function() {
        for(var i = 0, len = this.removed.length; i < len; ++i) {
            var idx = this.objects.indexOf(this.removed[i]);
            if(idx != -1) {
                this.cnt[this.removed[i].type]--;
                this.objects.splice(idx, 1);
            }
        }
    };
    
    this.iterate = function(funcName) {
        var args = Array.prototype.slice.call(arguments, 1);
        
        var i = 0;
        var len = this.objects.length;
        for(; i < len; ++i) {
            var obj = this.objects[i];
            obj[funcName].apply(obj, args);
        }
    };
    
    this.detect = function(func) {
        var i = 0;
        var val = null;
        var len = this.objects.length;
        for(; i < len; ++i) {
            if(func.call(this.objects[i])) {
                return this.objects[i];
            }
        }
        return false;
    };
    
    this.step = function(dt) {
        this.resetRemoved();
        this.iterate('step', dt);
        this.finalizeRemoved();
    };
    
    this.draw = function(ctx) {
        this.iterate('draw', ctx);
    };
    
    this.overlap = function(o1, o2) {
        return !((o1.y + o1.h < o2.y) || (o1.y > o2.y + o2.h - 1) ||
                (o1.x + o1.w < o2.x) || (o1.x > o2.x + o2.w - 1));
    };
    
    this.collide = function(obj, type) {
        return this.detect(function() {
           var col = (!type || this.type & type) && board.overlap(obj, this);
           return col ? this : false;
        });
    };
}






