/**
 * Created with JetBrains WebStorm.
 * User: Ray Garner
 * Date: 13/02/07
 * Time: 10:00
 * To change this template use File | Settings | File Templates.
 */
var appAdmin = angular.module('blogAppAdmin', ['userService','login','ngCookies','loaderModule', 'blogResource', 'adminResource', 'http-auth-interceptor', 'Plugin.Controller.Title', 'Plugin.Controller.BlogEntries']).
    config(function ($routeProvider) {
        $routeProvider.
            when("/", {templateUrl:"partials/admin/blogList.html"}).
            when("/edit/:blogId", {templateUrl:"partials/admin/edit.html"}).
            when("/add", {templateUrl:"partials/admin/createBlogEntry.html"}).
            when("/adminInstructions", {templateUrl:"partials/admin/adminInstructions.html"})
    });

appAdmin.directive('login', function () {
    return {
        restrict:"A",
        link:function (scope, elm) {
            elm.hide();
            scope.$on('event:auth-loginRequired', function () {
                elm.slideDown();
            });
            scope.$on('event:auth-loginConfirmed', function () {
                elm.slideUp();
            });
        }
    }
});

appAdmin.factory('show',function(){
    return {state:false};
})

appAdmin.controller('AdminAppCtrl',function($scope){
    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
})

appAdmin.controller('LoginController', function ($scope, Admin, authService) {
        $scope.submitAuth = function () {
            console.log($scope.form);
            var a = new Admin($scope.form);
            a.$save({action:'login'}, function () {
                authService.loginConfirmed();
            });//test

        }
    }
);
appAdmin.controller('AddBlogCtrl', function ($scope, Blog, $location, $cookies) {

    $scope.submitPost = function () {
        console.log($scope.form);
        var categories = $scope.form.categories.split(',');
        var bufferArr = [];
        angular.forEach(categories,function(value,key){
            var bufferObj = {name:value};
            bufferArr.push(bufferObj);
        });
        //angular.copy(bufferArr,$scope.form.categories);
        $scope.form.categories = bufferArr;
        var b = new Blog($scope.form);
        console.log(b);
        b.$save(function () {
                $scope.form.title = "";
                $scope.form.author = "";
                $scope.form.text = "";
                $scope.message = "";
            },
            function (err) {
                console.log("error", err);
                $scope.message = "Blog entry must have a title.";
            });
        console.log($cookies.loggedIn);
    }
});

appAdmin.controller('EditBlogCtrl', function ($scope, Blog, $routeParams) {

    Blog.get({id:$routeParams.blogId}, function (blogP) {
        $scope.form = blogP[0];
    });
    $scope.editPost = function () {
        $scope.form.$save();
    };

    $scope.deletePost = function () {
        $scope.form.$remove();
    };
});