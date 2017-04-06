describe('ChatCtrl', function () {

  beforeEach(module('chat'));

  // placeholders
  var $controller;
  var $scope;

  // mocks
  var SocketService = {
    on: function () {},
    emit: function () {}
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

      // focuses on messages input
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
      expect(SocketService.emit).toHaveBeenCalledWith('sendMessage', message);
    });
  });
});
