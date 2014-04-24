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
}

var hookTouchEvent = function(target, callback) {
    var useSetReleaseCapture = false;
    if (window.navigator.msPointerEnabled) {
        console.log("window.navigator.msPointerEnabled");
        // Microsoft pointer model
        target.addEventListener("MSPointerDown", callback, false);
        target.addEventListener("MSPointerMove", callback, false);
        target.addEventListener("MSPointerUp", callback, false);
        target.addEventListener("MSPointerCancel", callback, false);

        // css way to prevent panning in our target area
        if (typeof target.style.msContentZooming != 'undefined') target.style.msContentZooming = "none";

        // new in Windows Consumer Preview: css way to prevent all built-in touch actions on our target
        // without this, you cannot touch draw on the element because IE will intercept the touch events
        if (typeof target.style.msTouchAction != 'undefined') target.style.msTouchAction = "none";
    }
    else if (target.addEventListener) {

        // iOS touch model
        target.addEventListener("touchstart", callback, false);
        target.addEventListener("touchmove", callback, false);
        target.addEventListener("touchend", callback, false);
        target.addEventListener("touchcancel", callback, false);

        // mouse model
        target.addEventListener("mousedown", callback, false);

        // mouse model with capture
        // rejecting gecko because, unlike ie, firefox does not send events to target when the mouse is outside target
        if (target.setCapture && !window.navigator.userAgent.match(/\bGecko\b/)) {
            useSetReleaseCapture = true;

            target.addEventListener("mousemove", callback, false);
            target.addEventListener("mouseup", callback, false);
        }
    }
    else if (target.attachEvent && target.setCapture) {
        console.log(target.attachEvent && target.setCapture)
        // legacy IE mode - mouse with capture
        useSetReleaseCapture = true;
        target.attachEvent("onmousedown", function() {
            callback(window.event);
            window.event.returnValue = false;
            return false;
        });
        target.attachEvent("onmousemove", function() {
            callback(window.event);
            window.event.returnValue = false;
            return false;
        });
        target.attachEvent("onmouseup", function() {
            callback(window.event);
            window.event.returnValue = false;
            return false;
        });

        console.log("Using legacy IE mode - mouse model with capture");
    }
    else {
        console.log("Unexpected combination of supported features");
    }
};

var unhookTouchEvent = function(target, callback) {
    var useSetReleaseCapture = false;
    if (window.navigator.msPointerEnabled) {
        console.log("window.navigator.msPointerEnabled");
        // Microsoft pointer model
        target.removeEventListener("MSPointerDown", callback, false);
        target.removeEventListener("MSPointerMove", callback, false);
        target.removeEventListener("MSPointerUp", callback, false);
        target.removeEventListener("MSPointerCancel", callback, false);

    }
    else if (target.addEventListener) {

        // iOS touch model
        target.removeEventListener("touchstart", callback, false);
        target.removeEventListener("touchmove", callback, false);
        target.removeEventListener("touchend", callback, false);
        target.removeEventListener("touchcancel", callback, false);

        // mouse model
        target.removeEventListener("mousedown", callback, false);

        // mouse model with capture
        // rejecting gecko because, unlike ie, firefox does not send events to target when the mouse is outside target
        if (target.setCapture && !window.navigator.userAgent.match(/\bGecko\b/)) {
            useSetReleaseCapture = true;

            target.removeEventListener("mousemove", callback, false);
            target.removeEventListener("mouseup", callback, false);
        }
    }
};



var Game = new function() {
        // Init Game
        var KEY_CODES = {
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            32: "fire",
            13: "start",
        };
        var boards = [];

        this.initialize = function(canvasElementId, spriteData, callback) {
            
            console.log("initialzing game");
            this.canvas = document.getElementById(canvasElementId);
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.started = false;
            this.soundLoaded = false;
            
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
            if(Game.mobile) {
               hookTouchEvent(Game.canvas, this.trackTouch);
            }
            
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
            var hasTouch = ("ontouchstart" in window) || window.navigator.msPointerEnabled;
            var w = window.innerWidth;
            var h = window.innerHeight;
                
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
        
        this.trackTouch = function(e) {
           
            Game.keys["fire"] = true;
            console.log(e.type);
            /* Call e.preventDefault has below effect
               1. Prevent scroll on iphone
               2. No mouse events will get generated for touch
               3. No effect on Window Phone 8
            */
            e.preventDefault(); //No scroll on iphone
            var pointerList = e.changedTouches ? e.changedTouches : [e];
            for (var i = 0; i < pointerList.length; ++i) {
                var pointerObj = pointerList[i];
        
                if (e.type.match(/(start|down)$/i)) {
                    // clause for processing MSPointerDown, touchstart, and mousedown
                    if (Game.started === false) {
                        Game.keys["start"] = true;
                    }
                    
                    if (Game.playerShip) {
                        Game.playerShip.targetX = pointerObj.pageX;
                        if (pointerObj.pageX - Game.playerShip.x > 5) {
                            console.log("pointerObj.pageX - Game.playerShip.x > 5: " + (pointerObj.pageX - Game.playerShip.x));
                            Game.playerShip.targetX = pointerObj.pageX;
                            Game.keys["right"] = true;
                        }
                        else if (pointerObj.pageX - Game.playerShip.x < -5) {
                            console.log("pointerObj.pageX - Game.playerShip.x < -5: " + (pointerObj.pageX - Game.playerShip.x));
                            Game.keys["left"] = true;
                        }
                    }
                }
                else if (e.type.match(/move$/i)) {
                    
                }
                else if (e.type.match(/(up|end|cancel)$/i)) {
                    console.log("Touch end");
                    Game.keys["left"] = false;
                    Game.keys["right"] = false;
                }
            };
}
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
    SpriteSheet.draw(ctx, this.spriteName, parseInt(this.x), parseInt(this.y), this.frame);
};

Sprite.prototype.hit = function(damage) {
    this.board.remove(this); // regardless of the damage for initial version
};

var Starfield = function(speed, opacity, numStarts, clear) {
    var i = 0;
    this.stars = document.createElement("canvas");
    
    this.stars.width = Game.width;
    this.stars.height = Game.height;

    var starCtx = this.stars.getContext("2d");
    var offset = 0;

    if (clear) {
        starCtx.fillStyle = "#000";
        starCtx.fillRect(0, 0, this.stars.width, this.stars.height);
    }

    starCtx.fillStyle = "#FFF";
    starCtx.globalAlpha = opacity;

    for (; i < numStarts; ++i) {
        starCtx.fillRect(Math.floor(Math.random() * this.stars.width),
        Math.floor(Math.random() * this.stars.height),
        2, 2);
    }

    this.draw = function(ctx) {
        var intOffset = Math.floor(offset);
        var remaining = this.stars.height - intOffset;
        //this.stars.width = Game.width;
        //this.stars.height = Game.height;
        if (intOffset > 0) {
            ctx.drawImage(this.stars, 0, remaining,
            this.stars.width, intOffset,
            0, 0,
            this.stars.width, intOffset);
        }

        if (remaining > 0) {
            ctx.drawImage(this.stars, 0, 0,
            this.stars.width, remaining,
            0, intOffset,
            this.stars.width, remaining);
        }
    };

    this.step = function(dt) {
        offset += dt * speed;
        offset = offset % this.stars.height;
    };


};

var TitleScreen = function TitleScreen(title, subtitle, callback) {
    this.step = function(dt) {
        if(Game.keys["start"] && callback) callback(); 
        Game.keys["start"] = false;
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

var Score = function() {
    Game.score = 0;
    var scoreLength = 8;
    
    this.draw = function(ctx) {
        ctx.save();
        
        ctx.font = "bold 18px arial";
        ctx.fillStyle = "yellow";
         
        
        var text = "" + Game.score;
        
        var i = scoreLength - text.length, zeros = "";
        
        while(i > 0) {
            zeros += "0";
            i--;
        }
        
        ctx.fillText("score:" + zeros + text, 80, 20);
        
        ctx.restore();
    };
    
    this.step = function(dt) {  };
    
}

var HealthPoint = function(player) {
    var length = 5;
    
    this.draw = function(ctx) {
        ctx.save();
        
        ctx.font = "bold 18px arial";
        ctx.fillStyle = "green";
        var hp = player.health || 0;
         
        ctx.fillText("hp:" + player.health, 200, 20);
        
        ctx.restore();
    };
    
    this.step = function(dt) {  };
}


