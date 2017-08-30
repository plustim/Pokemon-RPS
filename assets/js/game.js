var config = {
	apiKey: "AIzaSyBf2zaxFN5RsgV_ctzdDFOW5e-OIXAnmR0",
	authDomain: "pokemon-rps.firebaseapp.com",
	databaseURL: "https://pokemon-rps.firebaseio.com",
	projectId: "pokemon-rps",
	storageBucket: "",
	messagingSenderId: "596066784159"
};
firebase.initializeApp(config);

var database = firebase.database();
var userID = "unique identifier";
var userName = "";
var playerOne = "";
var playerTwo = "";

// Link to Firebase Database for viewer tracking
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");

// Add ourselves to presence list when online.
connectedRef.on("value", function(snap){
	if(snap.val()){
		//
		var con = connectionsRef.push(true);
		var n = (""+con).split("/");
		userID = n[n.length - 1];
		console.log("my id: " + userID);
		con.onDisconnect().remove();
		// if disconnect is of player, end game and remove player
	}
});

// Number of online users is the number of objects in the presence list.
connectionsRef.on("value", function(snap){
	console.log(snap.numChildren() + " currently viewing.");
	// check to see if a player left
	if( !snap.child(player1).exists() && database.ref("/status").val().gameState === "playing"){
		// set player1 = player2 and player2 = empty
		// set gameState to "seeking"
	}else if( !snap.child(player2).exists() && database.ref("/status").val().gameState === "playing"){
		// set player2 = empty
		// set gameState to "seeking"
	}else if( !snap.child(player1).exists() && !snap.child(player2).exists() ){
		// set player1 = empty and player2 = empty
		// set gameState to "empty"
	}
});

database.ref("/status").on("value", function(snap){
	// update status of current game

	if( snap.child("player1").exists() ){
		if( snap.child("player2").exists() ){
			// both players set, RPS game in progress
		}else{
			// player1 is waiting for an opponent

			
		}
	}else{
		// no players are set, character selection screen
	}
})

// when server gets message, it will display the message (doesn't save message history to DB, just sends to all connected)
database.ref("/banter").on("value", function(snap) {

	if( snap.child("userName").exists() && snap.child("message").exists() ){
		console.log(snap.val().userName + ": " + snap.val().message);
		if( snap.val().userID === playerOne ){
			// show chat bubble over first player
		}else if( snap.val().userID === playerTwo ){
			// show chat bubble over second player
		}
	}else{
		console.log("error");

	}
/*  // If Firebase has a highPrice and highBidder stored (first case)
  if (snapshot.child("highBidder").exists() && snapshot.child("highPrice").exists()) {

    // Set the local variables for highBidder equal to the stored values in firebase.
    highBidder = snapshot.val().highBidder;
    highPrice = parseInt(snapshot.val().highPrice);

    // change the HTML to reflect the newly updated local values (most recent information from firebase)
    $("#highest-bidder").html(snapshot.val().highBidder);
    $("#highest-price").html("$" + snapshot.val().highPrice);

    // Print the local data to the console.
    console.log(snapshot.val().highBidder);
    console.log(snapshot.val().highPrice);
  }

  // Else Firebase doesn't have a highPrice/highBidder, so use the initial local values.
  else {

    // Change the HTML to reflect the local value in firebase
    $("#highest-bidder").html(highBidder);
    $("#highest-price").html("$" + highPrice);

    // Print the local data to the console.
    console.log("local High Price");
    console.log(highBidder);
    console.log(highPrice);
  }*/

// If any errors are experienced, log them to console.
}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});

// sets the userName when submitted
$("#name-form").on("submit", function(){
	event.preventDefault();
	userName = $("#name-form .input").val().trim();
	$("#name-form").fadeOut();
})

// send chat message to server when submitted
$("#banter").on("submit", function(){
	event.preventDefault();
	if( $("#bant").val().trim() ){
		database.ref("/banter").set({
			userID: 	userID,
			userName:	userName,
			message: 	$("#bant").val().trim()
		});
		$("#bant").val("");
	}
})

// send selection to server when option is clicked
$("#pokePicker").on("click", ".option", function(){
	if(0){

	}
})

function resolveMatch(){
	if( database.ref("/status").val().player1Choice === database.ref("/status").val().player2Choice ){
		// both are the same, draw
	}else if( database.ref("/status").val().player1Choice === "timeout"
		|| database.ref("/status").val().player1Choice === "bulbasaur" && database.ref("/status").val().player2Choice === "charmander" 
		|| database.ref("/status").val().player1Choice === "charmander" && database.ref("/status").val().player2Choice === "squirtle" 
		|| database.ref("/status").val().player1Choice === "squirtle" && database.ref("/status").val().player2Choice === "bulbasaur" ){
		// player 1 loses
	}else{
		// player 1 wins
	}
}