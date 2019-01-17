var shortname = '<limelight account name (aka shortname)>';
var streamname= '<stream name>'

var rtcSubscriber = new llnwrtssdk.RTCSubscriber();

// subscribe to events
rtcSubscriber.on('*',handleSubscriberEvent);

llnwrtssdk.setLogLevel('debug');

// shared objects initalization
var so
var hasRegistered = false;
var connections = 0;

(function(llnwrtssdk) {
  'use strict';
 
  console.log('Starting!');

	function get_edge_from_sm () {
		// specify 'endpoints=2' to get primary and backup edge nodes
		var url = 'https://' + 'rts-sm-default' + '.rts.llnwi.net/streammanager/api/3.1/event/limelightlive/' + shortname + '/' + streamname + '?action=subscribe&endpoints=1';
		
		return new Promise(function(resolve, reject) {
		    fetch(url, {'redirect': 'follow'})
		       .then(function (res) {
				if (res.headers.get("content-type") &&
				    res.headers.get("content-type").toLowerCase().indexOf("application/json") >= 0) {
					console.log("yeah")
					return res.json();
				} else {
					throw new TypeError('Could not properly parse response.');
				}
			})
			.then(function(json) {
				resolve(json)	
			})
			.catch(function (error) {
				reject(error)
			});
		});
	}

    function subscribe (sm_edge_config) {

		// when specifying 'endpoints' as a query parameter, the resultant json will be an array with zero based indexing
		// there's no predefined 'primary' or 'backup' edge, so use zero indexed as your primary and one indexed as your backup
    var endpoint = 0;
		           
		var subscribe_config = {
			protocol: 'wss',
			host: sm_edge_config[endpoint].hostname,
			port: 8083,
			app: sm_edge_config[endpoint].scope,
			streamName: sm_edge_config[endpoint].name,
			iceServers: [{urls: 'stun:stun2.l.google.com:19302'}],
			bandwidth: {
				audio: 56,
				video: 512
			},
			mediaElementId: 'limelightlive-subscriber',
			subscriptionId: sm_edge_config[endpoint].name + Math.floor(Math.random() * 0x10000).toString(16)
		};
		rtcSubscriber.init(subscribe_config)
		    .then(function () {
          console.log('Subscribing!');
			
			so = new llnwrtssdk.LLNWRTSSharedObject('sharedObjectTest', rtcSubscriber);
			so.on('*', handleSharedObjectEvents);
			
			return rtcSubscriber.subscribe();
		    })
		    .then(function () {
          console.log('Playing!');

		    })
		    .catch(function (err) {
          console.log('Could not play: ' + err);
		    });
    }
	
	get_edge_from_sm()
	    .then(subscribe);
	    

}(window.llnwrtssdk));

function configs() {
    console.log(rtcSubscriber.getOptions())
}

//---------------------------------------------------------------------------
function handleSubscriberEvent (event) {
  // The name of the event:
  var type = event.type;
  // The dispatching publisher instance:
  var subscriber = event.subscriber;
  // Optional data releated to the event (not available on all events):
  var data = event.data;
    
  console.log(type);
  //based on the type of event .. you may want to look further into subsriver/data objects
  document.getElementById("countpeople").innerHTML = connections;
}

//---------------------------------------------------------------------------
function handleSharedObjectEvents(event) {
  // The name of the event:
  var type = event.type;
  // The dispatching publisher instance:
  var subscriber = event.subscriber;
  // Optional data releated to the event (not available on all events):
  var data = event.data;
  
  console.log(type)
  
  if (event.data.hasOwnProperty('count')) {
	console.log("User count: " + event.data.count);
	document.getElementById("countpeople").innerHTML = event.data.count;
	connections = event.data.count;
	if (!hasRegistered) {
		hasRegistered = true;
		so.setProperty('count', parseInt(event.data.count) + 1);
	}
  }
  else if (!hasRegistered) {
    hasRegistered = true;
    so.setProperty('count',1);
  }
}
