window.onload = function() {

	// Heartrate testing and drawing
	var temp, height_old, height_new = 0; // for drawing
	var xPos = 1;

	var pubnub = PUBNUB.init({
		subscribe_key : 'sub-c-c14adb5c-082f-11e7-afb0-0619f8945a4f',
		publish_key : 'pub-c-570056e5-e96b-45dd-bf53-1f0350c70af2'
	});

	var result = document.getElementById('result');

	pubnub.subscribe({
		channel: 'heartbeat',
		callback: function(m) {
			console.log("Receiving: " + m.value);
			$(result).text(m.value);
			temp = m.value;
		},
		error: function(err) {console.log(err);}
	});

	function setup() {
		createCanvas(windowWidth, windowHeight);
	}

	function draw() {
		stroke('red');
		
		temp = parseInt($(result).text());
		// console.log("temp: " + temp);
		// console.log(typeof temp);

		temp = map(temp, 0, 1023, 0, height);
		// console.log(inByte);
		height_new = height - temp;
		line(xPos - 1, height_old, xPos, height_new);
		height_old = height_new;

		// at the edge of the screen, go back to the beginning:
		if (xPos >= width) {
			xPos = 0;
			background(0xff);
		} else {
			xPos++;
		}
	}

		////////////////////////////

	var fizzyText = new FizzyText('Fizzy Text!');

	var gui = new dat.GUI();
	gui.add(fizzyText, 'message');
	gui.add(fizzyText, 'growthSpeed', -0.01, 1).step(0.01).listen();
	gui.add(fizzyText, 'maxSize', 0, 5).step(0.25);
	gui.add(fizzyText, 'noiseStrength', 0, 100).listen();
	gui.add(fizzyText, 'speed', -1, 1).step(0.01).listen();
	gui.add(fizzyText, 'displayOutline');

	gui.addColor(fizzyText, 'color0');
	gui.addColor(fizzyText, 'color1');
	gui.addColor(fizzyText, 'color2');
	gui.addColor(fizzyText, 'color3');

	gui.add(fizzyText, 'fontSize', 70, 150).listen();
	gui.add(fizzyText, 'fontWeight', 100, 1000).step(100);
	gui.add(fizzyText, 'explode');
	gui.add(fizzyText, 'downloadImage');


	// FPS
	var stop = false;
	var frameCount = 0;
	var fps, fpsInterval, startTime, now, then, elapsed;
	var theta = 0;

	function startAnimating(fps) {
		fpsInterval = 1000 / fps;
		then = Date.now();
		startTime = then;
		update();
	}

		var counter = 1;
		var update = function() {
		  	requestAnimationFrame(update);

		  	// calc elapsed time since last loop
		  	now = Date.now();
		  	elapsed = now - then;

		  	if (elapsed > fpsInterval) {
		  		theta += 0.02
				fizzyText.noiseStrength = Math.abs(Math.sin(theta) * 100);
				// fizzyText.noiseStrength = Math.abs(Math.sin(temp) * 100);
				fizzyText.speed = Math.sin(theta / 2);
		  	}
		}

	// update();
	startAnimating(10);

	// Download the image
	function downloadImage(link, filename) {
		link.href = $("#fizzytext").find("canvas").prevObject[0].children[0].toDataURL();
		link.download = filename;
	}

	$('#download').click(function() {
		downloadImage(this, 'font.png');
	});
};