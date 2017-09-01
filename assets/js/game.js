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

var refConnections = database.ref("/connections");
var refConnected = database.ref(".info/connected");
var refPlayers = database.ref("/players");
var refBanter = database.ref("/banter");
var refStatus = database.ref("/status");

var userID = "unique identifier";
var userName = "";
var id1 = "";
var id2 = "";


// Add ourselves to presence list when online.
refConnected.on("value", function(snap){
	if(snap.val()){
		//
		var con = refConnections.push(true);
		var n = (""+con).split("/");
		userID = n[n.length - 1];
		console.log("my id: " + userID);
		con.onDisconnect().remove();
	}
});

// Number of online users is the number of objects in the presence list.
refConnections.on("value", function(snap){
	console.log(snap.numChildren() + " currently viewing.");
});

refStatus.on("value", function(snap){
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

// listens for change to player.  This includes initialization, choices, and score updates
refPlayers.on("value", function(snap){
	// sets local vars
	if( snap.child("player1").exists() ){
		var p1 = snap.val().player1;
		$("#side1 .nameplate").text(p1.name);
		id1 = p1.id;
		$("#side1 .score").html("wins: "+p1.wins+"<br>losses: "+p1.losses);
		if( snap.val().player1.choice === "undecided"){
			$("#side1 .pokemon").removeClass("ball bulbasaur charmander squirtle");
		}
	}
	if( snap.child("player2").exists() ){
		p2 = snap.val().player2;
		$("#side2 .nameplate").text(p2.name);
		id2 = p2.id;
		$("#side2 .score").html("wins: "+p2.wins+"<br>losses: "+p2.losses);
		if( snap.val().player2.choice === "undecided"){
			$("#side2 .pokemon").removeClass("ball bulbasaur charmander squirtle");
		}
	}
	// making sure we have two players
	if( snap.child("player1").exists() && snap.child("player2").exists() ){ // both players are set
		$("#character-select").html("");
		// show the vs scene
		if(snap.val().player1.choice !== "undecided"){
			// show ball for player 1
			$("#select-1").remove();
			$("#side1 .pokemon").addClass("ball");
		}
		if(snap.val().player2.choice !== "undecided"){
			// show ball for player 2
			$("#select-2").remove();
			$("#side2 .pokemon").addClass("ball");
		}
		if( snap.val().player1.choice !== "undecided" && snap.val().player2.choice !== "undecided" ){
			// resolve the game
			setTimeout(function(){
				resolveMatch(snap);
			}, 2000);
		}
		if( snap.val().player1.id === userID && snap.val().player1.choice === "undecided" ){ // user is player 1
			// give options for player input
			$("#poke-select").html("<span id='select-1'><div class='oo1' data-name='bulbasaur'></div><div class='oo4' data-name='charmander'></div><div class='oo7' data-name='squirtle'></div></span>");
		}else if( snap.val().player2.id === userID  && snap.val().player2.choice === "undecided" ){ // user is player 2
			$("#poke-select").html("<span id='select-2'><div class='oo1' data-name='bulbasaur'></div><div class='oo4' data-name='charmander'></div><div class='oo7' data-name='squirtle'></div></span>");
		}

	}else if( (!snap.child("player1").exists() && !snap.child("player2").exists()) || !snap.exists() ){ // no player is set, user can select either
		$("#character-select").html( "<button id='player1'>red</button><button id='player2'>blue</button>" );
	}else if( !snap.child("player1").exists() && snap.val().player2.id !== userID ){ // only player 2 is set, and user is not player 2, user can select 1
		$("#character-select").html( "<button id='player1'>red</button>" );
	}else if( !snap.child("player2").exists() && snap.val().player1.id !== userID ){ // only player 1 is set, and user is not player 1, user can select 2
		$("#character-select").html( "<button id='player2'>blue</button>" );
	}else if( !snap.child("player1").exists() || !snap.child("player2").exists() ){ // user is a player, but other player is not set: waiting for opponent
		$("#character-select").html( "" );
	}
});

// set user as player 1 (red)
$("#character-select").on("click", "#player1", function(){
	var player1Ref = refPlayers.child("player1");
	player1Ref.set({
		id: userID,
		name: userName,
		wins: 0,
		losses: 0,
		choice: "undecided"
	});
	player1Ref.onDisconnect().remove();
});

// set user as player 2 (blue)
$("#character-select").on("click", "#player2", function(){
	var player2Ref = refPlayers.child("player2");
	player2Ref.set({
		id: userID,
		name: userName,
		wins: 0,
		losses: 0,
		choice: "undecided"
	});
	player2Ref.onDisconnect().remove();
});

// set the choice for player 1 (red)
$("#poke-select").on("click", "#select-1 div", function(){
	var selection = $(this).attr("data-name");
	console.log("picked " + selection);
	var ref = database.ref("/players/player1").child("choice");
	ref.set(selection);
});

// set the choice for player 2 (blue)
$("#poke-select").on("click", "#select-2 div", function(){
	var selection = $(this).attr("data-name");
	console.log("picked " + selection);
	var ref = database.ref("/players/player2").child("choice");
	ref.set(selection);
});

// sets the userName when submitted
$("#name-form").on("submit", function(){
	var name = $("#name-form .input").val().trim();
	if( name ){
		event.preventDefault();
		userName = name;
		$("#name-form").fadeOut();
		$("#send-banter, #character-select").fadeIn();
	}
})

// send chat message to server when submitted
$("#send-banter").on("submit", function(){
	event.preventDefault();
	if( $("#bant").val().trim() && userName !== "" ){
		refBanter.set({
			userID: 	userID,
			userName:	userName,
			message: 	$("#bant").val().trim()
		});
		$("#bant").val("");
	}
})

// get chat message from server on value change
refBanter.on("value", function(snap) {
	if( snap.exists() ){
		console.log(snap.val().userName + ": " + snap.val().message);
		var nameColor = "black";
		if( snap.val().userID === id1 ){
			// show chat bubble over first player
			$("#side1 .taunt").text(snap.val().message).fadeIn();
			setTimeout(function(){
				$("#side1 .taunt").fadeOut();
			}, 5000);
			nameColor = "red";
		}else if( snap.val().userID === id2 ){
			// show chat bubble over second player
			$("#side2 .taunt").text(snap.val().message).fadeIn();
			setTimeout(function(){
				$("#side2 .taunt").fadeOut();
			}, 5000);
			nameColor = "blue";
		}
		var name = $("<span>").text(snap.val().userName + ": ").addClass(nameColor);
		var bant = $("<span>").text(snap.val().message);
		var p = $("<p>").append(name, bant);
		$("#banter").append(p);

	}
}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});

refBanter.onDisconnect().remove();

function resolveMatch(snap){
	var p1 = snap.val().player1;
	var p2 = snap.val().player2;
	var wins1 = p1.wins;
	var wins2 = p2.wins;
	var losses1 = p1.losses;
	var losses2 = p2.losses;

	$("#side1 .pokemon").removeClass("ball").addClass(p1.choice);
	$("#side2 .pokemon").removeClass("ball").addClass(p2.choice);

	if( p1.choice === p2.choice ){
		// both are the same, draw
		$("#announce").html( "Draw!").fadeIn();
		console.log("draw");
	}else if( p1.choice === "timeout"
		|| p1.choice === "bulbasaur" && p2.choice === "charmander" 
		|| p1.choice === "charmander" && p2.choice === "squirtle" 
		|| p1.choice === "squirtle" && p2.choice === "bulbasaur" ){
		// player 1 loses
		console.log(p2.name + " wins");
		$("#announce").html( p2.name + " Wins!").fadeIn();
		wins2++;
		losses1++;
	}else{
		// player 1 wins
		console.log(p1.name + " wins");
		$("#announce").html( p1.name + " Wins!").fadeIn();
		wins1++;
		losses2++;
	}

	console.log(p1, p2, wins1, wins2, losses1, losses2);

	// update players and reset choices
	setTimeout(function(){
		var ref2 = refPlayers.child("player2");
		ref2.set({
			id: p2.id,
			name: p2.name,
			wins: wins2,
			losses: losses2,
			choice: "undecided"
		});
		var ref1 = refPlayers.child("player1");
		ref1.set({
			id: p1.id,
			name: p1.name,
			wins: wins1,
			losses: losses1,
			choice: "undecided"
		});
		$("#announce").fadeOut();
	}, 5000);
}