describe('LoginCtrl tests: ',function(){
    beforeEach(module('blogApp'));
    var scope,ctrl,$httpBackend;
    beforeEach(inject(function ($rootScope, $controller, $routeParams, $injector) {
        $httpBackend = $injector.get('$httpBackend');

        $httpBackend.when('POST', '/login')
            .respond(
                [
                    {title: 'Got', author: 'Ray Garner', categories: [
                        {name: 'categoryID'}
                    ]}
                ]
            );


        scope = $rootScope.$new();
        scope.form = {};
        //nofilter tag so this will be all blogs
        //scope.entries = [{title:"Got"}];

        ctrl = $controller('LoginController', {$scope: scope});
    }));
    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
    it('should set login attempt to true',function(){
        scope.form.username = "test";

        scope.submitAuth();
        $httpBackend.flush();
        expect(scope.loginAttempt).toBeTruthy();
    });
    it('should check server for credentials if login attempted',function(){
        $httpBackend.expectPOST('/login').
            respond(200);
        scope.submitAuth();
        $httpBackend.flush();
        expect(scope.form.username).toBe("");
        expect(scope.form.password).toBe("");

    });


})