function initMap() {
  var map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: -34.397,
      lng: 150.644
    },
    zoom: 8
  });

  //Setup heat map and link to Twitter array we will append data to
  var heatmap;
  var liveTweets = new google.maps.MVCArray();
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: liveTweets,
    radius: 25
  });
  heatmap.setMap(map);

  if (io !== undefined) {
    // Storage for WebSocket connections
    var socket = io.connect('http://localhost:8081');

    // This listens on the "twitter-steam" channel and data is
    // received everytime a new tweet is receieved.
    socket.on('twitter-stream', function(tweet) {

      //Add tweet to the heat map array.
      var tweetLocation = new google.maps.LatLng(tweet.lng, tweet.lat);
      liveTweets.push(tweetLocation);


      //Flash a dot onto the map quickly
      var image = "small-dot-icon.png";
      var marker = new google.maps.Marker({
        position: tweetLocation,
        map: map,
        icon: image
      });
      setTimeout(function() {
        marker.setMap(null);
      }, 600);

    });

    // Listens for a success response from the server to
    // say the connection was successful.
    socket.on("connected", function(r) {

      //Now that we are connected to the server let's tell
      //the server we are ready to start receiving tweets.
      socket.emit("start tweets");
    });
  }

}
