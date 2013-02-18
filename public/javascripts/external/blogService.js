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
        var service =  $resource('/blog/:id',
            {id:'@_id'},
            {
                'get':{method:'GET', isArray:'true'},
                'save':{method:'POST'}
            }
        );
        var categories = [];
        var allBlogs = [];
        var BlogsService ={
            getBlogs:function(callback){
                var deferred = $q.defer();
                service.get(function(blogs){
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
            getAllBlogs:function(){
                return allBlogs;
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
            }
        }
        return BlogsService;
    })
angular.module('blogFilter',[]).
    filter('byTag',function(){
       return function(blogs,tag){
           var buffer = [];
           if(tag == undefined){
               if(blogs){
                   return   blogs;
               }else{
                   return;
               }
           }
           for(var x = 0;x< blogs.length;x++){
               for(var i = 0;i<blogs[x].categories.length;i++){
                   if(blogs[x].categories[i].name === tag){
                       buffer.push(blogs[x]);
                   }
               }

           }
           return buffer;
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