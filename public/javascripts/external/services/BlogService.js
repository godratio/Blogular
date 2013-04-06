angular.module('blogService', ['ngResource']).
    factory('BlogsService', function ($resource, $q) {
        var blogResource = $resource('/blog/:id',
            {id: '@_id'},
            {
                'get': {method: 'GET', isArray: 'true'},
                'save': {method: 'POST'}
            }
        );
        $resource('/comments',
            {id: '@_id'},
            {
                'get': {method: 'GET', isArray: 'true'},
                'save': {method: 'POST'}
            }
        );
        var categories = [];
        var allBlogs = [];
        var BlogsService = {
            getBlogs: function (callback) {
                var deferred = $q.defer();
                console.log("the errori shere ??");
                blogResource.get(function (blogs) {
                        console.log("errorbeforcallback");
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

                        callback(blogs);
                    },
                    function () {
                    });
            },
            getCategories: function () {
                return categories;
            },
            getAllBlogs: function (callback) {
                console.log('getallblogs called')
                if (allBlogs.length > 0) {
                    console.log('first option');
                    if (typeof callback == 'function') {
                        callback(allBlogs);
                    }
                    //return allBlogs;
                } else {
                    this.getBlogs(function (blogs) {
                         console.log('getting all blogs from getAllBlogs')
                        callback(blogs);
                    })
                }
                //return allBlogs;
            },
            getBlogsByTag: function (tag) {

                var buffer = [];
                angular.copy(allBlogs, buffer);
                for (var x = 0; x < allBlogs.length; x++) {
                    //console.log(buffer[x].categories);
                    for (var i = 0; i < allBlogs[x].categories.length; i++) {
                        console.log(allBlogs[x].categories[i]);
                        if (allBlogs[x].categories[i].name === tag) {
                            buffer.push(allBlogs[x]);
                        }
                    }

                }
                return buffer;
            },
            getCommentsForBlogEntry: function (id) {
                //console.log(allBlogs);
                for (var i = 0; i < allBlogs.length; i++) {
                    // console.log("blogid = "+allBlogs[i]._id + " id = "+id);
                    if (allBlogs[i]._id == id) {
                        // console.log(allBlogs[i]);
                        return allBlogs[i].comments;
                    }
                }
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