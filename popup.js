var importButtonHTML = '<button id="import-button" class="btn red accent-4">Import Schedule</button>';
var authenticateButtonHTML = '<button id="authenticate-button" class="btn red accent-4" style="letter-spacing: 0px;">Allow Google Calendar Access</button>';
var disabledAuthenticateButtonHTML = '<button id="authenticate-button" class="btn red accent-4" style="margin: 5px 0; letter-spacing: 0px;" disabled>Allow Google Calendar Access</button>';
var testudoLinkButtonHTML = '<button id="testudo-link-button" class="btn red accent-4">Take me to Testudo!</button>';
var exportToIcsButtonHTML = '<button id="export-ics-button" class="btn red accent-4" style="margin: 5px 0;letter-spacing: 0px;">Export schedule to .ics format</button>';

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	update_table();
    sendResponse({
        data: "I am fine, thank you. How is life in the background?"
    }); 
});
chrome.storage.local.get("prefs", function(data) {
	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
	    let url = tabs[0].url;
	   	if (data.prefs == "import" && url.indexOf("StudentRegistrationSsb") > -1) {
	   		var port = chrome.runtime.connect();
	   		port.postMessage({
	   			"from": "popup",
	   			"start": "scrap_web"
	   		});
	   		// opens a communication between scripts
	   		document.getElementById("banner-example-image").style.display = "none";
	   		document.getElementById("redirect-button").remove();
	   	} else {
	   		document.getElementById("banner-example-image").style.display = "block";
	   	}
	    // use `url` here inside the callback because it's asynchronous!
	});
});

function update_table() {
	var table_str = "";
	table_str += "<table>";
	table_str += "<p>Here is what I found: </p>";
	document.getElementById("schedule").innerHTML = "";
	// opens a communication between scripts
	document.getElementById("banner-example-image").style.display = "none";
	courseEventInfo = null;
	chrome.storage.local.get("table", function(table) {
		courseEventInfo = table["table"];		
		const semFirstDate = courseEventInfo[0].meeting_window[0];
		const semLastDate = courseEventInfo[0].meeting_window[1];
		for (var i = 0; i < table["table"].length; ++i) {
	   		table_str += "<tr>";
	   		table_str += "<td>"+table["table"][i]["course_title"]+ "(CRN: " + table["table"][i]["course_crn"] + ")" + "</td>";
	   		table_str += "</br>";
	   		
	   		if (table["table"][i]["meeting_times"] === "Online") {
	   			table_str += "Online"
	   		} else {
	   			table_str += "<td>" + table["table"][i]["meeting_building"] + " "+ table["table"][i]["meeting_room"] + "</td>";
		   		table_str += "</br>";
		   		table_str += "<td>";
		   		for (var j = 0; j < table["table"][i]["meeting_days"].length; ++j) {
		   			table_str += table["table"][i]["meeting_days"][j] + ", ";
		   		}
	   			table_str += table["table"][i]["meeting_times"][0] + " to " + table["table"][i]["meeting_times"][1];
	   		}			   		
	   		table_str += "</tr>";
	   		table_str += "</br>";
	   		table_str += "</br>";
			if (i == table["table"].length - 1) {
	   			document.getElementById("schedule").innerHTML += table_str;
			}
		}

	});
	table_str += "</table>";
	var schedule = [];
	chrome.storage.local.get("schedule", function(schedule) {
		schedule = schedule["schedule"];
		
		chrome.identity.getAuthToken({"interactive": true}, function (token) {
		if (token == null) {
			const authBtnEl = document.querySelector('#button-div');
			console.log("direct google import not available");
		} else {
          document.querySelector('#button-div').innerHTML = importButtonHTML;
          // Add event listener for import schedule button
          var importScheduleButton = document.getElementById('import-button');
          importScheduleButton.addEventListener('click', function () {
            console.log("importScheduleButton has been clicked.");
            //_gaq.push(['_trackEvent', 'importScheduleButton', 'clicked']);

            // chrome.identity.removeCachedAuthToken(
            //       { 'token': access_token },
            //       getTokenAndXhr);

            // Initiate GCal scheduling functionality
            importSchedule(schedule, schedule[0].selected_semester, schedule[0].meeting_window[1]);
          }, false);

		}
		})

	});
}

function importSchedule(courseEventInfo, viewedSemester, semEndDate) {
  document.querySelector('#import-button').className += " disabled";
  var pagecodediv = document.querySelector('#pagecodediv');
  chrome.identity.getAuthToken({
    'interactive': true
  }, function (token) {
    // Use the token.
    console.log(token);
    // POST request to create a new calendar
    var url = "https://www.googleapis.com/calendar/v3/calendars";
    var params = {
      "summary": viewedSemester + " ODU Schedule",
      "timeZone": "America/New_York"
    };
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.onreadystatechange = function () {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          var newCalId = (JSON.parse(xhr.responseText).id);
          pagecodediv.innerText = 'Importing your schedule...';
          document.querySelector('#import-button').remove();
          importEvents(newCalId, token, courseEventInfo, semEndDate);
        } else {
          console.log("Error", xhr.statusText);
          pagecodediv.innerText = 'Uh Oh! Something went wrong...Sorry about the inconvenience! Feel free to shoot abelweldaregay@gmail.com an email so we know we\'re down!';
          document.querySelector('#import-button').remove();
        }
      }
    }

    xhr.send(JSON.stringify(params));
  });
}


function importEvents(calId, token, courseEventInfo, semEndDate) {
  var semEndDateParam = new Date(semEndDate);

  semEndDateParam.setDate(semEndDateParam.getDate() + 1);
  semEndDateParamStr = semEndDateParam.toJSON().substr(0, 4) + semEndDateParam.toJSON().substr(5, 2) + semEndDateParam.toJSON().substr(8, 2);
  var postImportActionsCalled = false;


  for (var i = 0; i < courseEventInfo.length; i++) {
    // POST request to create a new event
    var url = "https://www.googleapis.com/calendar/v3/calendars/" + calId + "/events";

    var course = courseEventInfo[i];

    // Set start/end dates taking into consideration am/pm
    var startDate = (new Date(course.meeting_window[0]));
    startDate.setHours(course.meeting_times[0].substring(0, 2));
    startDate.setMinutes(course.meeting_times[0].substring(3, 5));
    if (parseInt(startDate.getHours()) < 12) {
      startDate.setHours(startDate.getHours() + 12);
    }
    var endDate = (new Date(course.meeting_window[0]));
    endDate.setHours(course.meeting_times[1].substring(0, 2));
    endDate.setMinutes(course.meeting_times[1].substring(3, 5));
    if ( parseInt(endDate.getHours()) < 12) {
      endDate.setHours(endDate.getHours() + 12);
    }

    var params = {
      "summary": course.course_title + " (" + course.course_type + ")",
      "location": course.meeting_building ,
      "description": "CRN: " + course.course_crn,
      "start": {
        "dateTime": course.startDate,
        "timeZone": "America/New_York"
      },
      "end": {
        "dateTime": course.endDate,
        "timeZone": "America/New_York"
      },
      "recurrence": [
        "RRULE:FREQ=WEEKLY;UNTIL=" + semEndDateParamStr
      ]
    };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.onreadystatechange = function () {
      if (xhr.readyState == XMLHttpRequest.DONE && !postImportActionsCalled) {
        // console.log(JSON.parse(xhr.responseText));
        postImportActions();
        postImportActionsCalled = true;
      }
    }

    xhr.send(JSON.stringify(params));
  }
}

// After schedule has been imported
function postImportActions() {
  console.log("Finished importing courses");
  console.log(pagecodediv);
  // pagecodediv.innerText = 'Completed schedule import.';

  window.open('https://calendar.google.com/calendar/render#main_7%7Cmonth', '_blank');
}

document.addEventListener('DOMContentLoaded', function () {
    var banner_btn = document.getElementById('redirect-button');
    banner_btn.addEventListener('click', function() {
    	document.querySelector('#redirect-button').remove();
       chrome.storage.local.set({"prefs": "import"}, function() {
       		console.log("value set");
       });
    });
});
