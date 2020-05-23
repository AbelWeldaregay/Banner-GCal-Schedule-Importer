var importButtonHTML = '<button id="import-button" class="btn green accent-4">Import Schedule</button>';
var exportToIcsButtonHTML = '<button id="export-ics-button" class="btn red accent-4" style="margin: 5px 0;letter-spacing: 0px;">Export schedule to .ics format</button>';
var banner_example_image = "<img id='banner-example-image' src='banner-example.png' style='width: 100%'>"
var authenticateButtonHTML = '<button id="authenticate-button" class="btn red accent-4" style="letter-spacing: 0px;">Allow Google Calendar Access</button>';
// is_app_authorized();
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message["data"] === "schedule_details_not_selected") {
   		document.getElementById("pagecodediv").innerHTML = "<br>You are almost there! Please select the <b>schedule details tab</b> as shown below:<br><br> <img id='banner-example-image' src='schedule_details.png' style='width: 100%'>";
   		document.getElementById("banner-example-image").style.display = "block";
	} else {
		update_table();
	}
    sendResponse({
        data: message
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

	   		document.getElementById("redirect-button").remove();
	   	} else {
	   		document.getElementById("pagecodediv").innerHTML = "<p>Please navigate to the Banner Schedule Details page as shown below:</p> <b> <img id='banner-example-image' src='banner-example.png' style='width: 100%'> <br>";
	   		document.getElementById("banner-example-image").style.display = "block";
	   	}
	    // use `url` here inside the callback because it's asynchronous!
	});
});


function is_app_authorized() {
	chrome.identity.getAuthToken({
		"interactive": false
	}, function(token) {
		if (!token) {
			return false;
		} else {
			return true;
		}
	});
}


function update_table() {
	
	var schedule = [];
	chrome.storage.local.get("schedule", function(schedule) {
		schedule = schedule["schedule"];
		chrome.identity.getAuthToken({
		    'interactive': false
		  }, function (token) {
			if (!token) {
	          	// Add event listener for import schedule button
	           	document.querySelector('#pagecodediv').innerHTML = "</br>You've come to the correct page! Please authorize this chrome extension to import your schedule!<br/><br/>After authenticating, come back to this page and use the extension again! The \"Allow Access\" button will change to allow importing!<br/><br/>";
	           	document.querySelector('#pagecodediv').innerHTML += authenticateButtonHTML;

	           	document.getElementById("authenticate-button").addEventListener("click", function() {
		           authenticate();		
	           }, false);
					// authenticate();
			} else {
				document.querySelector('#button-div').innerHTML = importButtonHTML;
		        var importScheduleButton = document.getElementById('import-button');
		        importScheduleButton.addEventListener('click', function () {
	          	console.log("importScheduleButton has been clicked.");
	         		importSchedule(schedule, schedule[0].selected_semester, schedule[0].meeting_window[1]);
		        }, false);

			}
			
		});

	});

	var table_str = "";
	// document.getElementById("pagecodediv").innerHTML = "";
	table_str += "<p>Here is what I found: </p>";
	document.getElementById("schedule").innerHTML = "";
	// opens a communication between scripts
	// document.getElementById("banner-example-image").style.display = "none";
	courseEventInfo = null;
	chrome.storage.local.get("table", function(table) {
		courseEventInfo = table["table"];
		for (var i = 0; i < table["table"].length; ++i) {
	   		table_str += "<div>";
	   		table_str += table["table"][i]["course_title"]+ " ( CRN: " + table["table"][i]["course_crn"] + " )";
	   		table_str += "</br>";
	   		
	   		if (table["table"][i]["meeting_times"] === "Online") {
	   			table_str += "Online"
	   		} else {
	   			table_str +=  table["table"][i]["meeting_building"] + " "+ table["table"][i]["meeting_room"];
		   		table_str += "</br>";
		   		for (var j = 0; j < table["table"][i]["meeting_days"].length; ++j) {
		   			
		   			switch(table["table"][i]["meeting_days"][j]) {
		   				case "Monday":
		   					table_str += "Mon, ";
		   					break;
		   				case "Tuesday":
		   					table_str += "Tues, ";
		   					break;
		   				case "Wednesday":
		   					table_str += "Wed, ";
		   					break;
		   				case "Thursday":
		   					table_str += "Thurs, ";
		   					break;
		   				case "Friday":
		   					table_str += "Fri, ";
		   					break;
		   				case "Saturday":
		   					table_str += "Sat, ";
		   					break;
		   				case "Sunday":
		   					table_str += "Sun, ";
		   					break;
		   			}
		   			// table_str += table["table"][i]["meeting_days"][j] + ", ";
		   		}
	   			table_str += table["table"][i]["meeting_times"][0] + " to " + table["table"][i]["meeting_times"][1];
	   		}			   		
	   		table_str += "</div>";
	   		// table_str += "</br>";
	   		table_str += "</br>";
			if (i == table["table"].length - 1) {
	   			document.getElementById("schedule").innerHTML += table_str;
			}
		}

	});
}

function authenticate() {
  window.close();
  // alert('After authenticating, come back to this page and use the extension again! The "Allow Access" button will change to allow importing!');
  chrome.identity.getAuthToken({
    'interactive': true
  }, function (token) {
    // Check the token.
    console.log(token);
  });
}

function importSchedule(courseEventInfo, viewedSemester, semEndDate) {
  document.querySelector('#import-button').className += " disabled";
  var pagecodediv = document.querySelector('#pagecodediv');
  pagecodediv.innerHTML = 'Importing your schedule...';
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
          document.querySelector('#import-button').remove();
          importEvents(newCalId, token, courseEventInfo, semEndDate);
        } else {
          console.log("Error", xhr.statusText);
          pagecodediv.innerHTML = 'Uh Oh! Something went wrong...Sorry about the inconvenience! Feel free to shoot abelweldaregay@gmail.com an email so we know we\'re down!';
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
    if (course.meeting_times === "Online")
    	continue;
	var semFirstDay = new Date(course.meeting_window[0]);
	semFirstDay = semFirstDay.getDay();	
	var classStartDay = 0;
	var classStartDate = new Date(new Date(course.meeting_window[0]));
	var classEndDate = new Date(new Date(course.meeting_window[0]));
	switch(course.meeting_day) {
		case "Monday":
			classStartDay = 1;
			break;
		case "Tuesday":
			classStartDay = 2;
			break;
		case "Wednesday":
			classStartDay = 3;
			break;
		case "Thursday":
			classStartDay = 4;
			break;
		case "Friday":
			classStartDay = 5;
			break;
	}

	var dayOffset = semFirstDay - classStartDay;
	
	if (dayOffset == 0) {	// class day is same as semester start day
		//do nothing; the day is correct
	} else if (dayOffset > 0) {	// class day is before semester start day (need to go to next week)
		classStartDate.setDate(classStartDate.getDate() + 7 - dayOffset);
		classEndDate.setDate(classEndDate.getDate() + 7 - dayOffset);
	} else {
		classStartDate.setDate(classStartDate.getDate() + Math.abs(dayOffset) );
		classEndDate.setDate(classEndDate.getDate() + Math.abs(dayOffset) );
	}
	classStartDate.setHours(parseInt(course.meeting_times[0].match(/(\d+)/g)[0]));
	classStartDate.setMinutes(parseInt(course.meeting_times[0].match(/(\d+)/g)[1]));

	classEndDate.setHours(parseInt(course.meeting_times[1].match(/(\d+)/g)[0]));
	classEndDate.setMinutes(parseInt(course.meeting_times[1].match(/(\d+)/g)[1]));

    // Set start/end dates taking into consideration am/pm
    if (parseInt(classStartDate.getHours()) < 12 && course.meeting_times[0].substr(-2) === "PM") {
      classStartDate.setHours(classStartDate.getHours() + 12);
    }
    if ( parseInt(classEndDate.getHours()) < 12 && course.meeting_times[0].substr(-2) === "PM") {
      classEndDate.setHours(classEndDate.getHours() + 12);
    }

    var params = {
      "summary": course.course_title + " (" + course.course_type + ")",
      "location": course.meeting_building ,
      "description": "CRN: " + course.course_crn,
      "start": {
        "dateTime": classStartDate,
        "timeZone": "America/New_York"
      },
      "end": {
        "dateTime": classEndDate,
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
