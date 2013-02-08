/**
 * Created with JetBrains WebStorm.
 * User: Ray Garner
 * Date: 13/02/08
 * Time: 0:45
 * To change this template use File | Settings | File Templates.
 */

var ContentCtrl = function ($scope,Blog) {
    var blogs = Blog.get();
    $scope.getBackImg = function(_id){
        angular.forEach(blogs,function(value,key){
            if(value._id == _id){
                return value.titleImage;
            }
        })
    }
    $scope.entries = blogs;
    //$scope.backgroundImg = "url(http://placekitten.com/200/300)";
}