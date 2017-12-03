// *********************************************************
// Application specific JS code to add to that provided by
// Bootstrap and HTML Boilerplate
// *********************************************************

// Constants
var mL1 = [['L1C1','L1A1',0,0], ['L1C2','L1A2',0,0],['L1C3','L1A3',0,0]];
var mL2 = ['L2C1:L2A1', 'L2C2:L2A2', 'L2C3:L2A3'];
var studyPresentations = 3;  // number of study presentations
var learnCriterion = 3;  // number of time to correctly recall to reach criterion
var studyDuration = 1000;  // ms to display each word pair
var feedbackDuration = 1000;  // ms to display correct/incorrect feedback
var testInterval = 50; // interval between delayed test items

// initialise global variables
var sL1 = mL1;
var sL2 = mL2;
var lists = [sL1, sL2];
var lL1 = [];
var lL2 = [];
var llists = [lL1, lL2];
var i = 0;  // item counter
var l = 0;  // list counter
var c = 1;  // presentations counter
var tL1 = mL1;
var tL2 = mL2;
var tlists = [tL1, tL2];
var fL1 = [];
var fL2 = [];
var flists = [lL1, lL2];
var startDate = new Date();
var endDate = new Date();
var testType = "";

/*
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
	var j = Math.floor(Math.random() * (i + 1));
	[array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
*/

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
	var j = Math.floor(Math.random() * (i + 1));
	var temp = array[i];
	array[i] = array[j];
	array[j] = temp;
    }
    return array;
}

// function striggered by 'start learning' button
function startLearn() {
    // initialise counters and variables
    sL1 = mL1;
    sL2 = mL2;
    lists = [sL1, sL2];
    lL1 = [];
    lL2 = [];
    llists = [lL1, lL2];
    i = 0;  // item counter
    l = 0;  // list counter
    c = 1;  // presentations counter
    testType = "study";
    startDate.setTime(Date.now());
    study();
}

/*
(function start() {
    startDate.setTime(Date.now());
    study();
})();  // function start() is called immediately to start it off
*/

function study() {

    document.getElementById("introduction").style.display = "none";
    document.getElementById("studyText").style.display = "block";
    document.getElementById("testText").style.display = "none";
    document.getElementById("feedbackCorrect").style.display = "none";
    document.getElementById("feedbackIncorrect").style.display = "none";
    document.getElementById("studyForm").style.display = "block";
    document.getElementById("testForm").style.display = "none";

    //wordpair.innerHTML = lists[l][i];
    //document.getElementById("wordpair").innerHTML = lists[l][i];
    document.getElementById("sCueWord").value = lists[l][i][0];
    document.getElementById("sAnswerWord").value = lists[l][i][1];

    if (++i < lists[l].length) {
	setTimeout(study, studyDuration);  // move to next element in list after displaying this one
    }
    else {
	i=0;
	if (c++ < studyPresentations) {
	    shuffleArray(lists[l]);	    // randomise order for next presentation
	    setTimeout(study, studyDuration);  // repeat list presentation required number of times
	}
	else {
	    shuffleArray(lists[l]);	    // randomise order before testing
	    setTimeout(test, studyDuration);  // switch to test mode after 3rd presentation of full list
	}
    }
}


function test() {

    // all pairs learnt to criterion, so end of test
    if (lists[l].length == 0) {
	endDate.setTime(Date.now());

	document.getElementById("introduction").style.display = "none";
	document.getElementById("studyText").style.display = "none";
	document.getElementById("testText").style.display = "none";
	document.getElementById("feedbackCorrect").style.display = "none";
	document.getElementById("feedbackIncorrect").style.display = "none";
	document.getElementById("studyForm").style.display = "none";
	document.getElementById("testForm").style.display = "none";

	document.getElementById("duration").innerHTML= (endDate.getTime() - startDate.getTime());
	document.getElementById("correctAnswers").innerHTML= 100;
	document.getElementById("incorrectAnswers").innerHTML= 100;

	document.getElementById("testOver").style.display = "block";

	// Using the core $.ajax() method to send test run data to server
	$.ajax({
	    url: "/studySave",

	    data: {
		lists: JSON.stringify(llists),
		startDate: JSON.stringify(startDate),
		endDate: JSON.stringify(endDate),
		duration: JSON.stringify(endDate.getTime() - startDate.getTime()),
		message: 'post message',
		testType: testType
	    },

	    type: "POST",

	    dataType : "json",

	    success: function( json ) {
		alert('Got json object back with message: ' + json.message);
	    },

	    error: function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	    },

	    complete: function( xhr, status ) {
		alert( "The request is complete!" );
	    }

	});
    }

    // still have pairs not learnt to criterion, so test next element
    if (lists[l].length > 0) {
	document.getElementById("check").onclick= function(){ checkAnswer();};
	document.getElementById("introduction").style.display = "none";
	document.getElementById("studyText").style.display = "none";
	document.getElementById("testText").style.display = "block";
	document.getElementById("feedbackCorrect").style.display = "none";
	document.getElementById("feedbackIncorrect").style.display = "none";
	document.getElementById("studyForm").style.display = "none";
	document.getElementById("testForm").style.display = "block";
	document.getElementById("tCueWord").value = lists[l][i][0];
	document.getElementById("tAnswerWord").value = lists[l][i][1];
	document.getElementById("tAnswerWord").focus();
    }
}

// fucntion trieggered by 'Submit' button or <CR> after entering an answer
function checkAnswer() {

    if (document.getElementById("tAnswerWord").value === lists[l][i][1]) {
	++lists[l][i][2];  // increment correct counter
	// if criterion reached move to learnt list and remove from study list
	if (lists[l][i][2] === 3) {
	    llists[l].push(lists[l][i]);
	    lists[l].splice(i,1);
	}
	document.getElementById("feedbackCorrect").style.display = "block";
    }
    else {
	++lists[l][i][3];  // increment incorrect counter
	document.getElementById("feedbackIncorrect").style.display = "block";
    }

    ++i;
    // if end of list reached and pairs still remaining then shuffle list before next test
    if (i >= lists[l].length && lists[l].length > 0) {
	shuffleArray(lists[l]);
	i=0;
    }
    setTimeout(test, feedbackDuration); // display feedback, then test next pair

}

// respond to <CR> key press within Answer field, run checkAnswer()
function enterRespond(){
    // your code
    console.log('enterRespond has been called');

    if($('tAnswerWord').length != 0) {

	document.getElementById("tAnswerWord").onkeypress = function(e){
	    console.log('key press detected');
	    if (!e) e = window.event;
	    var keyCode = e.keyCode || e.which;
	    console.log(keyCode);
	    if (keyCode == '13'){
		// Enter pressed
		console.log('enter key pressed');

		// if testing during study phase
		if (testType == 'study'){
		    checkAnswer();
		}

		// if testing for delayed cued-recall test
		if (testType == 'delayed'){
		    checkNoFeedback();
		}

		// original had this line, don’t  know why
		return false;
	    }
	};
    }
}
window.onload = enterRespond;


function checkNoFeedback() {

    if (document.getElementById("tAnswerWord").value === tlists[l][i][1]) {
	++tlists[l][i][2];  // increment correct counter
	// move to finished list and remove from test list
	flists[l].push(tlists[l][i]);
	//tlists[l].splice(i,1);
    }
    else {
	++tlists[l][i][3];  // increment incorrect counter
	// move to finished list and remove from test list
	flists[l].push(tlists[l][i]);
	//tlists[l].splice(i,1);
    }
    ++i;
    setTimeout(delayedTest, testInterval); // display feedback, then test next pair
}


// function striggered by 'start recall test' button
function startTest() {
    // initialise counters and variables
    i = 0;  // item counter
    l = 0;  // list counter
    c = 1;  // presentations counter
    tL1 = mL1;
    tL2 = mL2;
    tlists = [tL1, tL2];
    fL1 = [];
    fL2 = [];
    flists = [fL1, fL2];
    testType = "delayed";
    startDate.setTime(Date.now());
    // randomise order
    shuffleArray(tlists[l]);
    // start testing
    delayedTest();
}

function delayedTest() {

    // all pairs tested, so end of test
    if (flists[l].length == tlists[l].length) {
	endDate.setTime(Date.now());
	document.getElementById("introduction").style.display = "none";
	document.getElementById("studyText").style.display = "none";
	document.getElementById("testText").style.display = "none";
	document.getElementById("feedbackCorrect").style.display = "none";
	document.getElementById("feedbackIncorrect").style.display = "none";
	document.getElementById("studyForm").style.display = "none";
	document.getElementById("testForm").style.display = "none";
	document.getElementById("duration").innerHTML= (endDate.getTime() - startDate.getTime());
	document.getElementById("correctAnswers").innerHTML= 100;
	document.getElementById("incorrectAnswers").innerHTML= 100;
	document.getElementById("testOver").style.display = "block";

	// Using the core $.ajax() method to send test run data to server
	$.ajax({
	    url: "/studySave",

	    data: {
		lists: JSON.stringify(flists),
		startDate: JSON.stringify(startDate),
		endDate: JSON.stringify(endDate),
		duration: JSON.stringify(endDate.getTime() - startDate.getTime()),
		message: 'post message',
		testType: testType
	    },

	    type: "POST",

	    dataType : "json",

	    success: function( json ) {
		alert('Got json object back with message: ' + json.message);
	    },

	    error: function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	    },

	    complete: function( xhr, status ) {
		alert( "The request is complete!" );
	    }

	});
    }

    // still have pairs to test, so test next element
    if (flists[l].length < tlists[l].length) {
	document.getElementById("check").onclick= function(){ checkNoFeedback();};
	document.getElementById("introduction").style.display = "none";
	document.getElementById("studyText").style.display = "none";
	document.getElementById("testText").style.display = "block";
	document.getElementById("feedbackCorrect").style.display = "none";
	document.getElementById("feedbackIncorrect").style.display = "none";
	document.getElementById("studyForm").style.display = "none";
	document.getElementById("testForm").style.display = "block";
	document.getElementById("tCueWord").value = tlists[l][i][0];
	document.getElementById("tAnswerWord").value = tlists[l][i][1];
	document.getElementById("tAnswerWord").focus();
    }
}
