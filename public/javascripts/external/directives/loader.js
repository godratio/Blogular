var loader = angular.module('loaderModule', [])
    .directive('loader', function () {
        return {
            link: function (scope, elm, attrs) {
                var urlToLoaderImage = "/images/loading.gif";
                elm.css("background-image", "url(" + urlToLoaderImage + ")")
                    .css("background-repeat", "no-repeat")
                    .css("height", "100px");
                scope.$eval(attrs.loader);
                scope.$whenReady(
                    function () {
                        elm.css("background-image", "none");
                        elm.css("height", "100%");
                    },
                    function () {
                    }
                )
            }
        }
    });

