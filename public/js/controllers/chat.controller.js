(function() {
  'use strict';

  function ChatCtrl ($http, $timeout, SocketService) {
    var vm = this;

    vm.formData = {
      message: '',
      username: ''
    };
    vm.messages = [];
    vm.username = '';
    vm.users = [];

    var baseTitle = 'YakYak';
    var focused = true;
    var missedMessages = 0;

    function updatePageTitle (useBase) {
      var title = useBase ? baseTitle : 'YakYak (' + missedMessages + ' new)';

      window.document.tite = title;

      setTimeout(function () {
        document.title = title;
      }, 100);
    }

    // keep track of window focus status
    $(window).on('focus', function () {
      focused = true;
      missedMessages = 0;
      updatePageTitle(true);
    });

    $(window).on('blur', function () {
      focused = false;
    });

    vm.saveUsername = function () {
      if (!vm.formData.username) {
        return false;
      }

      var isDuplicate = vm.users.filter(function (u) {
        if (u === vm.formData.username) {
          return u;
        }
      }).length;

      if (isDuplicate) {
        return false;
      }

      SocketService.emit('saveUsername', vm.formData.username);

      vm.username = vm.formData.username;
      vm.formData.username = '';

      $timeout(function () {
        $('input.send-message').focus();
      }, 0, false);
    };

    vm.sendMessage = function () {
      if (!vm.formData.message) {
        return false;
      }

      // create message
      var message = {
        text: vm.formData.message,
        user: vm.username,
        created_at: new Date()
      };

      // emit action
      SocketService.emit('sendMessage', message);

      // clear form
      vm.formData.message = '';
    };

    SocketService.on('loadData', function (data) {
      vm.messages = data.messages;
      vm.users = data.users;
    });

    SocketService.on('pushUser', function (data) {
      vm.messages.push(data.message);
      vm.users.push(data.username);
    });

    SocketService.on('pushMessage', function (message) {
      vm.messages.push(message);

      $timeout(function () {
        var $list = $('.messages-container');
        $list.scrollTop($list[0].scrollHeight);
      }, 0, false);

      if (!focused) {
        missedMessages++;
        updatePageTitle();
      }
    });

    SocketService.on('pullUser', function (data) {
      var index = vm.users.indexOf(data.username);

      vm.messages.push(data.message);
      vm.users.splice(index, 1);
    });

    SocketService.on('socketRefresh', function () {
      $http.get('/serverRefresh')
        .then(function (res) {
          SocketService.emit(res.data);
        }, function (err) {
          console.log(err);
        });
    });
  }

  angular.module('chat')
    .controller('ChatCtrl', ChatCtrl);
}());
