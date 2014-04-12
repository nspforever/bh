var TouchControls = function() {
    var gutterWidth = 10;
    var unitWidth = Game.width / 5;
    var blockWidth = unitWidth - gutterWidth;
    
    this.drawSquare = function(ctx, x, y, text, on) {
        ctx.globalAlpha = on ? 0.9 : 06;
        ctx.fillStyle = "#CCC";
        ctx.fillRect(x, y, blockWidth, blockWidth);
        
        ctx.fileStyle = "#FFF";
        ctx.textAlign = "center";
        ctx.globalAlpha = 1.0;
        ctx.font = "blod " + (3 * unitWidth / 4) + "px arial";
        ctx.fillText(text, x + blockWidth / 2, y + 3 * blockWidth / 4 + 5);
    };
    
    this.draw = function(ctx) {
        ctx.save();
        var yLoc = Game.height - unitWidth;
        
        this.drawSquare(ctx, gutterWidth, yLoc, "\u25C0", Game.keys["left"]);
        this.drawSquare(ctx, unitWidth + gutterWidth, yLoc, "\u25B6", Game.keys["right"]);
        this.drawSquare(ctx, 4 * unitWidth, yLoc, "A", Game.keys["fire"]);
        ctx.restore();
    };
    
    this.step = function(dt) {};
    
    this.trackTouch = function(e) {
        var touch, x, i;
        e.preventDefault();
        console.log("Tracking touch");
        Game.keys["left"] = false;
        Game.keys["right"] = false;
        
        console.log("e.targetTouches:");
        console.log(e.targetTouches);
        console.log("e.type:");
        console.log(e.type);
        
        for(var key in e) {
           var value = e[key]; 
           console.log(key + ":" + value);
        }
        x = e.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
        var pointerDown = (e.type === "MSPointerDown");
        if(x < unitWidth) {
            Game.keys["left"] = pointerDown;
        }
        
        if(x > unitWidth && x < 2 * unitWidth) {
            Game.keys["right"] = pointerDown;
        }
        
        if(x > 2 * unitWidth && x < 3 * unitWidth) {
            Game.keys["up"] = pointerDown;
        }
        Game.keys["fire"] = true;

        /*for(i = 0; i < e.targetTouches.length; ++i) {
            touch = e.targetTouches[i];
            x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
            if(x < unitWidth) {
                Game.keys["left"] = true;
            }
            
            if(x > unitWidth && x < 2 * unitWidth) {
                Game.keys["right"] = true;
            }
        }*/
        
        if(e.type === "touchstart" || e.type === "touchend" || e.type === "MSPointerDown") {
            //Game.keys["fire"] = (e.type === "touchstart" || e.type === "MSPointerDown");
            /*for(i = 0; i < e.changedTouches.length; ++i) {
                x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
                if(x > 4 * unitWidth) {
                    Game.keys["fire"] = (e.type === "touchstart" || e.type === "MSPointerDown");
                }
            }*/
        }
    };
    if (window.navigator.msPointerEnabled) {
        console.log("Hooking MS point events");
        
        Game.canvas.addEventListener("MSPointerDown", this.trackTouch, true);
        Game.canvas.addEventListener("MSPointerMove", this.trackTouch, true);
        Game.canvas.addEventListener("MSPointerUp", this.trackTouch, true);
    }
    try {
        Game.canvas.addEventListener("touchstart", this.trackTouch, true);
        Game.canvas.addEventListener("touchmove", this.trackTouch, true);
        Game.canvas.addEventListener("touchend", this.trackTouch, true);
        Game.playerOffset = unitWidth + 20;
    }
    catch(err) {
        console.log("err:" + err);
    }
    
}

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
            console.log("initialzing game");
            this.canvas = document.getElementById(canvasElementId);
            
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            
            this.playerOffset = 10;
            this.canvasMultiplier= 1;
            this.setupMobile();

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
        
        this.setupMobile = function() {
            var container = document.getElementById("container"),
                hasTouch = ("ontouchstart" in window) || window.navigator.msPointerEnabled,
                w = window.innerWidth,
                h = window.innerHeight;
                
            console.log("hasTouch:" + ("ontouchstart" in window).toString());
            if (hasTouch) {
                this.mobile = true;
                console.log("Set Game.mobile to true");
            }
            
            if (screen.width >= 1280 || !hasTouch) {
                return false;
            }
            if (w > h) {
                alert("Please rotate the device and then click OK");
                w = window.innerWidth;
                h = window.innerHeight;
            }
            container.style.height = h * 2 + "px";
            window.scrollTo(0, 1);
            h = window.innerHeight + 2;
            container.style.height = h + "px";
            container.style.width = w + "px";
            container.style.padding = 0;
            if (h >= this.canvas.height * 1.75 || w >= this.canvas.height * 1.75) {
                this.canvasMultiplier = 2;
                this.canvas.width = w / 2;
                this.canvas.height = h / 2;
                this.canvas.style.width = w + "px";
                this.canvas.style.height = h + "px";
            }
            else {
                this.canvas.width = w;
                this.canvas.height = h;
            }
            this.canvas.style.position = 'absolute';
            this.canvas.style.left = "0px";
            this.canvas.style.top = "0px";
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

Sprite.prototype.hit = function(damage) {
    this.board.remove(this); // regardless of the damage for initial version
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
        if(Game.keys['up'] && callback) callback(); 
        Game.keys['up'] = false;
    };
    
    this.draw = function (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.font = "bold 40px bangers";
        ctx.fillText(title, Game.width / 2, Game.height / 2);
        
        ctx.font = "bold 20px bangers";
        ctx.fillText(subtitle, Game.width / 2, Game.height / 2 + 40);
        
    };
};

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
        var wasStillAlive = this.removed.indexOf(obj) == -1;
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
};

var Level = function(levelData, callback) {
    this.levelData = [];
    for(var i = 0; i < levelData.length; i++) {
        this.levelData.push(Object.create(levelData[i]));
    }
    
    this.t = 0;
    this.callback = callback;
};

Level.prototype.step = function(dt) {
    var idx = 0, remove = [], curShip = null;
    var i, len;
    //Update the current time offset
    this.t += dt * 1000;
    // Example levelData
    // Start, End, Gap, Type, Override
    // [[ 0, 4000, 500, 'step', { x: 100 } ]
    while((curShip = this.levelData[idx]) && (curShip[0] < this.t + 2000)) {
        //Check if past the end time
        if(this.t > curShip[1]) {
            remove.push(curShip);
        }  else if (curShip[0] < this.t) {
            var enemy = enemies[curShip[3]], override = curShip[4];
            
            this.board.add(new Enemy(enemy, override));
            
            curShip[0] += curShip[2];
        }
        idx++;
    }
    
    for(i = 0, len = remove.length; i < len; ++i) {
        idx = this.levelData.indexOf(remove[i]);
        if(idx != -1) {
            this.levelData.splice(idx, 1);
        }
    }
    
    if(this.levelData.length === 0 && this.board.cnt[OBJECT_ENEMY] === 0) {
        if(this.callback) {
            this.callback();
        }
    }
    
};

Level.prototype.draw = function() {};








