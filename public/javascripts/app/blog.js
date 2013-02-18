var app = angular.module('blogApp',['Scope.onReady','blogResource','loaderModule','Plugin.Controller.Title','Plugin.Controller.BlogEntries','blogService','blogFilter']).
    config(function($routeProvider,$locationProvider){
        $routeProvider.
            when("/",{templateUrl:"partials/blog.html"}).
            when("/about",{templateUrl:"partials/about.html"}).
            when("/projects",{templateUrl:"partials/projects.html"}).
            when("/shoutouts",{templateUrl:"partials/shoutouts.html"}).
            when("/admin/AddBlogEntry",{templateUrl:"partials/admin/createBlogEntry.html"}).
            when("/blog/:id",{templateUrl:"partials/blogEntry.html"}).
            when("/listByTag/:name",{templateUrl:"partials/blog.html"})
    });

//var becomeMainContent = angular.module('becomeMainContentModule',[])
    app.directive('becomeMainContent',function(){
        return {
            link:function(scope,ele){
                //iele.animate({width:900});
                console.log("directive called");
                scope.$whenReady(
                    function(someArgs) { //called when $scope.$onReady() is run
                        console.log("called when ready");
                        //ele.html('your data was loaded fine');
                        ele.removeClass("nine");
                        ele.addClass("twelve");
                    },
                    function(someArgs) { //called when $scope.$onFailure() is run

                    }
                    );

            }
        }
    });

app.factory('show',function(){
    return {state:false};
});
app.factory('categoryService',function(){
   return [{name:'test'}];
});

app.controller('blogViewCtrl',function($scope,show,categoryService,BlogsService){
    $scope.categories = BlogsService.getCategories();
    $scope.show = show;
})
//TODO:add a simple twitter feed here
var TwitterCtrl = function ($scope,Blog ) {
    //$scope.twitterResult = Blog.get();
}

var AboutCtrl = function ($scope,$http) {
}

app.controller('blogEntryCtrl',function ($scope,show,Blog,$routeParams,BlogsService) {
    console.log(BlogsService.getCategories());
    show.state = true;
    $scope.show = show;
    $scope.$prepareForReady();
    Blog.get({id:$routeParams.id},function(blog){
        $scope.entry = blog;
        $scope.text = blog[0].text;
        $scope.$onReady("success");
    },
    function(){
        $scope.$onFailure("failed");
    });

});