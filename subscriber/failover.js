var shortname = '<limelight account name (aka shortname)>';
var streamname= '<stream name>'
var default_sm= 'rts-sm-default.rts.llnwi.net' ; 

var rtcSubscriberPrimary;
var rtcSubscriberBackup;
var global_sm_edge_config;

llnwrtssdk.setLogLevel('debug');


//-----------------------------------------------------------------
(function(llnwrtssdk) {
  'use strict';
 
  console.log('Starting!');
  
  rtcSubscriberPrimary = new llnwrtssdk.RTCSubscriber();
  rtcSubscriberBackup  = new llnwrtssdk.RTCSubscriber();
  
  get_edge_from_sm()
	    .then(subscribe);
        
}(window.llnwrtssdk));

//-----------------------------------------------------------------
function get_edge_from_sm () {
		// specify 'endpoints=2' to get primary and backup edge nodes
		var url = 'https://' + default_sm + '/streammanager/api/3.1/event/limelightlive/' + shortname + '/' + streamname + '?action=subscribe&endpoints=2';
 
		console.log("URL:"+url);
    
		return new Promise(function(resolve, reject) {
		    fetch(url, {'redirect': 'follow'})
		       .then(function (res) {
				if (res.headers.get("content-type") &&
				    res.headers.get("content-type").toLowerCase().indexOf("application/json") >= 0) {
					console.log("yeah");
					return res.json();
				} else {
					throw new TypeError('Could not properly parse response.');
				}
			})
			.then(function(json) {
				resolve(json);	
			})
			.catch(function (error) {
				reject(error);
			});
		});
	}
    
    
//-----------------------------------------------------------------
function connect_to_edge(rtcSubscriber, sm_edge_config, endpoint) {
    
      edge_host = sm_edge_config[endpoint].hostname; 
    
      var mediaElementId_value = 'limelightlive-subscriber';

      var subscribe_config = {
        protocol: 'wss',
        host: edge_host,
        port: 443,
        app: sm_edge_config[endpoint].scope,
        streamName: sm_edge_config[endpoint].name,
        iceServers: [{urls: 'stun:stun2.l.google.com:19302'}],
        bandwidth: {
          audio: 56,
          video: 512
        },
        mediaElementId: mediaElementId_value, 
        subscriptionId: sm_edge_config[endpoint].name + Math.floor(Math.random() * 0x10000).toString(16),
      };
      console.log("Host="+sm_edge_config[endpoint].hostname+" name="+sm_edge_config[endpoint].name + " scope=" + sm_edge_config[endpoint].scope);
    
      rtcSubscriber.init(subscribe_config)
          .then(function () { 

            return rtcSubscriber.subscribe();
          })
          .then(function () {
            console.log('Playing!');

          })
          .catch(function (err) {
            console.log('Could not play: ' + err);
          });
    }
  
//-----------------------------------------------------------------  
function subscribe (sm_edge_config) {

		// when specifying 'endpoints' as a query parameter, the resultant json will be an array with zero based indexing
		// there's no predefined 'primary' or 'backup' edge, so use zero indexed as your primary and one indexed as your backup
    
      global_sm_edge_config = sm_edge_config;
      
      connect_to_edge(rtcSubscriberPrimary,sm_edge_config,0);
      
      // subscribe to events
      rtcSubscriberPrimary.on('*',handleSubscriberEvent);
      
      console.log("Primary Host : " + sm_edge_config[0].hostname);
      console.log("Backup Host : " + sm_edge_config[1].hostname);
      
    }
    
//-----------------------------------------------------------------
function handleSubscriberEvent (event) {
  // The name of the event:
  var type = event.type;
  // The dispatching publisher instance:
  var subscriber = event.subscriber;
  // Optional data releated to the event (not available on all events):
  var data = event.data;
  
     
  if (type == "Subscribe.Connection.Closed")
  {
    console.log(">> Subscribe.Connection.Closed <<");
    connect_to_edge(rtcSubscriberBackup,global_sm_edge_config,1);
    rtcSubscriberBackup.on('*',handleSubscriberEvent);
  }
  
}

