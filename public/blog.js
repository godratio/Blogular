var app = angular.module('blogApp',['blogService']).
    config(function($routeProvider,$locationProvider){
        $routeProvider.
            when("/",{templateUrl:"partials/blog.html"}).
            when("/about",{templateUrl:"partials/about.html"}).
            when("/projects",{templateUrl:"partials/projects.html"}).
            when("/shoutouts",{templateUrl:"partials/shoutouts.html"}).
            when("/admin/AddBlogEntry",{templateUrl:"partials/admin/createBlogEntry.html"}).
            when("/blog/:id",{templateUrl:"partials/blogEntry.html",controller:blogEntryCtrl})
    });

//TODO:add a simple twitter feed here
var TwitterCtrl = function ($scope,Blog ) {
    $scope.twitterResult = Blog.get();
}

var AboutCtrl = function ($scope,$http) {
}

var blogEntryCtrl = function ($scope ,Blog,$routeParams) {
    var blog = Blog.get({id:$routeParams.id},function(){
        $scope.entry = blog;
    })
}