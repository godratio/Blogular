angular.module('blogService', ['ngResource']).
    factory('BlogsService', function ($resource, $q) {
        var blogResource = $resource('/blog/:id',
            {id: '@_id'},
            {
                'get': {method: 'GET', isArray: 'true'},
                'save': {method: 'POST'}
            }
        );
        var commentsResource = $resource('/comments',
            {id: '@_id'},
            {
                'get': {method: 'GET', isArray: 'true'},
                'save': {method: 'POST'}
            }
        );
        var blogPagination = $resource('/blog/:skip/:limit',
            {skip:'0',limit:'3'},
            {'get':{method:'GET',isArray:'true'}
            });
        var categories = [];
        var allBlogs = [];
        var processBlogs = function(blogs){
            console.log(categories);
            categories.length = 0;
            for (var i = 0; i < blogs.length; i++) {
                if(blogs[i].categories === undefined){continue}
                for (var x = 0; x < blogs[i].categories.length; x++) {
                    var name = blogs[i].categories[x].name;
                    var added = false;
                    if (categories.length == 0) {
                        categories.push({name: name, count: 1});
                        added = true;
                    }
                    if (added == false) {
                        for (var y = 0; y < categories.length; y++) {
                            var buffername = categories[y].name;
                            var buffercount = categories[y].count;
                            if (buffername == name) {
                                categories[y].count = ++buffercount;
                                added = true;
                            }
                        }
                    }
                    if (added == false) {
                        categories.push({name: name, count: 1});
                    }
                }
            }
            allBlogs = blogs;
            return blogs;

        }
        var BlogsService = {
            getBlogs: function (callback) {
                var deferred = $q.defer();
                blogResource.get(function (blogs) {
                        callback(processBlogs(blogs));
                    },
                    function () {
                    });
            },
            getCategories: function () {
                return categories;
            },
            getAllBlogs: function (callback) {
                if (allBlogs.length > 0) {
                    if (typeof callback == 'function') {
                        callback(allBlogs);
                    }
                    //return allBlogs;
                } else {
                    this.getBlogs(function (blogs) {
                        callback(blogs);
                    })
                }
                //return allBlogs;
            },
            getBlogsByTag: function (tag) {

                var buffer = [];
                angular.copy(allBlogs, buffer);
                for (var x = 0; x < allBlogs.length; x++) {
                    for (var i = 0; i < allBlogs[x].categories.length; i++) {
                        if (allBlogs[x].categories[i].name === tag) {
                            buffer.push(allBlogs[x]);
                        }
                    }

                }
                return buffer;
            },
            getCommentsForBlogEntry: function (id) {
                for (var i = 0; i < allBlogs.length; i++) {
                    if (allBlogs[i]._id == id) {
                        return allBlogs[i].comments;
                    }
                }
            },
            //check cache for Blog Entry
            getBlogFromLocal:function(id,callback){
                for (var i = 0; i < allBlogs.length; i++) {
                    if (allBlogs[i]._id == id) {
                        callback(allBlogs[i]);
                    }
                }
            },
            updateBlog:function(form,callback){
                var b = new blogResource(form);
                b.$save(function () {
                        callback();
                    },
                    function (err) {
                        callback(err);
                    });
            },
            paginatedBlogs:function(skip,limit,callback){
                blogPagination.get({skip:skip,limit:limit},function(blogs){
                    console.log(blogs);
                    callback(processBlogs(blogs));
                })
            }

            /*,TODO:why won allBlogs be the current value of comments ????

             postComment:function(params,callback){
             console.log(this.getCommentsForBlogEntry(params.id));
             var buffer = [];
             angular.copy(this.getCommentsForBlogEntry(params.id),buffer);
             console.log(buffer);
             buffer.push({body:params.body,date:Date.now()});
             this.getAllBlogs(function(blogs){
             angular.forEach(blogs,function(value,key){

             if(value._id == params.id){

             allBlogs[key].comments = buffer;
             allBlogs[key].$save(function(newBlog){
             callback(newBlog);
             });
             }
             })
             })
             }
             */
        };
        return BlogsService;
    });