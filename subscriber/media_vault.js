var shortname = '<limelight account name (aka shortname)>';
var streamname= '<stream name>';
var validation_url_string= 'https://subscribe-validator.rts.llnwi.net/<limelight account name (aka shortname)>/auth/v1/<stream name>?<media vault options>';
// Construct the validation_url_string by calculating an MD5 hash from your url string (with MV options) & your secret key.
// Then add the hash to the end using the named query parameter 'h'.
// for example,
// 1. take your validation_url_string : eg.  https://subscribe-validator.rts.llnwi.net/AcmeInc/auth/v1/RoadRunnerChannel
// 2. add MV options : eg. (expires in 2025) https://subscribe-validator.rts.llnwi.net/AcmeInc/auth/v1/RoadRunnerChannel?e=1735689600
// 3. calculate an MD5 hash:   MD5('mySecretKey' + 'https://subscribe-validator.rts.llnwi.net/AcmeInc/auth/v1/RoadRunnerChannel?e=1735689600')  >>  cb5a9a8f4d44bdff472d5a01c491b4c0
// 4. append hash, 'h' to the end:      eg.  https://subscribe-validator.rts.llnwi.net/AcmeInc/auth/v1/RoadRunnerChannel?e=1735689600&h=cb5a9a8f4d44bdff472d5a01c491b4c0


var rtcSubscriber = new llnwrtssdk.RTCSubscriber();

llnwrtssdk.setLogLevel('debug');

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
      connectionParams: {validation_url: validation_url_string},
			mediaElementId: 'limelightlive-subscriber',
			subscriptionId: sm_edge_config[endpoint].name + Math.floor(Math.random() * 0x10000).toString(16)
		};
    
		rtcSubscriber.init(subscribe_config)
		    .then(function () {
          console.log('Subscribing!');
			
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


