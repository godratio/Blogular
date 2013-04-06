describe('LoginCtrl tests: ',function(){
    beforeEach(module('blogApp'));
    var scope,ctrl,$httpBackend;
    beforeEach(inject(function ($rootScope, $controller, $routeParams, $injector) {
        $httpBackend = $injector.get('$httpBackend');

        $httpBackend.when('GET', '/login')
            .respond(
                [
                    {title: 'Got', author: 'Ray Garner', categories: [
                        {name: 'categoryID'}
                    ]}
                ]
            );

        scope = $rootScope.$new();
        //nofilter tag so this will be all blogs
        //scope.entries = [{title:"Got"}];

        ctrl = $controller('LoginController', {$scope: scope});
    }));
    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should check server for credentials if login attempted',function(){
        scope.submitAuth();


    })


})