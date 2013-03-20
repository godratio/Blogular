var app = angular.module('blogApp', ['twitterService','userService', 'http-auth-interceptor', 'login', 'socketio', 'updateService', 'Scope.onReady', 'blogResource', 'loaderModule', 'Plugin.Controller.Title', 'Plugin.Controller.BlogEntries', 'blogFilter']).
    config(function ($routeProvider) {
        $routeProvider.
            when("/", {templateUrl: "partials/blog.html"}).
            when("/about", {templateUrl: "partials/about.html"}).
            when("/projects", {templateUrl: "partials/projects.html"}).
            when("/shoutouts", {templateUrl: "partials/shoutouts.html"}).
            when("/admin/AddBlogEntry", {templateUrl: "partials/admin/createBlogEntry.html"}).
            when("/blog/:id", {templateUrl: "partials/blogEntry.html"}).
            when("/listByTag/:name", {templateUrl: "partials/blog.html"})
    });

app.directive('becomeMainContent', function () {
    return {
        link: function (scope, ele) {
            //iele.animate({width:900});
            console.log("directive called");

            scope.$whenReady(
                function () { //called when $scope.$onReady() is run
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
        link: function (scope, elm, attrs) {
            console.log('show-modal directive called');
            console.log(attrs);


            scope.$on('event:auth-loginConfirmed', function (event) {
                console.log("EVENT TRIGGERED" + event);
                if (attrs.revealModal == 'login') {
                    elm.trigger('reveal:close');
                } else {
                    //elm.show();
                }
            });
            scope.$on('event:auth-registered', function () {
                if (attrs.revealModal == 'register') {
                    elm.trigger('reveal:close');
                }
                if (attrs.revealModal == 'login') {
                    scope.message = 'Use your credentials to login';
                    elm.reveal();
                }
            });


        }
    }
});

app.directive('ifAuthed', function ($http) {
    return {
        link: function (scope, elm, attrs) {
            console.log('hideIfAuthedCalled');
            $http.get('/checkauthed').then(function (data) {
                scope.username = data.data;
                if (attrs.ifAuthed == 'show') {
                    elm.show();
                } else {
                    elm.hide();
                }
            });
            scope.$on('event:auth-loginConfirmed', function (event) {
                console.log(event);
                if (attrs.ifAuthed == 'show') {
                    elm.show();
                } else {
                    elm.hide();
                }
            });
            scope.$on('event:auth-loggedOut', function (event) {
                console.log(event);
                if (attrs.ifAuthed == 'show') {
                    elm.hide();
                } else {
                    elm.show();
                }
            });
            scope.$on('event:auth-loginRequired', function () {

                if (attrs.ifAuthed == 'show') {
                    elm.hide();
                } else {
                    elm.show();
                }
            });
        }
    }
});
app.factory('show', function () {
    return {state: false};
});
app.factory('categoryService', function () {
    return [
        {name: 'test'}
    ];
});
app.service('userInfoService', function () {
    var username = "Guest";
    return {
        getUsername: function () {
            console.log(username);
            return username;
        },
        setUsername: function (value) {
            username.username = value;
        }
    }
});
app.controller('blogViewCtrl', function ($scope, show, categoryService, BlogsService) {
    $scope.categories = BlogsService.getCategories();
    $scope.show = show;
});
//TODO:add a simple twitter feed here
app.controller('TwitterCtrl',function ($scope, Blog,Twitter,$routeParams) {
    $scope.twitterResult =  Twitter.get();
    console.log("Twitter result");
    console.log($scope.twitterResult);
});

var AboutCtrl = function ($scope, $http) {
};

app.controller('blogEntryCtrl', function ($scope, show, Blog, $routeParams, socket) {
    socket.connect();
    $scope.entry = "";
    $scope.viewers = [];
    console.log("angular subscribing");
    socket.emit('subscribe', {room: $routeParams.id});
    socket.on('login', function () {
        socket.emit('subscribe', {room: $routeParams.id});
    });
    socket.on('initialuserlist', function (data) {
        console.log('initialize user list');
        console.log(data);
        $scope.viewers = data;
    });


    socket.on('commentsupdated', function () {
        Blog.get({id: $routeParams.id}, function (blog) {
                $scope.entry = blog[0];
                $scope.text = blog[0].text;
                $scope.comments = blog[0].comments;
                $scope.$onReady("commentsupdated");
            },
            function () {
                $scope.$onFailure("failed");
            });
    });
    socket.on('updateusers', function (data) {
        console.log('updated user list');
        console.log(data);
        $scope.viewers = data;
    });
    socket.on('removeuser', function (data) {
        var viewers = [];
        angular.copy($scope.viewers, viewers);
        angular.forEach($scope.viewers, function (value, key) {
            console.log(value);
            if (value.id == data) {
                $scope.viewers.splice(key, 1);
            }
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
            //noinspection JSPrimitiveTypeWrapperUsage
            $scope.entry.comments = [];
            $scope.entry.comments.unshift({body: $scope.body, date: Date.now()});
        } else {
            var buffer = [];
            angular.copy($scope.comments, buffer);
            console.log(buffer);
            buffer.unshift({body: $scope.body, date: Date.now()});
            //noinspection JSPrimitiveTypeWrapperUsage
            $scope.entry.comments = buffer;
            // blog.comments.push({body:$scope.body,data:Date.now()});
        }
        $scope.entry.$save(function (blog) {
            console.log("saved");
            $scope.comments = blog.comments;
            $scope.body = "";
//            $scope.comments = BlogsService.getCommentsForBlogEntry($routeParams.id);
            socket.emit('sentcomment', {room: $routeParams.id});
        });

    };
    show.state = true;
    $scope.show = show;
    $scope.$prepareForReady();
    Blog.get({id: $routeParams.id}, function (blog) {
            console.log("got blogs");
            $scope.entry = blog[0];
            $scope.text = blog[0].text;
            console.log(blog[0].comments);
            $scope.comments = blog[0].comments;
            $scope.$onReady("success");
        },
        function () {
            $scope.$onFailure("failed");
        });
    $scope.$on('$routeChangeStart', function (scope, next, current) {
        console.log('Changing from ' + angular.toJson(current) + ' to ' + angular.toJson(next));
        console.log($routeParams.id);
        socket.emit('unsubscribe', {room: $routeParams.id});
    });
    $scope.$on('$destroy', function () {
        console.log("Being destroyed");
        socket.removeListener('enterroom');
        socket.removeAllListeners('initialuserlist');
        socket.removeAllListeners('commentsupdated');
        socket.removeAllListeners('updateusers');
        // or something like
        // socket.removeListener(this);
    });
});

app.controller('LoginController', function ($scope, $http, authService, userInfoService, socket, $rootScope) {
    $scope.error = "";
    $scope.message = "";
    $scope.loginAttempt = false;
    $scope.submitAuth = function () {
        $rootScope.$broadcast('event:auth-loginAttempt');
        $scope.loginAttempt = true;
        $scope.error = "";
        console.log($scope.form);
        $http.post('/login', $scope.form)
            .success(function (data, status) {
                console.log('logged in with status '+status);
                console.log(data);
                console.log('setting username '+$scope.form.username);
                userInfoService.setUsername($scope.form.username);
                $scope.userinfo = $scope.form;
                $scope.form.username = "";
                $scope.form.password = "";


                authService.loginConfirmed();
                window.location.reload();
            }).error(function (data, status) {
                $scope.error = "Failed to connect to server please check your connection";
            });
    };
    socket.on('connect', function () {
        console.log("connect");
    });
    socket.on('disconnect', function () {
        console.log("disconnect");
    });
    socket.on('connecting', function (x) {
        console.log("connecting", x);
    });
    socket.on('connect_failed', function () {
        console.log("connect_failed");
    });
    socket.on('close', function () {
        console.log("close");
    });
    socket.on('reconnect', function (a, b) {
        console.log("reconnect", a, b);
    });
    socket.on('reconnecting', function (a, b) {
        console.log("reconnecting", a, b);
    });
    socket.on('reconnect_failed', function () {
        console.log("reconnect_failed");
    });
    $scope.$on('event:auth-loginRequired', function () {
        if ($scope.loginAttempt == true) {
            $scope.error = "Username or password is incorrect";
        }
    });

});

app.controller('RegisterCtrl', function ($scope, $http, $rootScope) {
    $scope.submitRegi = function () {
        $http.post('/register', $scope.form).
            success(function (data) {
                console.log(data);
                if (data.fail) {
                    $scope.message = data.fail;
                } else {
                    $scope.form = {};
                    $rootScope.$broadcast('event:auth-registered');
                }
            }).
            error(function () {
                $scope.message = "Registration failed please check connection";
            });
    }
});

app.controller('UserInfoCtrl', function ($scope, userInfoService, $http) {
    $scope.username = userInfoService.getUsername();
    $scope.logout = function () {
        console.log("Why u call logout");
        $http.post('/logout').
            success(function () {
                console.log("success should never come here");
            }).error(function () {
                console.log("error on logout??")
            })
    };
    $scope.$on('event:auth-loggedOut', function (event) {
        //userInfoService.setUsername("Guest");
        $scope.username = "Guest";
        window.location.reload();

    })

});