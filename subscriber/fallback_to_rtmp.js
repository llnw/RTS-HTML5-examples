var shortname = '<limelight account name (aka shortname)>';
var streamname= '<stream name>'
var sdk_rootpath= 'https://<***limelight account name (aka shortname)***>.rts.llnwi.net/realtime-streaming/current/llnw-rts/';


var llnwSubscriber = new llnwrtssdk.LLNWRTSSubscriber();

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
		           
               
    llnwSubscriber
        .setPlaybackOrder(['rtc','rtmp'])
        .init({
      rtc: {
        protocol: 'wss',
        host: sm_edge_config[endpoint].hostname,
        port: 8083,
        app: sm_edge_config[endpoint].scope,
        streamName: sm_edge_config[endpoint].name,
        rtcConfiguration: {
          iceServers: [{urls: 'stun:stun2.l.google.com:19302'}]
        }, 
        mediaElementId: 'limelightlive-subscriber'
      },    
            
      
      rtmp: {
        protocol: 'rtmp',
        port: 1935,
        host: sm_edge_config[endpoint].hostname,
        app: sm_edge_config[endpoint].scope,
        streamName: sm_edge_config[endpoint].name,
        swf: sdk_rootpath + 'llnw-rts-subscriber.swf',
        swfobjectURL: sdk_rootpath + 'swfobject.js',
        productInstallURL: sdk_rootpath + 'playerProductInstall.swf',
        minFlashVersion: '10.0.0',
        buffer: 1,
        width: 640,
        height: 480,
        embedWidth: '100%',
        embedHeight: '100%',
        mediaElementId: 'limelightlive-subscriber'
      }
		})
		    .then(function (llnwSubscriber) {
          console.log('Subscribing!');
					
			return llnwSubscriber.subscribe();
		    })
		    .then(function (llnwSubscriber) {
          console.log('Playing!');

		    })
		    .catch(function (err) {
          console.log('Could not play: ' + err);
		    });
    }
	
	get_edge_from_sm()
	    .then(subscribe);
	    

}(window.llnwrtssdk));
