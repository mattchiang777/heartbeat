/*
    TODO
    - Set dat.gui (done)
    - Try out different animations
        - Would be cool to change the type of particle
        - Also making the bitmap data not fixed (either the outline should move or the font family should change)
    - Clean up and organize code (Done)
    - Test heartbeat (Done)
    - Integrate JohnnyFive? (Done)
    - Integrate JohnnyFive with FizzyText (Done)

    - Decide how heartrate will work with animation (Wed)
        - growthSpeed
        - maxSize
        - fontSize and fontWeight can just be randomly set
    - Git, Organize JohnnyFive/FizzyText and bundle (w/ webpack?) (Done)
    - Set the UX of the site (how to freeze and save image?) (Done)

    ISSUES
    - Text can spawn out of bounds (Done)
    
    INSTRUCTIONS
    - npm install pubnub@3.15.2
	- npm install johnny-five
    - node Board.js to hook up to johnnyfive
*/

function FizzyText(message) {

    var that = this;

    // These are the variables that we manipulate with gui-dat.
    // Notice they're all defined with "this". That makes them public.
    // Otherwise, gui-dat can't see them.

    this.growthSpeed = 0.2; // how fast do particles change size?
    this.maxSize = getRandomIntInclusive(3, 4); // how big can they get?
    this.noiseStrength = 10; // how turbulent is the flow?
    this.bgNoiseStrength = 10;
    this.speed = 0.4; // how fast do particles move?
    this.bgSpeed = 0.4;
    this.displayOutline = false; // should we draw the message as a stroke?
    this.framesRendered = 0;

    // this.color0 = "#00aeff";
    // this.color1 = "#0fa954";
    // this.color2 = "#54396e";
    // this.color3 = "#e61d5f";
    this.color0 = "#ffdcfc";
    this.color1 = "#c8feff";
    this.color2 = "#ffffff";
    this.color3 = "#c8feff";
    this.bgParticleColor = "#ffffff";

    // this.fontSize = 100;
    this.fontSize = getRandomIntInclusive(90, 150);
    this.fontWeight = 800;

    // __defineGetter__ and __defineSetter__ make JavaScript believe that
    // we've defined a variable 'this.message'. This way, whenever we 
    // change the message variable, we can call some more functions.

    this.__defineGetter__("message", function() {
        return message;
    });

    this.__defineSetter__("message", function(m) {
        message = m;
        createBitmap(message);
    });

    // We can even add functions to the DAT.GUI! As long as they have 0 argumets,
    // we can call them from the dat-gui panel.

    this.explode = function() {
        var mag = Math.random() * 30 + 30;
        for (var i in particles) {
            var angle = Math.random() * Math.PI * 2;
            particles[i].vx = Math.cos(angle) * mag;
            particles[i].vy = Math.sin(angle) * mag;
        }
    };

    ////////////////////////////////

    var _this = this;

    var width = window.innerWidth;
    var height = window.innerHeight;
    var textAscent = Math.random() * height;
    var textOffsetLeft = Math.random() * width;
    var noiseScale = 300;
    var frameTime = 30;

    // Keep the message within the canvas height bounds
    while ((textAscent > height - 100) || textAscent < 100) {
        textAscent = Math.random() * height;
    }

    var colors = [_this.color0, _this.color1, _this.color2, _this.color3];

    // This is the context we use to get a bitmap of text using the 
    // getImageData function.
    var r = document.createElement('canvas');
    var s = r.getContext('2d');

    // This is the context we actually use to draw.
    var c = document.createElement('canvas');
    var g = c.getContext('2d');

    r.setAttribute('width', width);
    c.setAttribute('width', width);
    r.setAttribute('height', height);
    c.setAttribute('height', height);

    // Add our demo to the HTML
    document.getElementById('fizzytext').appendChild(c);

    // Stores bitmap image
    var pixels = [];

    // Stores a list of particles
    var particles = [];
    var bgParticles = [];
    var bgParticles2 = [];

    // Set g.font to the same font as the bitmap canvas, incase we want to draw some outlines
    var fontAttr = _this.fontWeight + " " + _this.fontSize + "px helvetica, arial, sans-serif";
    s.font = g.font = fontAttr;

    // Instantiate some particles
    for (var i = 0; i < 2000; i++) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
    }

    // 2nd perlin field
    for (var i = 0; i < 1000; i++) { // 10k particles
        bgParticles.push(new bgParticle(Math.random() * width, Math.random() * height));
    }

    // 3rd perlin field
    for (var i = 0; i < 0; i++) {
        bgParticles2.push(new bgParticle(Math.random() * width, Math.random() * height));
    }

    // This function creates a bitmap of pixels based on your message
    // It's called every time we change the message property.
    var createBitmap = function(msg) {

        s.fillStyle = "#fff";
        s.fillRect(0, 0, width, height);

        s.fillStyle = "#222";
        // Keep the message within canvas width bounds
        var msgWidth = s.measureText(msg).width;
        while (textOffsetLeft + msgWidth > width) {
            textOffsetLeft = Math.random() * width;
        }
        s.fillText(msg, textOffsetLeft, textAscent);

        // Pull reference
        var imageData = s.getImageData(0, 0, width, height);
        pixels = imageData.data;

    };

    // Called once per frame, updates the animation.
    var render = function() {

        that.framesRendered++;

        // g.clearRect(0, 0, width, height);
        // Set the shown canvas background as black
        g.rect(0, 0, width, height);
        g.fillStyle = "black";
        g.fill();

        if (_this.displayOutline) {
            g.globalCompositeOperation = "source-over";
            g.strokeStyle = "#000";
            g.lineWidth = .5;
            g.strokeText(message, textOffsetLeft, textAscent);
        }

        g.globalCompositeOperation = "darker";

        // Choose particle color
        for (var i = 0; i < particles.length; i++) {
            g.fillStyle = colors[i % colors.length];
            particles[i].render();
        }

        // Choose bg particle color (white for testing)
        for (var i = 0; i < bgParticles.length; i++) {
            g.fillStyle = _this.bgParticleColor;
            bgParticles[i].render();
        }

        // Choose 2nd bg particle color
        for (var i = 0; i < bgParticles.length; i++) {
            g.fillStyle = "#00aeff";
            // bgParticles2[i].render();
        }
    };

    // Func tells me where x, y is for each pixel of the text
    // Returns x, y coordinates for a given index in the pixel array.
    var getPosition = function(i) {
        return {
            x: (i - (width * 4) * Math.floor(i / (width * 4))) / 4,
            y: Math.floor(i / (width * 4))
        };
    };

    // Returns a color for a given pixel in the pixel array
    var getColor = function(x, y) {
        var base = (Math.floor(y) * width + Math.floor(x)) * 4;
        var c = {
            r: pixels[base + 0],
            g: pixels[base + 1],
            b: pixels[base + 2],
            a: pixels[base + 3]
        };

        return "rgb(" + c.r + "," + c.g + "," + c.b + ")";
    };

    // This calls the setter we've defined above, so it also calls 
    // the createBitmap function
    this.message = message;

    // Set the canvas bg
    // document.getElementById('fizzytext').style.backgroundColor = colors[Math.floor(Math.random() * 4)]

    function resizeCanvas() {
        r.width = window.innerWidth;
        c.width = window.innerWidth;

        r.height = window.innerHeight;
        c.height = window.innerHeight;
    }

    var loop = function() {
        // Reset color array
        colors = [_this.color0, _this.color1, _this.color2, _this.color3]; // Change colors from dat.gui
        s.font = g.font = _this.fontWeight + " " + _this.fontSize + "px helvetica, arial, sans-serif";
        createBitmap(message);
        // _this.fontSize += 1;
        resizeCanvas();
        render();

        requestAnimationFrame(loop);
    }

    // This calls the render function every 30ms
    loop();

    /////////////////////////////////////////////

    // This class is responsible for drawing and moving those little 
    // colored dots.
    function Particle(x, y, c) {

        // Position
        this.x = x;
        this.y = y;

        // Size of particle
        this.r = 0;

        // This velocity is used by the explode function.
        this.vx = 0;
        this.vy = 0;

        this.constrain = function(v, o1, o2) {
            if (v < o1) v = o1;
            else if (v > o2) v = o2;
            return v;
        };

        // Called every frame
        this.render = function () {

            // What color is the pixel we're sitting on top of?
            var c = getColor(this.x, this.y);

            // Where should we move?
            var angle = noise(this.x / noiseScale, this.y / noiseScale) * _this.noiseStrength;

            // Are we within the boundaries of the image?
            var onScreen = this.x > 0 && this.x < width && this.y > 0 && this.y < height;

            var isBlack = c != "rgb(255,255,255)" && onScreen;

            // If we're on top of a black pixel, grow.
            // If not, shrink.
            if (isBlack) {
                this.r += _this.growthSpeed;
            } else {
                this.r -= _this.growthSpeed;
            }

            // This velocity is used by the explode function.
            this.vx *= 0.5;
            this.vy *= 0.5;

            // Change our position based on the flow field and our explode velocity.
            this.x += Math.cos(angle) * _this.speed + this.vx;
            this.y += -Math.sin(angle) * _this.speed + this.vy;

            // this.r = 3;
            // debugger
            // console.log(DAT.GUI.constrain(this.r, 0, _this.maxSize));
            this.r = this.constrain(this.r, 0, _this.maxSize);

            // If we're tiny, keep moving around until we find a black pixel.
            if (this.r <= 0) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                return; // Don't draw!
            }

            // Draw the circle.
            g.beginPath();
            g.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
            g.fill();
        }
    }

    function bgParticle(x, y, c) {

        // Position
        this.x = x;
        this.y = y;

        // Size of particle
        this.r = 0;

        // This velocity is used by the explode function.
        this.vx = 0;
        this.vy = 0;

        this.constrain = function(v, o1, o2) {
            if (v < o1) v = o1;
            else if (v > o2) v = o2;
            return v;
        };

        // Called every frame
        this.render = function () {

            // What color is the pixel we're sitting on top of?
            var c = getColor(this.x, this.y);

            // Where should we move?
            var angle = noise(this.x / noiseScale, this.y / noiseScale) * _this.bgNoiseStrength;

            // Are we within the boundaries of the image?
            var onScreen = this.x > 0 && this.x < width && this.y > 0 && this.y < height;

            var isBlack = c != "rgb(255,255,255)" && onScreen;

            // If we're on top of a black pixel, grow.
            // If not, shrink.
            if (isBlack) {
                this.r -= _this.growthSpeed / 2;
                // this.r -= Math.abs(Math.sin(_this.growthSpeed));
            } else {
                // this.r += _this.growthSpeed / 2;
                this.r += Math.abs(Math.sin(_this.growthSpeed));
            }

            // if not on screen respawn somewhere random
            if (!onScreen) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
            }

            // This velocity is used by the explode function.
            this.vx *= 0.5;
            this.vy *= 0.5;

            // Change our position based on the flow field and our explode velocity.
            this.x += Math.cos(angle) * _this.bgSpeed + this.vx;
            this.y += -Math.sin(angle) * _this.bgSpeed + this.vy;

            // this.r = 3;
            // debugger
            // console.log(DAT.GUI.constrain(this.r, 0, _this.maxSize));
            this.r = this.constrain(this.r, 0, 2);

            // If we're tiny, keep moving around until we find a black pixel.
            if (this.r <= 0) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                return; // Don't draw!
            }

            // Draw the circle.
            g.beginPath();
            g.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
            g.fill();
        }
    }

}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}