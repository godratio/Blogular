var adminResource = angular.module('adminResource', ['ngResource']).
    factory('Admin', function ($resource) {
        return  $resource('/auth/:action',
            {action: ''},
            {
                'get': {method: 'GET', isArray: 'true'},
                'save': {method: 'POST'}
            }
        );
    });