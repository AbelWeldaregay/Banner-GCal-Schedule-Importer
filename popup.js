
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
	   		document.getElementById("redirect-button").textContent = "Import Schedule";
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
	chrome.storage.local.get("schedule", function(schedule) {
		for (var i = 0; i < schedule["schedule"].length; ++i) {
	   		table_str += "<tr>";
	   		table_str += "<td>"+schedule["schedule"][i]["course_title"]+ "(CRN: " + schedule["schedule"][i]["course_crn"] + ")" + "</td>";
	   		table_str += "</br>";
	   		
	   		if (schedule["schedule"][i]["meeting_times"] === "Online") {
	   			table_str += "Online"
	   		} else {
	   			table_str += "<td>" + schedule["schedule"][i]["meeting_building"] + " "+ schedule["schedule"][i]["meeting_room"] + "</td>";
		   		table_str += "</br>";
		   		table_str += "<td>";
		   		for (var j = 0; j < schedule["schedule"][i]["meeting_days"].length; ++j) {
		   			table_str += schedule["schedule"][i]["meeting_days"][j] + ", ";
		   		}
	   			table_str += schedule["schedule"][i]["meeting_times"][0] + " to " + schedule["schedule"][i]["meeting_times"][1];
	   		}			   		
	   		table_str += "</tr>";
	   		table_str += "</br>";
	   		table_str += "</br>";
			if (i == schedule["schedule"].length - 1) {
	   			document.getElementById("schedule").innerHTML += table_str;
			}
		}

	});
	table_str += "</table>";

	chrome.identity.getAuthToken({"interactive": true}, function (token) {
		if (token == null) {
			console.log("its null");
		} else {
			console.log(token);
		}
	})


}

document.addEventListener('DOMContentLoaded', function () {
    var banner_btn = document.getElementById('redirect-button');
    banner_btn.addEventListener('click', function() {
       chrome.storage.local.set({"prefs": "import"}, function() {
       		console.log("value set");
       });
    });
});
