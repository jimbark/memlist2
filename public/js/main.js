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
var startDate = new Date();
var endDate = new Date();


function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
	var j = Math.floor(Math.random() * (i + 1));
	[array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


(function start() {
    startDate.setTime(Date.now());
    study();
})();  // function start() is called immediately to start it off


function study() {

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

/*
	// TODO - send data to server
	// Using the core $.ajax() method to send test run data to server
	$.ajax({
	    url: "/studySave",

	    data: {
		listid: $(this).attr('id'),
		list1: llists,
		start: startDate,
		end: endDate,
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
*/


    }

    // still have pairs not learnt to criterion, so test next element
    if (lists[l].length > 0) {
	document.getElementById("studyText").style.display = "none";
	document.getElementById("testText").style.display = "block";
	document.getElementById("feedbackCorrect").style.display = "none";
	document.getElementById("feedbackIncorrect").style.display = "none";
	document.getElementById("studyForm").style.display = "none";
	document.getElementById("testForm").style.display = "block";
	document.getElementById("tCueWord").value = lists[l][i][0];
	document.getElementById("tAnswerWord").value = lists[l][i][1];
    }
}


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
