/**
 * Created with JetBrains WebStorm.
 * User: Ray Garner
 * Date: 13/02/08
 * Time: 0:45
 * To change this template use File | Settings | File Templates.
 */
angular.module('Plugin.Controller.BlogEntries', []).controller('ContentCtrl', function ($scope,show, Blog,$q,$routeParams) {
    console.log($routeParams);
    show.state = false;
    $scope.show = show;
    $scope.getEntries = function () {
        var deferred = $q.defer();
        console.log("getBlogListEntriesCalled");
        $scope.entries = Blog.get(function(){
                deferred.resolve("success");
            },
            function(){
                deferred.reject("failed check connection");
            });
        return deferred.promise;
    }
    $scope.getBackImg = function (_id) {
        angular.forEach($scope.entries, function (value, key) {
            if (value._id == _id) {
                return value.titleImage;
            }
        })
    }
})