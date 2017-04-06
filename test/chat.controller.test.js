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
    console.log(_$controller_);
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
});
