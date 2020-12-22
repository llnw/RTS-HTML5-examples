
(function(llnwrtssdk) {
  'use strict';
 
  console.log('Starting!');

  var host = '<host>';
  var shortName = '<limelight account name (aka shortname)>';
  var streamName = '<stream name>';
  var mvsecret = '<secret>';

  var validation_url_string = llnwrtssdk.buildValidationURL({
    shortName: shortName,
    streamName: streamName,
    secret: mvsecret,
    params: '',
  });

  var subscriber = new llnwrtssdk.Subscriber();
		           
  var subscribe_config = {
    mediaElement: document.getElementById('limelightlive-subscriber'),
    encodedURL: validation_url_string,
    host: host,
    streamName: streamName,
    shortName: shortName,
  };

  subscriber.init(subscribe_config)
      .then(function () {
        console.log('Subscribing!');
    
        return subscriber.subscribe()
          .then(function () {
            console.log('Playing!');
        })
        .catch(function (err) {
          console.log('Could not play: ' + err);
        });
  });


}(window.llnwrtssdk));


