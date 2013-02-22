var app = angular.module('blogApp', ['userService', 'http-auth-interceptor', 'login', 'socketio', 'updateService', 'Scope.onReady', 'blogResource', 'loaderModule', 'Plugin.Controller.Title', 'Plugin.Controller.BlogEntries', 'blogFilter']).
    config(function ($routeProvider, $locationProvider) {
        $routeProvider.
            when("/", {templateUrl:"partials/blog.html"}).
            when("/about", {templateUrl:"partials/about.html"}).
            when("/projects", {templateUrl:"partials/projects.html"}).
            when("/shoutouts", {templateUrl:"partials/shoutouts.html"}).
            when("/admin/AddBlogEntry", {templateUrl:"partials/admin/createBlogEntry.html"}).
            when("/blog/:id", {templateUrl:"partials/blogEntry.html"}).
            when("/listByTag/:name", {templateUrl:"partials/blog.html"})
    });

//var becomeMainContent = angular.module('becomeMainContentModule',[])
app.directive('becomeMainContent', function () {
    return {
        link:function (scope, ele) {
            //iele.animate({width:900});
            console.log("directive called");
            scope.$whenReady(
                function (someArgs) { //called when $scope.$onReady() is run
                    console.log("called when ready");
                    //ele.html('your data was loaded fine');
                    ele.removeClass("nine");
                    ele.addClass("twelve");
                },
                function (someArgs) { //called when $scope.$onFailure() is run

                }
            );

        }
    }
});
app.directive('revealModal', function () {
    return {
        link:function (scope, ele, attr) {
            console.log('show-modal directive called');
            console.log(attr);
            if(attr == 'reveal' ){
            ele.reveal({
                animationSpeed:"300"
            });
            }
        }
    }
});

app.directive('ifAuthed',function($http){
    return {
        link:function(scope,ele){
            console.log('hideIfAuthedCalled');
            //ele.hide();
           // console.log(attr.ifAuthed);
           // var param = attr.ifAuthed;
            $http.get('/checkauthed').
                success(function(data,status){
                    ele.hide();
                }).error(function(data,status){
                //    console.log(param);
                    elm.hide();
                })
        }
    }
})
app.factory('show', function () {
    return {state:false};
});
app.factory('categoryService', function () {
    return [
        {name:'test'}
    ];
});
app.service('userInfoService',function(){
    var username = {username:"Guest"};
    return {
        getUsername:function(){
            console.log(username);
            return username;
        },
        setUsername:function(value){
            username.username = value;
        }
    }
});
app.controller('blogViewCtrl', function ($scope, show, categoryService, BlogsService) {
    $scope.categories = BlogsService.getCategories();
    $scope.show = show;
})
//TODO:add a simple twitter feed here
var TwitterCtrl = function ($scope, Blog) {
    //$scope.twitterResult = Blog.get();
}

var AboutCtrl = function ($scope, $http) {
}

app.controller('blogEntryCtrl', function ($scope, show, Blog, $routeParams, socket, BlogsService) {
    $scope.entry = "";
    socket.emit('subscribe', {room:$routeParams.id});
    socket.on('commentsupdated', function (data) {
        Blog.get({id:$routeParams.id}, function (blog) {
                $scope.entry = blog[0];
                $scope.text = blog[0].text;
                $scope.comments = blog[0].comments;
                $scope.$onReady("success");
            },
            function () {
                $scope.$onFailure("failed");
            });
    });
    $scope.submitComment = function () {
        /*
         BlogsService.postComment({body:$scope.body,id:$scope.entry._id},function(blog){
         //console.log(blog.comments);
         $scope.comments = blog.comments;
         });
         */

        if ($scope.entry.comments == undefined) {
            $scope.entry.comments = [];
            $scope.entry.comments.push({body:$scope.body, date:Date.now()});
        } else {
            var buffer = [];
            angular.copy($scope.comments, buffer);
            console.log(buffer);
            buffer.push({body:$scope.body, date:Date.now()});
            $scope.entry.comments = buffer;
            // blog.comments.push({body:$scope.body,data:Date.now()});
        }
        $scope.entry.$save(function (blog) {
            console.log("saved");
            $scope.comments = blog.comments;
            $scope.body = "";
//            $scope.comments = BlogsService.getCommentsForBlogEntry($routeParams.id);
            socket.emit('sentcomment', {update:'true'});
        });

    };
    show.state = true;
    $scope.show = show;
    $scope.$prepareForReady();
    Blog.get({id:$routeParams.id}, function (blog) {
            $scope.entry = blog[0];
            $scope.text = blog[0].text;
            $scope.comments = blog[0].comments;
            $scope.$onReady("success");
        },
        function () {
            $scope.$onFailure("failed");
        });

});

app.controller('LoginController', function ($scope, $http, authService, authService,userInfoService) {

        $scope.submitAuth = function () {
            console.log($scope.form);
            $http.post('/login', $scope.form)
                .success(function (data, status) {
                    console.log(data);
                    userInfoService.setUsername($scope.form.username);
                    $scope.form = [];
                    authService.loginConfirmed();
                }).error(function (data, status) {

                });
        }
    }
);

app.controller('RegisterCtrl', function ($scope, $http) {
    $scope.submitRegi = function () {
        $http.post('/register', $scope.form).
            success(function (data, status) {
                console.log(data);
                $scope.form = [];
            }).
            error(function (data, status) {

            });
    }
});

app.controller('UserInfoCtrl',function($scope,userInfoService){
    //TODO: Why is $scope.userinfo.username undefined userinfo???WTF
    $scope.userinfo = userInfoService.getUsername();
})