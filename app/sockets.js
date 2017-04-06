// app/sockets.js

module.exports = function (io) {
  var messages = [];
  var users = [];

  io.sockets.on('connection', function (socket) {
    var username;

    // populate initial data for new user
    socket.emit('loadData', {
      messages: messages,
      users: users,
    });

    socket.on('socketRefreshed', function () {
      // do nothing, keep socket alive
    });

    // receive and broadcast a new user
    socket.on('saveUsername', function (clientUsername) {
      var message = {
        isServer: true,
        text: clientUsername + ' has joined.'
      };

      messages.push(message);
      users.push(clientUsername);
      username = clientUsername;

      io.sockets.emit('pushUser', {
        message: message,
        username: clientUsername
      });
    });

    // receive and broadcast a new message
    socket.on('sendMessage', function (message) {
      messages.push(message);
      io.sockets.emit('pushMessage', message);
    });

    socket.on('disconnect', function () {
      if (!username) {
        return false;
      }

      var index = users.indexOf(username);
      var message = {
        isServer: true,
        text: username + ' has left.'
      };

      messages.push(message);
      users.splice(index, 1);

      io.sockets.emit('pullUser', {
        message: message,
        username: username
      });

      if (!users.length) {
        messages = [];
        users = [];
      }
    });
  });

  // ping sockets to keep connections open
  setInterval(function () {
    io.sockets.emit('socketRefresh');
  }, 15000);
};
