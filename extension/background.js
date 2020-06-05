// opens a communication port
chrome.runtime.onConnect.addListener(function(port) {
	//listen for every message passing through it
	port.onMessage.addListener(function(o) {
		// if the message comes from the popup
		if (o.from && o.from === "popup" && o.start && o.start === "scrap_web") {
			chrome.tabs.executeScript({
				file: "extract_schedule.js"
			});
		}
	});
});