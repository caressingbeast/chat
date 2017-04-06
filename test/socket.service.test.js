describe('SocketService', function () {

  var $service;
  var $scope;

  window.io = {
    connect: function () {
      return {
        on: function (eventName, callback) {
          callback(eventName);
        },

        emit: function (eventName, data, callback) {
          callback(eventName, data);
        }
      }
    }
  }

  beforeEach(module('chat'));

  beforeEach(inject(function(_SocketService_) {
    $service = _SocketService_;
  }));

  it('should exist', function () {
    expect($service).toBeDefined();
  });

  it('should call socket.on', function () {
    var eventName = 'customEvent';

    $service.on(eventName, function (res) {
      expect(res).toEqual(eventName);
    });
  });

  it('should call socket.emit', function () {
    var emit = {
      eventName: 'customEvent',
      data: [1, 2, 3]
    };

    $service.emit(emit.eventName, emit.data, function (eventName, data) {
      expect(eventName).toEqual(emit.eventName);
      expect(data).toEqual(emit.data);
    });
  });
});
