var blogResource = angular.module('blogResource', ['ngResource']).
    factory('Blog', function ($resource) {
        return  $resource('/blog/:id',
            {id: '@_id'},
            {
                'get': {method: 'GET', isArray: 'true'},
                'save': {method: 'POST'}
            }
        );
    });

