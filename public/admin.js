/**
 * Created with JetBrains WebStorm.
 * User: Ray Garner
 * Date: 13/02/07
 * Time: 10:00
 * To change this template use File | Settings | File Templates.
 */
var appAdmin = angular.module('blogAppAdmin',['blogService']).
    config(function($routeProvider,$locationProvider){
        $routeProvider.
            when("/",{templateUrl:"partials/admin/blogList.html"}).
            when("/edit/:blogId",{templateUrl:"partials/admin/edit.html"}).
            when("/add",{templateUrl:"partials/admin/createBlogEntry.html"}).
            when("/adminInstuctions",{templateUrl:"partials/admin/adminInstructions.html"})
    })


appAdmin.controller('AddBlogCtrl',function ($scope,Blog,$location) {
    if($scope.$$phase) {
        //don't worry, the value gets set and AngularJS picks up on it...

    }
    else {
        //this will fire to tell angularjs to notice that a change has happened
        //if it is outside of it's own behaviour...
        $scope.$apply();
    }
    $scope.submitPost = function(){
        b = new Blog($scope.form);
        console.log(b);
        b.$save();
        $scope.form.title = "";
        $scope.form.author = "";
        $scope.form.text = "";
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