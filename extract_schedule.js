extract_schedule();
function extract_schedule() {
	console.log("extract_schedule invoked");
	var schedule_wrappers = document.getElementById("scheduleListViewWrapper");
	var child_divs = schedule_wrappers.getElementsByTagName("div")[0].getElementsByClassName("listViewWrapper");
	var selected_semester = document.getElementsByClassName("select2-chosen")[0].innerText.trim();
	var schedule = [];
	var table = [];
	var course_names = document.getElementById("table1").getElementsByTagName("tr");
	var schedule_details_not_selected = document.getElementById("scheduleCalViewLink").parentElement.className.split(' ').indexOf("ui-tabs-selected")>=0;
	var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	// var meeting_info = child_divs.scheduleListView.getElementsByClassName("listViewMeetingInformation");
	if (schedule_details_not_selected)
	{
	   	chrome.runtime.sendMessage({
        data: "schedule_details_not_selected"
    	}, function (response) {
        	console.dir(response);
	    });
	} else {
			for (var i = 0; i < child_divs.length; ++i) {
		var meeting_days = child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByClassName("ui-pillbox-summary")[0].innerText.split(",");
		if (meeting_days[0] === "None") {
			schedule.push({
				 "course_title"	    : course_names[i+1].getElementsByTagName("td")[1].innerText.substring(0, course_names[i+1].getElementsByTagName("td")[1].innerText.indexOf(",")),
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
			if (child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].innerHTML.split("<br>").length > 2) {
				var sub_courses_length = child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByClassName("list-view-pillbox").length;
				for (var x = 0; x < sub_courses_length; ++x) {
					var meeting_days = child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByClassName("list-view-pillbox")[x].innerText.split("\n")[0].split(",");
					var meeting_room = child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].innerHTML.split("<br>")[x].substr(-4).replace(/\D/g, "");
					for (var j = 0; j < meeting_days.length; ++j) {
						schedule.push({
							 "course_title"	    : course_names[i+1].getElementsByTagName("td")[1].innerText.substring(0, course_names[i+1].getElementsByTagName("td")[1].innerText.indexOf(",")),
							 "instructor_name"  : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[0].split(":")[1],
							 "course_crn"       : child_divs[i].getElementsByClassName("listViewInstructorInformation")[0].innerText.split("\n")[1].split(":")[1],
				 			 "meeting_window"   : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[0].innerText.replace(/\s/g,'').split("--"),
							 "meeting_days"     : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByClassName("ui-pillbox-summary")[0].innerText.split(","),
							 "meeting_times"    : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].getElementsByTagName("span")[2].innerText.replace(/\s/g,'').split("-"),
							 "meeting_building" : child_divs[i].getElementsByClassName("listViewMeetingInformation")[0].innerText.split(":")[5].replace("Room","").trim(),
							 "meeting_room"     : meeting_room,
							 "course_type"	    : "In-Person",
							 "selected_semester": selected_semester,
							 "meeting_day"		: meeting_days[j]
						});
					}
				}
			} else {
				for (var k = 0; k < meeting_days.length; ++k) {
			
					schedule.push({
						 "course_title"	   : course_names[i+1].getElementsByTagName("td")[1].innerText.substring(0, course_names[i+1].getElementsByTagName("td")[1].innerText.indexOf(",")),
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
			}

		}
	   	if (i == child_divs.length - 1) {
		   	chrome.runtime.sendMessage({
                    data: schedule
                }, function (response) {
                    console.dir(response);
    			    });
	   	}
	}
	}

}
