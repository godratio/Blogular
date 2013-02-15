var blogResource = angular.module('blogResource', ['ngResource']).
    factory('Blog', function ($resource) {
        return  $resource('/blog/:id',
            {id:'@_id'},
            {
                'get':{method:'GET', isArray:'true'},
                'save':{method:'POST'}
            }
        );
    });

var adminResource = angular.module('adminResource', ['ngResource']).
    factory('Admin', function ($resource) {
        return  $resource('/auth/:action',
            {action:''},
            {
                'get':{method:'GET', isArray:'true'},
                'save':{method:'POST'}
            }
        );
    });