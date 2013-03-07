angular.module('userService', ['ngResource']).
    factory('UserService', function ($resource) {
        $resource('/users',
            {date: ''},
            {
                'get': {method: 'GET', isArray: 'true'},
                'save': {method: 'POST'}
            }
        );
    });
