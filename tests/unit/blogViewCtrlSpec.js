describe('BlogViewCtrl tests: ',function(){
    beforeEach(module('blogApp'));
    beforeEach(module('blogService'));
    var scope,ctrl,$httpBackend,BlogsService;
    beforeEach(inject(function($injector,$rootScope,$controller,$httpBackend){
        $httpBackend = $injector.get('$httpBackend');
        BlogsService = $injector.get('BlogsService');
        scope = $rootScope.$new();

        ctrl = $controller('blogViewCtrl',{$scope : scope});

        $httpBackend.when('GET', '/blog')
            .respond(
                [
                    {title: 'Got', author: 'Ray Garner', categories: [
                        {name: 'category'}
                    ]}
                ]
            );
        BlogsService.getBlogs(function(){});
        $httpBackend.flush();
    }));

    it('should get categories and assign them to categories on scope',function(){
         expect(scope.categories[0].name).toBe('category');
    })

})