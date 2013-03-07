angular.module('blogFilter', []).
    filter('byTag', function () {
        return function (blogs, tag) {
            if (blogs == undefined && tag == undefined) {
                return;
            } else if (blogs != undefined && tag == undefined) {
                return blogs;
            } else if (blogs != undefined && tag != undefined) {
                var buffer = [];
                for (var x = 0; x < blogs.length; x++) {
                    for (var i = 0; i < blogs[x].categories.length; i++) {
                        if (blogs[x].categories[i].name === tag) {
                            buffer.push(blogs[x]);
                        }
                    }
                }
                return buffer;
            }
        }
    });