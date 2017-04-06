describe('ChatCtrl', function () {

  beforeEach(module('chat'));

  // placeholders
  var $controller;
  var $scope;

  // mock SocketService
  var SocketService = {
    on: function (event, callback) {
      this[event] = callback;
    },
    emit: function (event, data, callback) {
      if (this[event]) {
        this[event](data);
      }
    }
  };

  beforeEach(inject(function(_$controller_, $rootScope) {
    $scope = $rootScope.$new();

    $controller = _$controller_('ChatCtrl', {
      $scope: $scope,
      SocketService: SocketService
    });

    $scope.$apply();
  }));

  it('should exist', function () {
    expect($controller).toBeDefined();
  });

  it('should show username input by default', function () {
    setTimeout(function () {
      expect($('.send-message').is(':visible')).toBeFalsy();
      expect($('.save-username').is(':visible')).toBeTruthy();
    }, 100);
  });

  it('should show message input if valid username', function () {
    $controller.username = 'username';

    setTimeout(function () {
      expect($('.send-message').is(':visible')).toBeTruthy();
      expect($('.save-username').is(':visible')).toBeFalsy();
    }, 100);
  });

  describe('.saveUsername()', function () {

    it('should do nothing if empty username', function () {
      spyOn(SocketService, 'emit');

      $controller.saveUsername();
      expect(SocketService.emit).not.toHaveBeenCalled();
      expect($controller.username).toEqual('');
    });

    it('should do nothing if duplicate username', function () {
      spyOn(SocketService, 'emit');

      $controller.users = ['duplicate'];
      $controller.formData.username = 'duplicate';

      $controller.saveUsername();
      expect(SocketService.emit).not.toHaveBeenCalled();
      expect($controller.users.length).toEqual(1);
    });

    it('should save username and call SocketService.emit if valid username', function () {
      var username = 'username';

      spyOn(SocketService, 'emit');
      $controller.formData.username = username;

      $controller.saveUsername();
      expect(SocketService.emit).toHaveBeenCalledWith('saveUsername', username);

      // focuses on message field
      setTimeout(function () {
        expect($('input.send-message').is(':focus')).toBeTruthy();
      }, 100);
    });
  });

  describe('.sendMessage()', function () {

    it('should do nothing if empty message', function () {
      spyOn(SocketService, 'emit');
      $controller.sendMessage();
      expect(SocketService.emit).not.toHaveBeenCalled();
    });

    it('should call SocketService.emit if valid message', function () {
      var message = {
        text: 'This is just a test.',
        user: 'username',
        created_at: new Date()
      };

      spyOn(SocketService, 'emit');

      $controller.formData.message = message.text;
      $controller.username = message.user;

      $controller.sendMessage();

      var emit = SocketService.emit.calls.mostRecent();
      var emitMessage = emit.args[1];
      expect(emit.args[0]).toEqual('sendMessage');
      expect(emitMessage.text).toEqual(message.text);
      expect(emitMessage.user).toEqual(message.user);
    });
  });

  describe('SocketService listeners', function () {

    it('listens for "loadData"', function () {
      var data = {
        messages: [
          {
            text: 'text',
            user: 'user',
            created_at: new Date()
          }
        ],
        users: ['user']
      };

      SocketService.emit('loadData', data);

      expect($controller.messages).toEqual(data.messages);
      expect($controller.users).toEqual(data.users);
    });

    it('listens for "pushUser"', function () {
      var data = {
        message: [
          {
            isServer: true,
            text: 'user has joined.'
          }
        ],
        username: 'user'
      };

      SocketService.emit('pushUser', data);

      expect($controller.messages.length).toEqual(1);
      expect($controller.messages[0]).toEqual(data.message);
      expect($controller.users.length).toEqual(1);
      expect($controller.users[0]).toEqual(data.username);
    });

    it('listens for "pushMessage"', function () {
      var message = {
        text: 'text',
        user: 'user',
        created_at: new Date()
      };

      SocketService.emit('pushMessage', message);
      SocketService.emit('pushMessage', message);

      expect($controller.messages.length).toEqual(2);
      expect($controller.messages[0]).toEqual(message);
    });

    it('listens for "pullUser"', function () {
      var username = 'frank';
      var message = {
        isServer: true,
        text: username + ' has left.'
      };

      $controller.users = ['brandon', username];

      SocketService.emit('pullUser', {
        message: message,
        username: username
      });

      expect($controller.messages.length).toEqual(1);
      expect($controller.users.length).toEqual(1);
      expect($controller.users.indexOf(username)).toEqual(-1);
    });
  });
});
