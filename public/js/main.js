// *********************************************************
// Application specific JS code to add to that provided by
// Bootstrap and HTML Boilerplate
// *********************************************************

// Constants

// list format:
// [cueword, target_word, correct_count, wrong_count, study_criterion]

// study lists
var mL1 = [['giraffe','snooker',0,0,1], ['hairpin','magpie',0,0,1],['parcel','guitar',0,0,1]];
//var mL1 = [['l1c1','l1a1',0,0,1], ['l1c2','l1a2',0,0,1],['l1c3','l1a3',0,0,1]];
var mL2 = [['l2c1','l2a1',0,0,1], ['l2c2','l2a2',0,0,1],['l2c3','l2a3',0,0,3]];

// first delayed test lists
var del1L1 = [['giraffe','snooker',0,0], ['hairpin','magpie',0,0],['parcel','guitar',0,0]];
//var del1L1 = [['l1c1','l1a1',0,0], ['l1c2','l1a2',0,0],['l1c3','l1a3',0,0]];
var del1L2 = [['l2c1','l2a1',0,0], ['l2c2','l2a2',0,0],['l2c3','l2a3',0,0]];

// second delayed test lists
var del2L1 = [['l1c1','l1a1',0,0], ['l1c2','l1a2',0,0],['l1c3','l1a3',0,0]];
var del2L2 = [['l2c1','l2a1',0,0], ['l2c2','l2a2',0,0],['l2c3','l2a3',0,0]];

// demo lists
var dL1 = [['hamster','freckle',0,0,1], ['wizard','turkey',0,0,1],['pistol','kennel',0,0,1]];
//var dL1 = [['dl1c1','dl1a1',0,0,1], ['dl1c2','dl1a2',0,0,1],['dl1c3','dl1a3',0,0,1]];
var dL2 = [['dl2c1','dl2a1',0,0,1], ['dl2c2','dl2a2',0,0,3],['dl2c3','dl2a3',0,0,3]];

var studyPresentations = 1;  // number of study presentations
var learnCriterion = 3;  // number of time to correctly recall to reach criterion
var studyDuration = 7000;  // ms to display each word pair
var feedbackDuration = 2000;  // ms to display correct/incorrect feedback
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

// respond to consent checkbox by enabling or disabling submit button
$('#consented').change(function(){
  if (this.checked) {
      $('#consentSubmit').prop('disabled', false);
  }
  if (!this.checked) {
      $('#consentSubmit').prop('disabled', true);
  }
});

/*
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
	var j = Math.floor(Math.random() * (i + 1));
	[array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
*/

// function to shuffle an array
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
	var j = Math.floor(Math.random() * (i + 1));
	var temp = array[i];
	array[i] = array[j];
	array[j] = temp;
    }
    return array;
}


// function triggered by 'start main study' button which checks for multiple attempts
function startLearn() {

    // Assumes the token was rendered into a meta tag
    var token = document.querySelector('meta[name="_csrf"]').getAttribute('content');

    // Using the core $.ajax() method to check on users status
    $.ajax({
	url: "/checkStatus",

	credentials: "same-origin",

	headers: {
	    "csrf-token": token
	},

	data: {
	    message: 'status check request',
	    testType: testType
	},

	type: "POST",

	dataType : "json",

	success: function( json ) {
	    //alert('Got json object back with message: ' + json.message);
	    console.log('Got json object back with message: ' + json.message);
	    if (json.message == ('learnt' || 'delayed1' || 'complete')){
		alert( "Sorry, our records show you have already completed the study phase. Please return to the homepage and enter as a Returning Participant. " );
	    }
	    else {
		validStartLearn();
	    }
	},

	error: function( xhr, status, errorThrown ) {
	    alert( "Sorry, there was a problem!" );
	    console.log( "Error: " + errorThrown );
	    console.log( "Status: " + status );
	    console.dir( xhr );
	},

    });
}

// function triggered by valid 'start main study' button
function validStartLearn() {
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

// function triggered by 'start demo' button
function startDemo() {
    // initialise counters and variables
    sL1 = dL1;
    sL2 = dL2;
    lists = [sL1, sL2];
    lL1 = [];
    lL2 = [];
    llists = [lL1, lL2];
    i = 0;  // item counter
    l = 0;  // list counter
    c = 1;  // presentations counter
    testType = "demo";
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
	    setTimeout(test, studyDuration);  // switch to test mode after final presentation of full list
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

	/* displaying debug test stats
	document.getElementById("duration").innerHTML= (endDate.getTime() - startDate.getTime());
	document.getElementById("correctAnswers").innerHTML= 100;
	document.getElementById("incorrectAnswers").innerHTML= 100;
	document.getElementById("testOver").style.display = "block";
	*/

	// Assumes the token was rendered into a meta tag
	var token = document.querySelector('meta[name="_csrf"]').getAttribute('content');

	// Using the core $.ajax() method to send test run data to server
	$.ajax({
	    url: "/studySave",

	    credentials: "same-origin",

	    headers: {
		"csrf-token": token
	    },

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
		//alert('Got json object back with message: ' + json.message);
		console.log('Got json object back with message: ' + json.message);
	    },

	    error: function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	    },

	    complete: function( xhr, status ) {
		//alert( "The request is complete!" );
		console.log( "The request is complete!");
		if (testType == 'demo'){
		    window.location.href = "/learn";
		}
		if (testType == 'study'){
		    window.location.href = "/postInstructions";
		}
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
	document.getElementById("cue").innerHTML = lists[l][i][0];
	document.getElementById("answer").innerHTML = lists[l][i][1];
	document.getElementById("icue").innerHTML = lists[l][i][0];
	document.getElementById("ianswer").innerHTML = lists[l][i][1];
	document.getElementById("tCueWord").value = lists[l][i][0];
	//document.getElementById("tAnswerWord").value = lists[l][i][1];
	document.getElementById("tAnswerWord").value = "";
	document.getElementById("tAnswerWord").focus();

    }
}

// function triggered by 'Submit' button or <CR> after entering an answer in demo or study phase
function checkAnswer() {

    if (document.getElementById("tAnswerWord").value.toLowerCase() === lists[l][i][1]) {
	++lists[l][i][2];  // increment correct counter
	// if criterion reached move to learnt list and remove from study list
	if (lists[l][i][2] === lists[l][i][4]) {
	    llists[l].push(lists[l][i]);
	    lists[l].splice(i,1);
	}
	document.getElementById("feedbackCorrect").style.display = "block";
	document.getElementById("testForm").style.display = "none";
	document.getElementById("testText").style.display = "none";
    }
    else {
	++lists[l][i][3];  // increment incorrect counter
	document.getElementById("feedbackIncorrect").style.display = "block";
	document.getElementById("testForm").style.display = "none";
	document.getElementById("testText").style.display = "none";
    }

    ++i;
    // if end of list reached and pairs still remaining then shuffle list before next test
    if (i >= lists[l].length && lists[l].length > 0) {
	shuffleArray(lists[l]);
	i=0;
    }
    setTimeout(test, feedbackDuration); // display feedback, then test next pair

}

// respond to <CR> key press within Answer field, run checkAnswer() or checkNoFeedback()
function enterRespond(){
    // your code
    console.log('enterRespond has been called');

    if($('#tAnswerWord').length != 0) {

	document.getElementById("tAnswerWord").onkeypress = function(e){
	    console.log('key press detected');
	    if (!e) e = window.event;
	    var keyCode = e.keyCode || e.which;
	    console.log(keyCode);
	    if (keyCode == '13'){
		// Enter pressed
		console.log('enter key pressed');

		// if testing during demo phase
		if (testType == 'demo'){
		    checkAnswer();
		}

		// if testing during study phase
		if (testType == 'study'){
		    checkAnswer();
		}

		// if testing for delayed cued-recall test
		if (testType == 'delayed'){
		    checkNoFeedback();
		}

		// if testing for delayed cued-recall test
		if (testType == 'delayed2'){
		    checkNoFeedback();
		}

		// original had this line, don’t  know why
		return false;
	    }
	};
    }
}
window.onload = enterRespond;

// function trieggered by 'Submit' button or <CR> after entering an answer in delayed test phase
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
    tL1 = del1L1;
    tL2 = del1L2;
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

// function striggered by 'start 2nd delayed recall test' button
function startTest2() {
    // initialise counters and variables
    i = 0;  // item counter
    l = 0;  // list counter
    c = 1;  // presentations counter
    tL1 = del1L1;
    tL2 = del1L2;
    tlists = [tL1, tL2];
    fL1 = [];
    fL2 = [];
    flists = [fL1, fL2];
    testType = "delayed2";
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

	// display stats on delayed test
	//document.getElementById("duration").innerHTML= (endDate.getTime() - startDate.getTime());
	var correct = 0;
	var incorrect = 0;
	for (var lk = tlists[l].length -1; lk > -1; lk--) {
	    correct += tlists[l][lk][2];
	    incorrect += tlists[l][lk][3];
	}
	var total = correct + incorrect;
	document.getElementById("correctAnswers").innerHTML= correct;
	document.getElementById("totalAnswers").innerHTML= total;
	//document.getElementById("testOver").style.display = "block";

	// Assumes the token was rendered into a meta tag
	var token = document.querySelector('meta[name="_csrf"]').getAttribute('content');

	// Using the core $.ajax() method to send test run data to server
	$.ajax({
	    url: "/studySave",

	    credentials: "same-origin",

	    headers: {
		"csrf-token": token
	    },

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
		//alert('Got json object back with message: ' + json.message);
		console.log('Got json object back with message: ' + json.message);
	    },

	    error: function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	    },

	    complete: function( xhr, status ) {
		//alert( "The request is complete!" );
		console.log( "The request is complete!");

		if (testType == 'delayed'){
		    //window.location.href = "/postDelayedInstructions";
		    // display the postDelayedInstructions along with the score
		    document.getElementById("postDelayedInstructions").style.display = "block";
		}
		if (testType == 'delayed2'){
		    //window.location.href = "/postDelayedInstructions";
		    // display the postDelayedInstructions along with the score
		    document.getElementById("postDelayedInstructions").style.display = "block";
		}
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
	//document.getElementById("tAnswerWord").value = tlists[l][i][1];
	document.getElementById("tAnswerWord").value = "";
	document.getElementById("tAnswerWord").focus();
    }
}
