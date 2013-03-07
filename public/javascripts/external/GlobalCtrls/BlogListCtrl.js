/**
 * Created with JetBrains WebStorm.
 * User: Ray Garner
 * Date: 13/02/08
 * Time: 0:45
 * To change this template use File | Settings | File Templates.
 */
angular.module('Plugin.Controller.BlogEntries', ['updateService', 'blogService', 'Scope.onReady'])
    .controller('ContentCtrl', function ($scope, show, Blog, BlogsService, $q, $routeParams, UpdateService) {
        console.log($routeParams.name + "parname");
        $scope.$prepareForReady();
        $scope.filterTag = $routeParams.name;
        //check if user wants to see blogs by categories or not
        if ($routeParams.name) {
            console.log("error?");
            UpdateService.checkIfUpdate(function (result) {
                console.log(result);
                if (result) {
                    BlogsService.getBlogs(function (blogs) {
                        $scope.entries = blogs;
                        //**********how to encapsulate in angular??************//
                        $scope.fiterTag = $routeParams.name;
                        //$scope.entries = BlogsService.getAllBlogs();
                        $scope.$onReady("filter");
                        //**********how to encapsulate in angular??************//
                    });
                } else {
                    //**********how to encapsulate in angular??************//
                    BlogsService.getAllBlogs(function (blogs) {
                        $scope.entries = blogs;
                        $scope.fiterTag = $routeParams.name;
                        $scope.$onReady("filter");
                    });
                    //**********how to encapsulate in angular??************//
                }
            })

        } else {
            show.state = false;
            $scope.show = show;
            $scope.getEntries = function () {
                BlogsService.getAllBlogs(function (blogs) {
                    $scope.entries = blogs;
                    $scope.categories = BlogsService.getCategories();
                    console.log($scope.categories);
                    $scope.$onReady("success");

                });
            }

            $scope.getBackImg = function (_id) {
                angular.forEach($scope.entries, function (value, key) {
                    if (value._id == _id) {
                        return value.titleImage;
                    }
                })
            }
        }
    });