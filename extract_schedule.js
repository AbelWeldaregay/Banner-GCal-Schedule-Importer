extract_schedule();
function extract_schedule() {
	console.log("extract_schedule invoked");
	var schedule_wrappers = document.getElementById("scheduleListViewWrapper");
	var child_divs = schedule_wrappers.getElementsByTagName("div")[0].getElementsByClassName("listViewWrapper");
	var schedule = [];
	// var meeting_info = child_divs.scheduleListView.getElementsByClassName("listViewMeetingInformation");
	for (var i = 0; i < child_divs.length; ++i) {
		var meeting_days = child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByClassName("ui-pillbox-summary")[0].innerText.split(",")[0];
		if (meeting_days === "None") {
			schedule.push({
				 "course_title"	   : child_divs[i].getElementsByClassName("list-view-course-title")[0].innerText,
				 "instructor_name" : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[0].split(":")[1],
				 "course_crn"      : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[1].split(":")[1],
	 			 "meeting_window"  : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[0].innerText.replace(/\s/g,'').split("--"),
				 "meeting_days"    : "Online",
				 "meeting_times"   : "Online",
				 "meeting_building": "Online",
				 "meeting_room"    : "Online"
			});
		} else {
			schedule.push({
				 "course_title"	   : child_divs[i].getElementsByClassName("list-view-course-title")[0].innerText,
				 "instructor_name" : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[0].split(":")[1],
				 "course_crn"      : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[1].split(":")[1],
	 			 "meeting_window"  : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[0].innerText.replace(/\s/g,'').split("--"),
				 "meeting_days"    : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByClassName("ui-pillbox-summary")[0].innerText.split(","),
				 "meeting_times"   : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[2].innerText.replace(/\s/g,'').split("-"),
				 "meeting_building": child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].innerText.split(":")[5].replace("Room",""),
				 "meeting_room"    : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].innerText.split(":")[6]
			});
		}
		chrome.storage.local.set({"schedule": schedule}, function() {
	   		console.log("course schedule value set");
	   	});
		console.log("i : " + i  + "length: " + child_divs.length - 1);
	   	if (i == child_divs.length - 1) {
		   	chrome.runtime.sendMessage({
                    data: "Hello popup, how are you"
                }, function (response) {
                    console.dir(response);
    			    });
	   	}
	}
}
