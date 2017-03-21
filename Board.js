// Pubnub helps us communicate between the client and JohnnyFive
var pubnub = require('pubnub').init({
	subscribe_key : 'sub-c-c14adb5c-082f-11e7-afb0-0619f8945a4f',
	publish_key : 'pub-c-570056e5-e96b-45dd-bf53-1f0350c70af2'
});

function publishResult(m) {
	pubnub.publish({
		channel: 'heartbeat',
		message: { value: m }
	});
}


var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
	console.log("Ready!");

	var sensor = new five.Sensor({
		pin: "A0",
		freq: 750
	});

	sensor.on("change", function() {
		console.log(this.value);
		publishResult(this.value);
	});
})