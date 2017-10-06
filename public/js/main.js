// *********************************************************
// Application specific JS code to add to that provided by
// Bootstrap and HTML Boilerplate
// *********************************************************

// initialise global variables
var L1 = [['L1C1','L1A1'], ['L1C2','L1A2'],['L1C3','L1A3']];
var L2 = ['L2C1:L2A1', 'L2C2:L2A2', 'L2C3:L2A3'];
var lists = [L1, L2];
var i = 0;
var l = 0;

(function study() {

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
	setTimeout(study, 3000);  // call myself in 3 seconds time if required
    }
    else {
	i=0;
	setTimeout(test, 3000);  // switch to test mode after display last pair for 3 secs
    }

})();      // above function expression is called immediately to start it off


function test() {

    if (i === lists[l].length) {
	document.getElementById("studyText").style.display = "none";
	document.getElementById("testText").style.display = "none";
	document.getElementById("feedbackCorrect").style.display = "none";
	document.getElementById("feedbackIncorrect").style.display = "none";
	document.getElementById("studyForm").style.display = "none";
	document.getElementById("testForm").style.display = "none";
	document.getElementById("testOver").style.display = "block";
    }

    else {
	document.getElementById("testOver").style.display = "none";
	document.getElementById("studyText").style.display = "none";
	document.getElementById("testText").style.display = "block";
	document.getElementById("feedbackCorrect").style.display = "none";
	document.getElementById("feedbackIncorrect").style.display = "none";
	document.getElementById("tCueWord").value = lists[l][i][0];
	document.getElementById("tAnswerWord").value = lists[l][i][1];
	document.getElementById("studyForm").style.display = "none";
	document.getElementById("testForm").style.display = "block";
    }
}


function checkAnswer() {

    if (document.getElementById("tAnswerWord").value === lists[l][i][1]) {
	    document.getElementById("feedbackCorrect").style.display = "block";
    }
    else {
	document.getElementById("feedbackIncorrect").style.display = "block";
    }

    ++i;
    setTimeout(test, 3000); // display feedback for 3 secs, then test next pair

}
