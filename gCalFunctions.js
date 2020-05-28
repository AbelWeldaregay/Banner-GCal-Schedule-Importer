

var clientId = '602578747140-lur38jmot2nb3ru6b60bisn6naegatln.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/calendar"];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  console.log("checkAuth()");
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  console.log("handleAuthResult()");  
  console.log("authResult: " + authResult);
  if (authResult && !authResult.error) {
    console.log("AUTHORIZED");

    // Create new UMD Calendar
    newCalId = gapi.client.load('calendar', 'v3', createCalendar);
    console.log("newCalId: " + newCalId);

    // createEvents(calId, courseEventInfo);   // Populate with events
  } else {  // Need to reauthorize GCal
    console.log("NOT AUTHORIZED");
    // TODO reauth GCal -- loop?
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 */
function handleAuthClick() {
  console.log("handleAuthClick()");
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  console.log("after handleAuthClick(), before return false");
  return false;
  // return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function callListUpcomingEvents() {
  gapi.client.load('calendar', 'v3', listUpcomingEvents);
}

function callCreateCalendar() {
  return gapi.client.load('calendar', 'v3', createCalendar);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
  var request = gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  });

  request.execute(function(resp) {
    var events = resp.items;
    // appendPre('Upcoming events:');

    if (events.length > 0) {
      for (i = 0; i < events.length; i++) {
        var event = events[i];
        var when = event.start.dateTime;
        if (!when) {
          when = event.start.date;
        }
        // appendPre(event.summary + ' (' + when + ')')
      }
    } else {
      // appendPre('No upcoming events found.');
    }

  });
}

function createCalendar() {
  console.log("In createCalendar()");
  var request = gapi.client.calendar.calendars.insert({
    'summary': 'ODU Schedule',
    'timezone': 'America/New_York'
  });
  
  console.log("All calendars: " + gapi.client.calendar.calendars);

  request.execute(function(resp) {
    console.log(resp);
    newCalId = resp.id  // global scope to hack around nonaccessible return value
    return(newCalId);   // return newly created GCal ID
  });
  console.log("Executed request in createCalendar()");
}

function createEvents(calId, eventData) {
  var event = {
    'summary': 'Course Number',
    'location': 'Room Number',
    'description': 'Description',
    'start': {
      // get start date of semester programatically
      'dateTime': '2016-12-30T11:00:00',
      'timeZone': 'America/New_York'
    },
    'end': {
      'dateTime': '2016-12-30T12:15:00',
      'timeZone': 'America/New_York'
    }
  };

  var request = gapi.client.calendar.events.insert({
    'calendarId': calId,
    'resource': event
  });

  request.execute(function(event) {
    // appendPre('Event created: ' + event.htmlLink);
  });
}