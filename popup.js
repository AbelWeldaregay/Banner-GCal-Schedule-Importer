chrome.storage.local.get("prefs", function(data) {
	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
	    let url = tabs[0].url;
	   	if (data.prefs == "import" && url.indexOf("StudentRegistrationSsb") > -1) {
	   		document.getElementById("redirect-button").textContent = "Import Schedule";
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
