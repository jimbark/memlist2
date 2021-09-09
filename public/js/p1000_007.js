// *********************************************************
// Application specific JS code to add to that provided by
// Bootstrap and HTML Boilerplate
// *********************************************************

// project: p1000_007,  UK Recognition

// Constants

// list format:
// [cueword, target_word, correct_count, wrong_count, study_criterion, criterion_reached_time]

/*
// study lists for pilot with 1/2 and 3/5 criteria
var mL1 = [
    ['WAIST','SPRAY',0,0,2],
    ['STOVE','DIRT',0,0,1],
    ['GRIP','COIL',0,0,5],
    ['JURK',0,0,3],
    ['SOLE','CROW',0,0,2],
    ['BLADE','CALF',0,0,1],
    ['FORK','VEST',0,0,5],
    ['STEEL','BARK',0,0,3],
    ['PUMP','LOOP',0,0,2],
    ['TROOP','LEAK',0,0,1],
    ['TRIBE','SWEEP',0,0,5],
    ['RASH','PASTE',0,0,3],
    ['TUNE','VEAL',0,0,2],
    ['BIRTH','SUITE',0,0,1],
    ['GLOBE','LOCK',0,0,5],
    ['THIEF','VEIN',0,0,3]
];
*/

/*
// study lists after pilot with 1 recall for 30mins and 3 for 24hrs
var mL1 = [
    ['WAIST','SPRAY',0,0,1],
    ['STOVE','DIRT',0,0,1],
    ['GRIP','COIL',0,0,3],
    ['JUICE','PORK',0,0,3],
    ['SOLE','CROW',0,0,1],
    ['BLADE','CALF',0,0,1],
    ['FORK','VEST',0,0,3],
    ['STEEL','BARK',0,0,3],
    ['PUMP','LOOP',0,0,1],
    ['TROOP','LEAK',0,0,1],
    ['TRIBE','SWEEP',0,0,3],
    ['RASH','PASTE',0,0,3],
    ['TUNE','VEAL',0,0,1],
    ['BIRTH','SUITE',0,0,1],
    ['GLOBE','LOCK',0,0,3],
    ['THIEF','VEIN',0,0,3]
];
*/

// study lists with 3 recalls for all pairs, and only 12 pairs
var mL1 = [
    ['waist','spray',0,0,3],
    ['stove','dirt',0,0,3],
    ['grip','coil',0,0,3],
    ['juice','pork',0,0,3],
    ['sole','crow',0,0,3],
    ['blade','calf',0,0,3],
    ['fork','vest',0,0,3],
    ['steel','bark',0,0,3],
    ['pump','loop',0,0,3],
    ['troop','leak',0,0,3],
    ['tribe','sweep',0,0,3],
    ['rash','paste',0,0,3]
];

/*
// study lists with 1 & 2 recalls for 6 pairs each, and only 12 pairs total
// keep order the same so that can compare with previous results (avoid changing primacy/recency)
var mL1 = [
    ['waist','spray',0,0,1],
    ['stove','dirt',0,0,1],
    ['grip','coil',0,0,2],
    ['juice','pork',0,0,2],
    ['sole','crow',0,0,2],
    ['blade','calf',0,0,1],
    ['fork','vest',0,0,1],
    ['steel','bark',0,0,1],
    ['pump','loop',0,0,1],
    ['troop','leak',0,0,2],
    ['tribe','sweep',0,0,2],
    ['rash','paste',0,0,2]
];
*/

//var mL1 = [['giraffe','snooker',0,0,1], ['hairpin','magpie',0,0,1],['parcel','guitar',0,0,1],['salad','tinsel',0,0,1]];
//var mL1 = [['L1C1','L1A1',0,0,1], ['L1C2','L1A2',0,0,3],['L1C3','L1A3',0,0,3]];
var mL2 = [['l2c1','l2a1',0,0,1], ['l2c2','l2a2',0,0,1],['l2c3','l2a3',0,0,3]];

/*
// first delayed test lists
var del1L1 = [
    ['TUNE','VEAL',0,0,0],
    ['STOVE','DIRT',0,0,0],
    ['SOLE','CROW',0,0,0],
    ['BIRTH','SUITE',0,0,0],
    ['PUMP','LOOP',0,0,0],
    ['BLADE','CALF',0,0,0],
    ['WAIST','SPRAY',0,0,0],
    ['TROOP','LEAK',0,0,0]
];
*/

// first delayed test list, doing all 12 at both time intervals
// randomise order: 11,4,12,7,3,8,2,5,9,6,1,10
var del1L1 = [
    ['tribe','sweep',0,0,0],
    ['juice','pork',0,0,0],
    ['rash','paste',0,0,0],
    ['fork','vest',0,0,0],
    ['grip','coil',0,0,0],
    ['steel','bark',0,0,0],
    ['stove','dirt',0,0,0],
    ['sole','crow',0,0,0],
    ['pump','loop',0,0,0],
    ['blade','calf',0,0,0],
    ['waist','spray',0,0,0],
    ['troop','leak',0,0,0]
];

//var del1L1 = [['giraffe','snooker',0,0], ['hairpin','magpie',0,0]];
//var del1L1 = [['l1c1','l1a1',0,0], ['l1c2','l1a2',0,0],['l1c3','l1a3',0,0]];
var del1L2 = [['l2c1','l2a1',0,0,0], ['l2c2','l2a2',0,0,0],['l2c3','l2a3',0,0,0]];

// second delayed test lists
// randomise order: 7,2,8,6,11,1,4,10,12,5,3,9
var del2L1 = [
    ['fork','vest',0,0,0],
    ['stove','dirt',0,0,0],
    ['steel','bark',0,0,0],
    ['blade','calf',0,0,0],
    ['tribe','sweep',0,0,0],
    ['waist','spray',0,0,0],
    ['juice','pork',0,0,0],
    ['troop','leak',0,0,0],
    ['rash','paste',0,0,0],
    ['sole','crow',0,0,0],
    ['grip','coil',0,0,0],
    ['pump','loop',0,0,0]
];

//var del2L1 = [['parcel','guitar',0,0],['salad','tinsel',0,0]];
var del2L2 = [['l2c1','l2a1',0,0,0], ['l2c2','l2a2',0,0,0],['l2c3','l2a3',0,0,0]];

// recognition test
// cue word, 4 FCR answers, position of correct answer, selected answer position, selected answer, correct/incorrect
var del3L1 = [
    ['cue1','ans1_1','ans1_2','ans1_3','ans1_4','option1','option','resp1',0, null],
    ['cue2','ans2_1','ans2_2','ans2_3','ans2_4','option1','option','resp1',0, null],
    ['cue3','ans3_1','ans3_2','ans3_3','ans3_4','option1','option','resp1',0, null],
    ['cue4','ans4_1','ans4_2','ans4_3','ans4_4','option1','option','resp1',0, null],
    ['cue5','ans5_1','ans5_2','ans5_3','ans5_4','option1','option','resp1',0, null],
    ['cue6','ans6_1','ans6_2','ans6_3','ans6_4','option1','option','resp1',0, null],
    ['cue7','ans7_1','ans7_2','ans7_3','ans7_4','option1','option','resp1',0, null],
    ['cue8','ans8_1','ans8_2','ans8_3','ans8_4','option1','option','resp1',0, null],
    ['cue9','ans9_1','ans9_2','ans9_3','ans9_4','option1','option','resp1',0, null],
    ['cue10','ans10_1','ans10_2','ans10_3','ans10_4','option1','option','resp1',0, null],
    ['cue11','ans11_1','ans11_2','ans11_3','ans11_4','option1','option','resp1',0, null],
    ['cue12','ans12_1','ans12_2','ans12_3','ans12_4','option1','option','resp1',0, null],
];

// demo lists
//var dL1 = [['GIRAFFE','GUITAR',0,0,2], ['WIZARD','TURKEY',0,0,2],['PISTOL','KENNEL',0,0,2]];
//var dL2 = [['dl2c1','dl2a1',0,0,1], ['dl2c2','dl2a2',0,0,3],['dl2c3','dl2a3',0,0,3]];
//var dL1 = [['GIRAFFE','GUITAR',0,0,2,0], ['WIZARD','TURKEY',0,0,2,0],['PISTOL','KENNEL',0,0,2,0]];
var dL1 = [['birth','suite',0,0,2,0], ['globe','lock',0,0,2,0],['thief','vein',0,0,2,0]];
var dL2 = [['dl2c1','dl2a1',0,0,1,0], ['dl2c2','dl2a2',0,0,3,0],['dl2c3','dl2a3',0,0,3,0]];


var studyPresentations = 1;  // number of study presentations
var learnCriterion = 3;  // number of time to correctly recall to reach criterion
var studyDuration = 7000;  // ms to display each word pair
var feedbackDuration = 2000;  // ms to display correct/incorrect feedback
var testInterval = 50; // interval between delayed test items

// initialise global variables
var sL1 = mL1; // study list 1
var sL2 = mL2; // study list 2
var fsL1 = [];  // full answers list for sL1
var fsL2 = [];  // full answers list for sL2
var lists = [sL1, sL2, fsL1, fsL2]; // combined lists of unlearnt pairs
var lL1 = [];  // learnt list 1
var lL2 = [];  // learnt list 2
var llists = [lL1, lL2];  // combined lists of learnt pairs
var i = 0;  // item counter
var l = 0;  // list counter
var c = 1;  // presentations counter
var r = 0;  // recognition item counter
var tL1 = mL1;
var tL2 = mL2;
var ftL1 = [];  // full answers list for tL1
var ftL2 = [];  // full answers list for tL2
var tlists = [tL1, tL2, ftL1, ftL2];
var fL1 = [];
var fL2 = [];
var flists = [lL1, lL2];
var correct = 0;   // correct cued recall answers
var incorrect = 0;   // incorrect cued recall answers
var rcorrect = 0;   // total correct recognition answers
var startDate = new Date();
var endDate = new Date();
var testType = "";
var clists = [];  // combined stats for learnt and unlearnt pairs
var timedOut = false; // flag indicating whether timed out during study phase
var studyTime = 20; // maximum study time in minutes; 22 for old groups with 16 pairs and 20 for 12 pairs, 17m for study4 lecture group

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
    fsL1 = [];
    fsL2 = [];
    lists = [sL1, sL2, fsL1, fsL2];
    lL1 = [];
    lL2 = [];
    llists = [lL1, lL2];
    i = 0;  // item counter
    l = 0;  // list counter
    c = 0;  // presentations counter
    testType = "study";
    startDate.setTime(Date.now());
    study();
}

// function triggered by 'start demo' button
function startDemo() {
    // initialise counters and variables
    sL1 = dL1;
    sL2 = dL2;
    fsL1 = [];
    fsL2 = [];
    lists = [sL1, sL2, fsL1, fsL2];
    lL1 = [];
    lL2 = [];
    llists = [lL1, lL2];
    i = 0;  // item counter
    l = 0;  // list counter
    c = 0;  // presentations counter
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

    i+=1;
    if (i < lists[l].length) {
	setTimeout(study, studyDuration);  // move to next element in list after displaying this one
    }
    else {
	i=0;
	c+=1;
	if (c < studyPresentations) {
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

    // check if study time has expired
    endDate.setTime(Date.now());
    timedOut = (endDate.getTime() - startDate.getTime()) > (studyTime * 60 * 1000);

    // all pairs learnt to criterion, or study time expired, so end of test
    if ((lists[l].length == 0) || timedOut) {
	//endDate.setTime(Date.now());

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

	// calculate the 30min and 24hr test times based on time the study phase ended

	// 1st and 2nd delay intervals milliseconds
	var min30 = 1000 * 60 * 30;
	var min55 = 1000 * 60 * 55;
	var min60 = 1000 * 60 * 60;
	var hour24 = 1000 * 60 * 60 * 24;

	// calculate 1st delayed test target time
	var endTime = endDate.getTime();
	var n = new Date(endTime + min55);
	var hr = n.getHours();
	var min = (n.getMinutes() < 10 ? '0' : '') + n.getMinutes();
	var ampm = "am";
	if( hr > 12 ) {
	    hr -= 12;
	    ampm = "pm";
	}
	else if( hr == 12 ) {   //12:xxhrs is pm
	    ampm = "pm";
	}
	else if( hr == 0 ) {
	    hr = 12;   // want 12:15am not 0:15am
	}
	var t30 = hr + ":" + min + ampm;

	// calculate 24hour test target time
	n = new Date(endTime + hour24);
	hr = n.getHours();
	min = (n.getMinutes() < 10 ? '0' : '') + n.getMinutes();
	ampm = "am";
	if( hr > 12 ) {
	    hr -= 12;
	    ampm = "pm";
	}
	if( hr == 12 ) {    // as 12:xxhrs is pm
	    ampm = "pm";
	}
	if( hr == 0 ) {
	    hr = 12;    // 12:15am not 0:15am
	}
	var h24 = hr + ":" + min + ampm;

	/*
	// calculate 30min test target time
	var endTime = endDate.getTime();
	var n = new Date(endTime + min30);
	var hr = n.getHours();
	var min = (n.getMinutes() < 10 ? '0' : '') + n.getMinutes();
	var ampm = "am";
	if( hr > 12 ) {
	    hr -= 12;
	    ampm = "pm";
	}
	var t30 = hr + ":" + min + ampm;

	// calculate 24hour test target time
	n = new Date(endTime + hour24);
	hr = n.getHours();
	min = (n.getMinutes() < 10 ? '0' : '') + n.getMinutes();
	ampm = "am";
	if( hr > 12 ) {
	    hr -= 12;
	    ampm = "pm";
	}
	var h24 = hr + ":" + min + ampm;
	*/

	// prepare the complete set of learning data, concatenate learnt and unlearnt pairs
	clists = [llists, lists];

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
		t30: t30,
		h24: h24,
		message: 'post message',
		testType: testType,
		clists: JSON.stringify(clists),
		timedOut: timedOut
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

    // still have pairs not learnt to criterion, and study time has not expired, so test next element
    if ((lists[l].length > 0) && (!timedOut)) {
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

    var dNow = new Date();
    var firstWord = lists[l][i][0];
    var secondWord = lists[l][i][1];
    var answerWord = document.getElementById("tAnswerWord").value;  // don’t uppercase so can check case used
    var errorFlag = 0;
    var info = [firstWord, secondWord, answerWord, errorFlag, dNow];

    if (document.getElementById("tAnswerWord").value.toLowerCase().trim() === lists[l][i][1]) {
	++lists[l][i][2];  // increment correct counter
	lists[l+2].push(info);    // append full answer info to full answers list

	// if criterion reached record time and move to learnt list and remove from study list
	if (lists[l][i][2] === lists[l][i][4]) {
	    lists[l][i][5] = dNow;
	    llists[l].push(lists[l][i]);
	    lists[l].splice(i,1);
	    --i;    // decrement i as lists[l] is now one element shorter
	}
	document.getElementById("feedbackCorrect").style.display = "block";
	document.getElementById("testForm").style.display = "none";
	document.getElementById("testText").style.display = "none";
    }
    else {
	++lists[l][i][3];  // increment incorrect counter
	info[3] = 1;
	lists[l+2].push(info);    // append full answer info to full answers list

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

    var dNow = new Date();
    var firstWord = tlists[l][i][0];
    var secondWord = tlists[l][i][1];
    var answerWord = document.getElementById("tAnswerWord").value;  // don’t uppercase so can check case used
    var errorFlag = 0;
    var info = [firstWord, secondWord, answerWord, errorFlag, dNow];

    if (document.getElementById("tAnswerWord").value.toLowerCase().trim() === tlists[l][i][1]) {
	++tlists[l][i][2];  // increment correct counter
	tlists[l][i][5] = dNow;
	tlists[l+2].push(info);  // append full answer details to full answers list
	// move to finished list and remove from test list
	flists[l].push(tlists[l][i]);
	//tlists[l].splice(i,1);
    }
    else {
	++tlists[l][i][3];  // increment incorrect counter
	info[3] = 1;
	tlists[l][i][5] = dNow;
	tlists[l+2].push(info);  // append full answer details to full answers list
	// move to finished list and remove from test list
	flists[l].push(tlists[l][i]);
	//tlists[l].splice(i,1);
    }
    ++i;

    // if testing for first delayed cued-recall test
    if (testType == 'delayed'){
	setTimeout(delayedTest, testInterval); // display feedback, then test next pair
    }

    // if testing for second delayed cued-recall test
    if (testType == 'delayed2'){
	setTimeout(delayed2Test, testInterval); // display feedback, then test next pair
    }

    //setTimeout(delayedTest, testInterval); // display feedback, then test next pair
}


// function striggered by 'start recall test' button
function startTest() {
    // initialise counters and variables
    i = 0;  // item counter
    l = 0;  // list counter
    c = 1;  // presentations counter
    correct = 0;
    incorrect = 0;
    tL1 = del1L1;
    tL2 = del1L2;
    ftL1 = [];
    ftL2 = [];
    tlists = [tL1, tL2, ftL1, ftL2];
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

	// display stats on delayed test
	//document.getElementById("duration").innerHTML= (endDate.getTime() - startDate.getTime());
	correct = 0;
	incorrect = 0;
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
		testType: testType,
		tlists: JSON.stringify(tlists)
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
		    //document.getElementById("postDelayedInstructions").style.display = "block";
		    // startTest3();
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


// function striggered by 'start 2nd delayed recall test' button
function startTest2() {
    // initialise counters and variables
    i = 0;  // recall item counter
    l = 0;  // list counter
    c = 1;  // presentations counter
    r = 0;  // recognition item counter
    rcorrect = 0;   // total correct recognition answers
    correct = 0;   // total correct cued recall answers
    tL1 = del2L1;
    tL2 = del2L2;
    tL3 = del3L1;
    ftL1 = [];
    ftL2 = [];
    tlists = [tL1, tL2, ftL1, ftL2, tL3];
    fL1 = [];
    fL2 = [];
    fL3 = [];
    flists = [fL1, fL2, fL3];
    testType = "delayed2";
    startDate.setTime(Date.now());
    // randomise order
    shuffleArray(tlists[l]);
    // start testing
    //delayedRecogTest();
    delayed2Test();

}


function delayedRecogTest() {
    alert( "Got to start of 2nd delayed test recognition section!" );
    console.log( "Got to start of recogntion section!" );

    // clear screen, turn everything off
    document.getElementById("introduction").style.display = "none";
    document.getElementById("studyText").style.display = "none";
    document.getElementById("testText").style.display = "none";
    document.getElementById("feedbackCorrect").style.display = "none";
    document.getElementById("feedbackIncorrect").style.display = "none";
    document.getElementById("studyForm").style.display = "none";
    document.getElementById("testForm").style.display = "none";

    // if there are more elements to recogntion test then test next one
    if (flists[2].length < tL3.length) {
    //if (r < 12){

	//document.getElementById("recog").style.display = "block";

	console.log( document.getElementById("opt1").textContent );
	console.log( document.getElementById("opt1").innerHTML );
	console.log( document.getElementById("opt1").innerText );
	console.log( document.getElementById("opt1"));
	console.log( document.getElementById("opt2"));

	// set the value of the cue word and 4 FCR answers

	document.getElementById("rtCueWord").value = tL3[r][0];

	document.getElementById("opt1").innerHTML = '<input type="radio" name="options" id="option1">' + tL3[r][1];
	document.getElementById("opt2").innerHTML = '<input type="radio" name="options" id="option2">' + tL3[r][2];
	document.getElementById("opt3").innerHTML = '<input type="radio" name="options" id="option3">' + tL3[r][3];
	document.getElementById("opt4").innerHTML = '<input type="radio" name="options" id="option4">' + tL3[r][4];

	if($("#opt1").hasClass('active')){
	    $("#opt1").removeClass('active');
	}
	if($("#opt2").hasClass('active')){
	    $("#opt2").removeClass('active');
	}
	if($("#opt3").hasClass('active')){
	    $("#opt3").removeClass('active');
	}
	if($("#opt4").hasClass('active')){
	    $("#opt4").removeClass('active');
	}

	console.log( document.getElementById("opt1").textContent );
	console.log( document.getElementById("opt1").innerHTML );
	console.log( document.getElementById("opt1").innerText );
	console.log( document.getElementById("opt1"));
	console.log( document.getElementById("opt2"));

	// display the basic FCR test screen
	document.getElementById("recog").style.display = "block";

    }


    // if all pairs have been recogntion tested
    if (flists[2].length == tL3.length) {
    //if (r>=12){
	console.log('got to end of recog list');
	console.log('Total correct FCR answers: ' + rcorrect);
	console.log('Total correct recall: ' + correct);

    }

}


// function triggered by 'Submit' button after selecting an answer in delayed recogntion test
function checkRecognitionAnswer() {

    //var state = $("#option1").prop('checked');
    //console.log( "radio button state is:" + state);
    alert( "Got to check recog answer fucntion" );

    var rNow = new Date();

    // get the value of the cue word and 4 FCR answers
    var answerWord = $("#option1").parent('label').text();
    console.log( "value of the first option button is:" + answerWord );

    // check for correct answer selected
    var state = $("#" + tL3[r][5]).prop('checked');
    console.log( "checked value of correct answer is:" + state );
    if (state){ ++rcorrect; }

   // check which answer has been selected
    var select_pos = "";
    var select_ans = "";
    if ($("#option1").prop('checked')){
	select_pos = "option1";
	select_ans = document.getElementById("opt1").textContent;
	}
    else if ($("#option2").prop('checked')){
	select_pos = "option2";
	select_ans = document.getElementById("opt2").textContent;
	}
    else if ($("#option3").prop('checked')){
	select_pos = "option3";
	select_ans = document.getElementById("opt3").textContent;
	}
    else if ($("#option4").prop('checked')){
	select_pos = "option4";
	select_ans = document.getElementById("opt4").textContent;
	}
    else {
	select_pos = "none";
	select_ans = "none";
	}

    console.log( "checked answer position is: " + select_pos);
    console.log( "checked answer is: " + select_ans);
    tL3[r][6] = select_pos;
    tL3[r][7] = select_ans;
    tL3[r][8] = state;
    tL3[r][9] = rNow;   // store the time answer was submitted

    console.log(tL3[r]);

    flists[2].push(tL3[r]);   // push to finished list as counter
    ++r;                      // increment recogntion test item counter
    setTimeout(delayedRecogTest, testInterval); // display feedback, then test next pair

}

function delayed2Test() {

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
	correct = 0;
	incorrect = 0;
	for (var lk = tlists[l].length -1; lk > -1; lk--) {
	    correct += tlists[l][lk][2];
	    incorrect += tlists[l][lk][3];
	}
	var total = correct + incorrect;
	document.getElementById("correctAnswers").innerHTML= correct;
	document.getElementById("totalAnswers").innerHTML= total;
	//document.getElementById("testOver").style.display = "block";

	// jump to recognition test
	console.log('Total correct recall: ' + correct);
	console.log('Got to end of recall test, jumping to recog test');
	setTimeout(delayedRecogTest, testInterval); // display feedback, then test next pair

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

	//new fields for recognition test

    }
}

// copy participation code into username field to display it
function genCode() {
    var code = document.getElementById("code").value;
    document.getElementById("username").value = code;
}
