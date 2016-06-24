var Twitter = require('twitter');
var path = require('path');
var logger = require('morgan');
var http = require('http');
var express = require('express');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8081);

var client = new Twitter({
  consumer_key: 'Z3l6qHYcoJAhOdSX2Zl0diqKE',
  consumer_secret: 'e0QeWBpjqqNHK2aYzOp7xo7ycNQ5SuxaDbb5gebmio5ztF9e9M',
  access_token_key: '100045875-5VX8m2pGauvAe2COBrV7EY8m16HDA5Ek0ARoTVva',
  access_token_secret: 'PZPgo8BzlahVQoBBlS7TlOHdq4SMrTo9zin3Fu4zp5d6X'
});
var stream = null;

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
  res.render('index.pug', {});
});

//Create web sockets connection.
io.on('connection', function(socket) {

  socket.on("start tweets", function() {

    if (stream === null) {
      //Connect to twitter stream passing in filter for entire world.
      stream = client.stream('statuses/filter', {
        'locations':'-180,-90,180,90'
      });

      stream.on('data', function(tweet) {
        // Does the JSON result have coordinates
        if (tweet.coordinates) {
          //If so then build up some nice json and send out to web sockets
          var outputPoint = {
            "lat": tweet.coordinates.coordinates[0],
            "lng": tweet.coordinates.coordinates[1]
          };

          //console.log(tweet.text);
          //Send out to web sockets channel.
          socket.emit('twitter-stream', outputPoint);
        }
      });
    }
  });

  // Emits signal to the client telling them that the
  // they are connected and can start receiving Tweets
  socket.emit("connected");

});
