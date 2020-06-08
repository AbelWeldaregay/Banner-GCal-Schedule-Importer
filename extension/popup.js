var importButtonHTML = '<button style="background: steelblue;" id="import-button" class="btn accent-4">Import Schedule</button>';
var exportToIcsButtonHTML = '<button id="export-ics-button" class="btn accent-4" style="margin: 5px 0;letter-spacing: 0px;">Export to .ics file</button>';
var banner_example_image = "<img id='banner-example-image' src='banner-example.png' style='width: 100%'>"
var authenticateButtonHTML = '<button id="authenticate-button" class="btn red accent-4" style="letter-spacing: 0px;">Allow Google Calendar Access</button>';
var courses = null;
// is_app_authorized();
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

	if (message["data"] === "schedule_details_not_selected") {
   		document.getElementById("pagecodediv").innerHTML = "<br>You are almost there! Please select the <b>schedule details tab</b> as shown below:<br><br> <img id='banner-example-image' src='schedule_details.png' style='width: 100%'>";
   		document.getElementById("banner-example-image").style.display = "block";
	} else {
		courses = message["data"];
		update_table();
	}
    sendResponse({
        data: message
    }); 
});

window.onload = function() {

	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
	    let url = tabs[0].url;
	   	if (url.indexOf("StudentRegistrationSsb/ssb/registrationHistory/registrationHistory") > -1) {
	   		var port = chrome.runtime.connect();
	   		port.postMessage({
	   			"from": "popup",
	   			"start": "scrap_web"
	   		});

	   		document.getElementById("redirect-button").remove();
	   	} else {
	   		document.getElementById("pagecodediv").innerHTML = "<p>Please navigate to the Banner Schedule Details page as shown below and return to the extension: (<a target='_blank' href='https://abelweldaregay.github.io/Banner-GCal-Schedule-Importer/help'> click here for help</a> )</p> <b> <img id='banner-example-image' src='banner-example.png' style='width: 100%'> <br>";
   			document.getElementById("banner-example-image").style.display = "block";
	   	}
	    // use `url` here inside the callback because it's asynchronous!
	});


};


function is_app_authorized() {
	chrome.identity.getAuthToken({
		"interactive": false
	}, function(token) {
		console.log("token: " + token);
		if (!token) {
			return false;
		} else {
			return true;
		}
	});
}


 async function update_table() {
	chrome.identity.getAuthToken({
		"interactive": false
	}, function(token) {
		console.log("token: " + token);
		if (!token) {
			// Add event listener for import schedule button
			document.querySelector('#pagecodediv').innerHTML = "</br>You've come to the correct page! Please authorize this chrome extension to import your schedule!<br/><br/>After authenticating, come back to this page and use the extension again! The \"Allow Access\" button will change to allow importing!<br/><br/>";
			document.querySelector('#pagecodediv').innerHTML += authenticateButtonHTML;

			document.getElementById("authenticate-button").addEventListener("click", function() {
			authenticate();		
		}, false);
		} else {
			document.querySelector('#button-div').innerHTML = importButtonHTML;
			document.querySelector('#button-div').innerHTML += "<br>" + exportToIcsButtonHTML
			var importScheduleButton = document.getElementById('import-button');
			var exportToICSButton = document.getElementById("export-ics-button");
			importScheduleButton.addEventListener('click', function () {
				ga('_trackEvent', 'importButton', 'clicked');
				 importSchedule(courses, courses[0].selected_semester, courses[0].meeting_window[1]);
			}, false);
			exportToICSButton.addEventListener("click", function() {
				document.getElementById("export-ics-button").remove();
				document.getElementById("import-button").remove();
				document.getElementById("pagecodediv").innerHTML = "<br>Once it finishes downloading, upload it to <a target='_blank' href='https://calendar.google.com/calendar/r/settings/export'>Google calendar</a> or Microsoft Outlook Calendar yourself! </br></br>Make sure to create a new empty calendar to upload to if you prefer your course schedule in its own separate calendar."
				exportScheduleToIcs(courses, courses[0].selected_semester, courses[0].meeting_window[1]);
			}, false);
			
		    build_preview();
			var i = 0;
			while (i < courses.length) {
				document.getElementById(courses[i].id + "-button").addEventListener("click", function() {
					console.log(this.id);
					var course_id = this.id.replace("-button", "");
					document.getElementById(this.id.replace("-button", "")).remove();
					remove_course(course_id);
				});
				if (courses[i]["meeting_days"] === undefined)
					i += 1;
				else
					i += courses[i]["meeting_days"].length;
			}

		}
	});
}

function build_preview() {
	var table_str = "";
	// document.getElementById("pagecodediv").innerHTML = "";
	table_str += "<p>Here is what I found: </p>";
	document.getElementById("schedule").innerHTML = "";
	// opens a communication between scripts
	// document.getElementById("banner-example-image").style.display = "none";
	var i = 0;
	var all_courses_online = true;
	 while(i < courses.length){
		
	   		table_str += "<div id = '" + courses[i]["id"] + "'>";
			table_str += "<hr>";   
			table_str += courses[i]["course_title"]+ " ( CRN: " + courses[i]["course_crn"] + " )";
	   		table_str += "</br>";
	   		
	   		if (courses[i]["meeting_times"] === "Online") {
				table_str += "Online";
				table_str += '<i id = ' + courses[i]["id"] + "-button" + ' value="' + courses[i]["id"] + '" style="float: right; color: red;" class="fa fa-trash small delete-course"></i>';
				table_str += "<br>";
				table_str += "<br>";
	   			i += 1;
		   		table_str += "</div>";
	   			continue;
	   		} else {
				all_courses_online = false;
				table_str +=  courses[i]["meeting_building"] + " " + courses[i]["meeting_room"];
				table_str += '<i id = ' + courses[i]["id"] + "-button" + ' value="' + courses[i]["id"] + '" style="float: right; color: red;" class="fa fa-trash small delete-course"></i>';
				table_str += "</br>";
		   		for (var j = 0; j < courses[i]["meeting_days"].length; ++j) {
		   			
		   			switch(courses[i]["meeting_days"][j]) {
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
	   			table_str += courses[i]["meeting_times"][0] + " to " + courses[i]["meeting_times"][1];
	   			// step_size += courses[i]["meeting_days"].length - 1;
				i += courses[i]["meeting_days"].length - 1;
				
				table_str += "</div>";
			}			   		
			i += 1;
	}
	table_str += "<hr>";
	if (all_courses_online === true) {
		document.querySelector("#pagecodediv").innerHTML = "<br> All of the courses for the selected semester are all online and do not have a meeting time.<br><br> Please select a different semester and return to this page to continue.";
		document.querySelector('#import-button').remove();
		document.querySelector('#export-ics-button').remove();
	} else {
		document.getElementById("schedule").innerHTML = table_str;
	}
}

function remove_course(id) {
	courses = courses.filter(function(obj) {
		return obj.id !== id;
	});
	if (courses.length <= 0) {
		document.querySelector("#pagecodediv").innerHTML = "<br> There are no courses left to import/export, Please try again.";
		document.querySelector('#import-button').remove();
		document.querySelector('#export-ics-button').remove();
	}
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
  document.querySelector('#export-ics-button').className += " disabled";
  var pagecodediv = document.querySelector('#pagecodediv');
  pagecodediv.innerHTML = 'Importing your schedule...';
  if (all_courses_online(courseEventInfo) === true)
  {
      pagecodediv.innerHTML = "<br>All of the courses for the selected semester are all online and do not have meeting times, Please select a semester that has at least one course with a meeting time and return to this page.";
      document.querySelector('#import-button').remove();
      document.querySelector('#export-ics-button').remove();
      return;
  }
  chrome.identity.getAuthToken({
    'interactive': true
  }, function (token) {
    // Use the token.
    console.log(token);
    // POST request to create a new calendar
    var url = "https://www.googleapis.com/calendar/v3/calendars";
    var params = {
      "summary": viewedSemester + " Schedule",
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
          document.querySelector('#export-ics-button').remove();
          importEvents(newCalId, token, courseEventInfo, semEndDate);
        } else {
          console.log("Error", xhr.statusText);
          pagecodediv.innerHTML = 'Uh Oh! Something went wrong...Sorry about the inconvenience! Feel free to shoot abelweldaregay@gmail.com an email so we know we\'re down!<br>';
          pagecodediv.innerHTML += "In the meantime, you can export your schedule as a .ics file and <a href='https://calendar.google.com/calendar/r/settings/export'>upload it to Google Calendar yourself</a>! Make sure to create a new empty calendar to upload to if you prefer your course schedule in its own separate calendar.";
          document.querySelector('#export-ics-button').className = "btn accent-4";
    
        }
      }
    }

    xhr.send(JSON.stringify(params));
  });
}

function all_courses_online(courseEventInfo) {
	var all_courses_online = true;
	for (var i = 0; i < courseEventInfo.length; i++) {
		var course = courseEventInfo[i];
		if (course.meeting_times === "Online" || course.meeting_times === undefined)
			continue;
		all_courses_online = false;
	}

	return all_courses_online;
}

/**
 * Similar to #importEvents, but instead of POSTing to Google Calendar, writes to an .ics file
 * @param {*} courseEventInfo
 * @param {*} viewedSemeseter
 * @param {*} semEndDate
 */
async function exportScheduleToIcs(courseEventInfo, viewedSemester, semEndDate) {
  // Initialize ics.js
  var cal = ics();

  var semEndDateParam = new Date(semEndDate);
  semEndDateParam.setDate(semEndDateParam.getDate() + 1);

  rrule = {
    freq: 'WEEKLY',
    until: semEndDateParam.toJSON(),
    // TODO: consider using byday property to only store each course as one event.
  };

  for (var i = 0; i < courseEventInfo.length; i++) {
    var course = courseEventInfo[i];
    if (course.meeting_times === "Online" || course.meeting_times === undefined)
    	continue;
	var classStartDate = new Date(new Date(course.meeting_window[0]));
	var classEndDate = new Date(new Date(course.meeting_window[0]));
	
	await adjust_datetime(course, classStartDate, classEndDate);
	
    const summary = course.course_title;
    const description = "CRN: " + course.course_crn + "<br>" + "Room: " + course.meeting_room + "<br>" + "Instructor: " + course.instructor_name;
    const location = course.meeting_building;
    const begin = classStartDate.toJSON();
    const end = classEndDate.toJSON();
    cal.addEvent(summary, description, location, begin, end, rrule)
  }

  const filename = viewedSemester;
  cal.download(filename);
    ga("send", "event", "Export", "Click", "Export Schedule");
}

function delete_course(course_id) {
	alert(course_id);
}

function adjust_datetime(course, classStartDate, classEndDate) {
	var semFirstDay = new Date(course.meeting_window[0]);
	semFirstDay = semFirstDay.getDay();	
	var classStartDay = 0;

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
}


async function importEvents(calId, token, courseEventInfo, semEndDate) {
  var semEndDateParam = new Date(semEndDate);

  semEndDateParam.setDate(semEndDateParam.getDate() + 1);
  semEndDateParamStr = semEndDateParam.toJSON().substr(0, 4) + semEndDateParam.toJSON().substr(5, 2) + semEndDateParam.toJSON().substr(8, 2);
  var postImportActionsCalled = false;
  var all_courses_online = true;

  for (var i = 0; i < courseEventInfo.length; i++) {
    // POST request to create a new event
    var url = "https://www.googleapis.com/calendar/v3/calendars/" + calId + "/events";

    var course = courseEventInfo[i];
    
    if (course.meeting_times === "Online" || course.meeting_times === undefined)
    	continue;
	
	var classStartDate = new Date(new Date(course.meeting_window[0]));
	var classEndDate = new Date(new Date(course.meeting_window[0]));
 	
 	await adjust_datetime(course, classStartDate, classEndDate);

    var params = {
      "summary": course.course_title,
      "location": course.meeting_building,
      "description": "CRN: " + course.course_crn + "<br>" + "Room: " + course.meeting_room + "Instructor: " + course.instructor_name,
      "colorId"	: course.group,
      "start": {
        "dateTime": classStartDate.toJSON(),
        "timeZone": "America/New_York"
      },
      "end": {
        "dateTime": classEndDate.toJSON(),
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
        postImportActions();
        postImportActionsCalled = true;
      }
    }

    xhr.send(JSON.stringify(params));
  }
}

// After schedule has been imported
function postImportActions() {
  ga("send", "event", "Import", "Click", "Import Schedule");
  window.open('https://calendar.google.com/calendar/render#main_7%7Cmonth', '_blank');
}