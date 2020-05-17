var table_str = "";
table_str += "<table>";
table_str += "<p>Here is what I found: </p>";
chrome.storage.local.get("prefs", function(data) {
	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
	    let url = tabs[0].url;
	   	if (data.prefs == "import" && url.indexOf("StudentRegistrationSsb") > -1) {
	   		// opens a communication between scripts
	   		document.getElementById("banner-example-image").style.display = "none";
	   		chrome.storage.local.get("schedule", function(schedule) {
	   			for (var i = 0; i < schedule["schedule"].length; ++i) {
	   				// console.log("i: " + i);
		   			// console.log(schedule["schedule"][0]["instructor_name"]);
		   			// console.log(schedule["schedule"][0]["course_crn"]);
		   			// console.log(schedule["schedule"][0]["course_title"]);

		   			// console.log(schedule["schedule"][0]["meeting_window"]);
		   			// console.log(schedule["schedule"][0]["meeting_days"]);
		   			// console.log(schedule["schedule"][0]["meeting_times"]);

		   			// console.log(schedule["schedule"][0]["meeting_building"]);
		   			// console.log(schedule["schedule"][0]["meeting_room"]);
			   		table_str += "<tr>";
			   		table_str += "<td>"+schedule["schedule"][i]["course_title"]+ "(CRN: " + schedule["schedule"][i]["course_crn"] + ")" + "</td>";
			   		table_str += "</br>";
			   		table_str += "<td>" + schedule["schedule"][i]["meeting_building"] + " "+ schedule["schedule"][i]["meeting_room"] + "</td>";
			   		table_str += "</br>";
			   		table_str += "<td>";
			   		for (var j = 0; j < schedule["schedule"][i]["meeting_days"].length; ++j) {
			   			table_str += schedule["schedule"][i]["meeting_days"][j] + ", ";
			   		}

					table_str += schedule["schedule"][i]["meeting_times"][0] + " to " + schedule["schedule"][i]["meeting_times"][1];			   		
			   		table_str += "</tr>";
			   		table_str += "</br>";
			   		table_str += "</br>";
	   				if (i == 7) {
				   		document.getElementById("schedule").innerHTML += table_str;
	   				}
	   			}

	   		});
	   		table_str += "</table>";
	   		var port = chrome.runtime.connect();
	   		
	   		document.getElementById("redirect-button").textContent = "Import Schedule";
	   		var container = document.getElementById("scheduleListViewWrapper");
	   		
	   		port.postMessage({
	   			"from": "popup",
	   			"start": "scrap_web"
	   		});
	   	} else {
	   		document.getElementById("banner-example-image").style.display = "block";
	   	}
	    // use `url` here inside the callback because it's asynchronous!
	});
});

document.addEventListener('DOMContentLoaded', function () {
    var banner_btn = document.getElementById('redirect-button');
    banner_btn.addEventListener('click', function() {
       chrome.storage.local.set({"prefs": "import"}, function() {
       		console.log("value set");
       });
    });
});
