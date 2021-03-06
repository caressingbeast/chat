// app/routes.js

var path = require('path');

module.exports = function (app) {

  app.get('/serverRefresh', function (req, res) {
    return res.send('serverRefreshed');
  });

  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });
};
