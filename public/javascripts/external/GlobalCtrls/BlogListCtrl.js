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
        var filterByTags = function () {
            $scope.fiterTag = $routeParams.name;
            $scope.entries = BlogsService.getAllBlogs();
            $scope.$onReady("filter");
        }
        $scope.$prepareForReady();
        $scope.filterTag = $routeParams.name;
        //check if user wants to see blogs by categories or not
        if ($routeParams.name) {
            UpdateService.checkIfUpdate(function (result) {
                if (result) {
                    BlogsService.getBlogs(function (blogs) {
                        $scope.entries = blogs;
                        filterByTags();
                    });
                }else{
                   filterByTags();
                }
            })

        } else {
            show.state = false;
            $scope.show = show;
            $scope.getEntries = function () {
                BlogsService.getBlogs(function (data) {
                    $scope.entries = BlogsService.getAllBlogs();
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
    })