var blogResource = angular.module('blogResource', ['ngResource']).
    factory('Blog', function ($resource) {
        return  $resource('/blog/:id',
            {id:'@_id'},
            {
                'get':{method:'GET', isArray:'true'},
                'save':{method:'POST'}
            }
        );
    });

angular.module('blogService',['ngResource']).
    factory('BlogsService',function($resource,$q,$rootScope){
        var blogResource =  $resource('/blog/:id',
            {id:'@_id'},
            {
                'get':{method:'GET', isArray:'true'},
                'save':{method:'POST'}
            }
        );
        var commentResource = $resource('/comments',
            {id:'@_id'},
            {
                'get':{method:'GET',isArray:'true'},
                'save':{method:'POST'}
            }
        );
        var categories = [];
        var allBlogs = [];
        var BlogsService ={
            getBlogs:function(callback){
                var deferred = $q.defer();
                console.log("the errori shere ??");
                blogResource.get(function(blogs){
                        console.log("errorbeforcallback");
                       categories.length = 0;
                        for(var i = 0;i<blogs.length;i++){
                            for(var x = 0;x<blogs[i].categories.length;x++){
                                var name = blogs[i].categories[x].name;
                                var added = false;
                                if(categories.length == 0){
                                    categories.push({name:name,count:1});
                                    added = true;
                                }
                                if(added == false){
                                    for(var y = 0;y<categories.length;y++){
                                        var buffername = categories[y].name;
                                        var buffercount = categories[y].count;
                                        if(buffername == name){
                                            categories[y].count = ++buffercount ;
                                            added = true;
                                        }
                                    }
                                }
                                if(added == false){
                                    categories.push({name:name,count:1});
                                }
                            }
                        }
                        allBlogs = blogs;

                        callback(blogs);
                    },
                    function(){
                    });
            },
            getCategories:function(){
                return categories;
            },
            getAllBlogs:function(callback){
                if(allBlogs.length > 0){
                   // console.log(callback);
                    if(typeof callback == 'function'){
                        callback(allBlogs);
                    }
                    //return allBlogs;
                }else{
                    this.getBlogs(function(blogs){

                        callback(blogs);
                    })
                }
                //return allBlogs;
            },
            getBlogsByTag:function(tag){

                var buffer = [];
                angular.copy(allBlogs,buffer);
                for(var x = 0;x< allBlogs.length;x++){
                   //console.log(buffer[x].categories);
                    for(var i = 0;i<allBlogs[x].categories.length;i++){
                        console.log(allBlogs[x].categories[i]);
                        if(allBlogs[x].categories[i].name === tag){
                            buffer.push(allBlogs[x]);
                        }
                    }

                }
                return buffer;
            },
            getCommentsForBlogEntry:function(id){
                //console.log(allBlogs);
                for (var i = 0; i < allBlogs.length; i++) {
                   // console.log("blogid = "+allBlogs[i]._id + " id = "+id);
                    if(allBlogs[i]._id == id){
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
        }
        return BlogsService;
    });

angular.module('updateService',['ngResource']).
    factory('UpdateService',function($resource,$q){
        var service =  $resource('/lastUpdateSame/:date',
            {date:''},
            {
                'get':{method:'GET', isArray:'true'},
                'save':{method:'POST'}
            }
        );
        var lastUpdate = {};
        //update last update variable upon first initialization of factory
        (function(){
            service.get(function(date){
                this.lastUpdate = date[0].lastUpdate;
            });
        }());
        var UpdateService = {
            checkIfUpdate : function(callback){

                service.get({date:lastUpdate.lastUpdate}, function(result){
                    var resultToReturn;
                    if(result[0].result == "true"){
                        lastUpdate = result[0].lastUpdate;
                        resultToReturn = true;
                    }else{
                        resultToReturn = false;
                    }
                    callback(resultToReturn);
                    return resultToReturn;
                });
            }
        }
        return UpdateService;
    })
angular.module('blogFilter',[]).
    filter('byTag',function(){
       return function(blogs,tag){
           if(blogs == undefined && tag == undefined){
               return;
           }else if(blogs != undefined && tag == undefined){
               return blogs;
           }else if(blogs != undefined && tag != undefined){
               var buffer = [];
               for(var x = 0;x< blogs.length;x++){
                   for(var i = 0;i<blogs[x].categories.length;i++){
                       if(blogs[x].categories[i].name === tag){
                           buffer.push(blogs[x]);
                       }
                   }
               }
               return buffer;
           }
       }
    });
var adminResource = angular.module('adminResource', ['ngResource']).
    factory('Admin', function ($resource) {
        return  $resource('/auth/:action',
            {action:''},
            {
                'get':{method:'GET', isArray:'true'},
                'save':{method:'POST'}
            }
        );
    });
angular.module('foundationjs',[]).
    factory('foundation',function($rootScope){


    })

angular.module('socketio',[]).
    factory('socket',function($rootScope){
        var socket = io.connect();
        return {
            on:function(eventName,callback){
                socket.on(eventName,function(){
                    var args = arguments;
                    $rootScope.$apply(function(){
                        callback.apply(socket,args);
                    });
                });
            },
            emit:function(eventName,data,callback){
                socket.emit(eventName,data,function(){
                    var args = arguments;
                    $rootScope.$apply(function(){
                        if(callback){
                            callback.apply(socket,args);
                        }
                    });
                });
            }
        }
    });

angular.module('userService', ['ngResource']).
    factory('UserService',function($resource){
        var userResource =  $resource('/users',
            {date:''},
            {
                'get':{method:'GET', isArray:'true'},
                'save':{method:'POST'}
            }
        );
    });
