var loader = angular.module('loaderModule',[])
    .directive('loader', function ($q) {
    return {
        link:function (scope, elm, attrs) {
            var urlToLoaderImage = "/images/loading.gif";
            elm.css("background-image","url("+urlToLoaderImage+")")
                .css("background-repeat","no-repeat")
                .css("height","100px");
            var deferred = $q.defer();
            var promise = scope.$eval(attrs.loader);
            promise.then(function(){
                    console.log("promise returned");
                    elm.css("background-image","none");
                    console.log(elm.parent());
                },
                function(){
                    console.log("errror in promise");
                })
        }
    }
});

