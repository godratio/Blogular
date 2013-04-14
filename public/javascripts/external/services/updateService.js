angular.module('updateService', ['ngResource']).
    factory('UpdateService', function ($resource) {
        var service = $resource('/lastUpdateSame/:date',
            {date: ''},
            {
                'get': {method: 'GET', isArray: 'true'},
                'save': {method: 'POST'}
            }
        );
        var lastUpdate = {};
        //update last update variable upon first initialization of factory
        (function () {
            service.get(function (date) {
                this.lastUpdate = date[0].lastUpdate;
            });
        }());
        var UpdateService = {
            checkIfUpdate: function (callback) {
                service.get({date: lastUpdate.lastUpdate}, function (result) {
                    var resultToReturn;
                    if (result[0].result == "true") {
                        lastUpdate = result[0].lastUpdate;
                        resultToReturn = true;
                    } else {
                        resultToReturn = false;
                    }
                    callback(resultToReturn);
                    return resultToReturn;
                });
            }
        };
        return UpdateService;
    });