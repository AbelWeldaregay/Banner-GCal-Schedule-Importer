extract_schedule();
function extract_schedule() {
	console.log("extract_schedule invoked");
	var schedule_wrappers = document.getElementById("scheduleListViewWrapper");
	var child_divs = schedule_wrappers.getElementsByTagName("div");
	var schedule = [];
	var meeting_info = child_divs.scheduleListView.getElementsByClassName("listViewMeetingInformation");
	for (var i = 0; i < child_divs.length; ++i) {
		schedule.push({
			 "course_title"	   : child_divs[0].getElementsByClassName("list-view-course-title")[i].innerText,
			 "instructor_name" : child_divs[0].getElementsByClassName("listViewInstructorInformation")[i].innerText.split("\n")[0].split(":")[1],
			 "course_crn"      : child_divs[0].getElementsByClassName("listViewInstructorInformation")[i].innerText.split("\n")[1].split(":")[1],
			 "meeting_window"  : meeting_info[i].getElementsByTagName("span")[0].innerText.replace(/\s/g,'').split("--"),
			 "meeting_days"    : meeting_info[i].getElementsByClassName("ui-pillbox-summary")[0].innerHTML.split(","),
			 "meeting_times"   : meeting_info[i].getElementsByTagName("span")[2].innerText.replace(/\s/g,'').split("-"),
			 "meeting_building": meeting_info[i].innerText.split(":")[5],
			 "meeting_room"    : meeting_info[i].innerText.split(":")[6]
		});
		chrome.storage.local.set({"schedule": schedule}, function() {
	   		console.log("course schedule value set");
	   	});
	   	chrome.runtime.sendMessage({
                    data: "Hello popup, how are you"
                }, function (response) {
                    console.dir(response);
        });
	}
}
