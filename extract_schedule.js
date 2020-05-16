var schedule_wrappers = document.getElementById("scheduleListViewWrapper");
var child_divs = schedule_wrappers.getElementsByTagName("div");
var schedule = [];
var meeting_info = child_divs.scheduleListView.getElementsByClassName("listViewMeetingInformation");
for (var i = 0; i < child_divs.length - 1; ++i) {
	
	// var instructor_name = child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[0].split(":")[1];
	// var course_crn = child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[1].split(":")[1];
	var meeting_window = meeting_info[i].getElementsByTagName("span")[0].innerText.replace(/\s/g,'').split("--");
	var meeting_days = meeting_info[i].getElementsByClassName("ui-pillbox-summary")[0].innerHTML.split(",");
	var meeting_times = meeting_info[i].getElementsByTagName("span")[2].innerText.replace(/\s/g,'').split("-");
	var meeting_building = meeting_info[0].innerText.split(":")[5];
	var meeting_room = meeting_info[0].innerText.split(":")[6];

	schedule.push({

		 "instructor_name" : child_divs[0].getElementsByClassName("listViewInstructorInformation")[i].innerText.split("\n")[0].split(":")[1],
		 "course_crn"      : child_divs[0].getElementsByClassName("listViewInstructorInformation")[i].innerText.split("\n")[1].split(":")[1],
		 "meeting_window"  : meeting_info[i].getElementsByTagName("span")[0].innerText.replace(/\s/g,'').split("--"),
		 "meeting_days"    : meeting_info[i].getElementsByClassName("ui-pillbox-summary")[0].innerHTML.split(","),
		 "meeting_times"   : meeting_info[i].getElementsByTagName("span")[2].innerText.replace(/\s/g,'').split("-"),
		 "meeting_building": meeting_info[i].innerText.split(":")[5],
		 "meeting_room"    : meeting_info[i].innerText.split(":")[6]
	});
	console.log(schedule);

}
