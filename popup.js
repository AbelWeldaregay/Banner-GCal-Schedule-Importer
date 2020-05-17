chrome.storage.local.get("prefs", function(data) {
	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
	    let url = tabs[0].url;
	   	if (data.prefs == "import" && url.indexOf("StudentRegistrationSsb") > -1) {
	   		// opens a communication between scripts
	   		document.getElementById("banner-example-image").style.display = "none";
	   		chrome.storage.local.get("schedule", function(schedule) {
	   			for (var i = 0; i < schedule["schedule"].length; ++i) {
		   			console.log(schedule["schedule"][0]["instructor_name"]);
		   			console.log(schedule["schedule"][0]["course_crn"]);
		   			console.log(schedule["schedule"][0]["course_title"]);

		   			console.log(schedule["schedule"][0]["meeting_window"]);
		   			console.log(schedule["schedule"][0]["meeting_days"]);
		   			console.log(schedule["schedule"][0]["meeting_times"]);

		   			console.log(schedule["schedule"][0]["meeting_building"]);
		   			console.log(schedule["schedule"][0]["meeting_room"]);
	   			}

	   		});

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
