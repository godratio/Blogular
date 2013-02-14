/**
 * Created with JetBrains WebStorm.
 * User: Ray Garner
 * Date: 13/02/07
 * Time: 10:00
 * To change this template use File | Settings | File Templates.
 */
var appAdmin = angular.module('blogAppAdmin',['ngCookies','blogResource','adminResource','http-auth-interceptor','Plugin.Controller.Title','Plugin.Controller.BlogEntries']).
    config(function($routeProvider,$locationProvider){
        $routeProvider.
            when("/",{templateUrl:"partials/admin/blogList.html"}).
            when("/edit/:blogId",{templateUrl:"partials/admin/edit.html"}).
            when("/add",{templateUrl:"partials/admin/createBlogEntry.html"}).
            when("/adminInstuctions",{templateUrl:"partials/admin/adminInstructions.html"})
    })

appAdmin.directive('login',function(){
    return {
        restrict:"A",
        link:function(scope,elm,attr){
            elm.hide();
            scope.$on('event:auth-loginRequired', function() {
                elm.slideDown();
            });
            scope.$on('event:auth-loginConfirmed', function() {
                elm.slideUp();
            });
        }
    }
})
appAdmin.controller('LoginController', function ($scope, Admin, authService) {
        $scope.submitAuth = function() {
            /*
            $http.post('auth/login').success(function() {
                authService.loginConfirmed();
            });
            */
            console.log($scope.form)
            var a = new Admin($scope.form);
            console.log(b);
            a.$save({action:'login'} , function(){
                authService.loginConfirmed();
            });

        }
    }
);
appAdmin.controller('AddBlogCtrl',function ($scope,Blog,$location,$cookies) {

    $scope.submitPost = function(){
        console.log($scope.form);
        b = new Blog($scope.form);
        console.log(b);
        b.$save(function(){
            $scope.form.title = "";
            $scope.form.author = "";
            $scope.form.text = "";
            $scope.message = "";
        },
        function(err){
            console.log("error",err);
            $scope.message = "Blog entry must have a title.";
        });
        console.log($cookies.loggedIn);
    }
})

appAdmin.controller('EditBlogCtrl',function ($scope, Blog,$routeParams) {

    var blogs = Blog.get({id:$routeParams.blogId},function(blogP){
       var blog = blogP[0];
        $scope.form = blog;
    })

    $scope.editPost = function(){
        $scope.form.$save();
    }

    $scope.deletePost = function(){
        $scope.form.$remove();
    }
})