chrome.storage.local.get("prefs", function(data) {
	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
	    let url = tabs[0].url;
	   	if (data.prefs == "import" && url.indexOf("StudentRegistrationSsb") > -1) {
	   		document.getElementById("redirect-button").textContent = "Import Schedule";
	   	} else {
	   		// document.getElementById("redirect-button").textContent = "TAKE ME TO THE BANNER!";
	   		// document.getElementById("redirect-button").href = "https://www.google.com";
	   		// chrome.storage.local.set({"prefs": "redirect"}, function() {
	   		// 	console.log("value set");
	   		// });
	   	}
	    // use `url` here inside the callback because it's asynchronous!
	});
});

document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('redirect-button');
    btn.addEventListener('click', function() {
       chrome.storage.local.set({"prefs": "import"}, function() {
       		console.log("value set");
       });
    });
});
