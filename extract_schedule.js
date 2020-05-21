extract_schedule();
function extract_schedule() {
	console.log("extract_schedule invoked");
	var schedule_wrappers = document.getElementById("scheduleListViewWrapper");
	var child_divs = schedule_wrappers.getElementsByTagName("div")[0].getElementsByClassName("listViewWrapper");
	var selected_semester = document.getElementsByClassName("select2-hidden-accessible")[0].innerHTML;
	var schedule = [];
	var table = [];
	// var meeting_info = child_divs.scheduleListView.getElementsByClassName("listViewMeetingInformation");
	for (var i = 0; i < child_divs.length; ++i) {
		var meeting_days = child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByClassName("ui-pillbox-summary")[0].innerText.split(",");
		if (meeting_days[0] === "None") {
			schedule.push({
				 "course_title"	    : child_divs[i].getElementsByClassName("list-view-course-title")[0].innerText,
				 "instructor_name"  : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[0].split(":")[1],
				 "course_crn"       : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[1].split(":")[1],
	 			 "meeting_window"   : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[0].innerText.replace(/\s/g,'').split("--"),
				 "selected_semester": selected_semester,
				 "meeting_days"     : "Online",
				 "meeting_times"    : "Online",
				 "meeting_building" : "Online",
				 "meeting_room"     : "Online",
				 "course_type"	    : "Online",
				 "meeting_day"		: "Online"
			});
		} else {
			var meeting_window = child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[0].innerText.replace(/\s/g,'').split("--");
			var semFirstDay = new Date(meeting_window[0]);
			semFirstDay = semFirstDay.getDay();	
			var classStartDay = 0;
			var classStartDate = new Date(new Date(meeting_window[0]));
			var classEndDate = new Date(new Date(meeting_window[0]));
			for (var k = 0; k < meeting_days.length; ++k) {
			
				schedule.push({
					 "course_title"	   : child_divs[i].getElementsByClassName("list-view-course-title")[0].innerText,
					 "instructor_name" : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[0].split(":")[1],
					 "course_crn"      : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[1].split(":")[1],
		 			 "meeting_window"  : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[0].innerText.replace(/\s/g,'').split("--"),
					 "meeting_days"    : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByClassName("ui-pillbox-summary")[0].innerText.split(","),
					 "meeting_times"   : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[2].innerText.replace(/\s/g,'').split("-"),
					 "meeting_building": child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].innerText.split(":")[5].replace("Room",""),
					 "meeting_room"    : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].innerText.split(":")[6],
					 "course_type"	   : "In-Person",
					 "selected_semester": selected_semester,
					 "meeting_day"		: meeting_days[k]
				});

			}

			table.push({
				 "course_title"	   : child_divs[i].getElementsByClassName("list-view-course-title")[0].innerText,
				 "instructor_name" : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[0].split(":")[1],
				 "course_crn"      : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[1].split(":")[1],
	 			 "meeting_window"  : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[0].innerText.replace(/\s/g,'').split("--"),
				 "meeting_days"    : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByClassName("ui-pillbox-summary")[0].innerText.split(","),
				 "meeting_times"   : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[2].innerText.replace(/\s/g,'').split("-"),
				 "meeting_building": child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].innerText.split(":")[5].replace("Room",""),
				 "meeting_room"    : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].innerText.split(":")[6],
				 "course_type"	   : "In-Person",
				 "selected_semester": selected_semester
			});


		}
		chrome.storage.local.set({"schedule": schedule}, function() {
	   		console.log("course schedule value set");
	   	});
		chrome.storage.local.set({"table": table}, function() {
	   		console.log("course table value set");
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
