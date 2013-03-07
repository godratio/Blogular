angular.module('login', ['http-auth-interceptor']).directive('login', function () {
    return {
        restrict: "A",
        link: function (scope, elm) {
            elm.hide();
            scope.$on('event:auth-loginRequired', function () {
                elm.slideDown();
            });
            scope.$on('event:auth-loginConfirmed', function () {
                elm.slideUp();
            });
            scope.$on('event:auth-loginAttempt', function () {
                elm.slideUp();
            });
        }
    }
});