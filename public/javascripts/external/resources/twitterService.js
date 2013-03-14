var twitterResource = angular.module('twitterService', ['ngResource']).
    factory('Twitter', function ($resource) {
        return  $resource('http://search.twitter.com/:action',
            {action:'search.json',q: 'blogular',callback:'JSON_CALLBACK'},
            {
                'get': {method: 'JSONP'}
                //'save': {method: 'POST'}
            }
        );
    });

