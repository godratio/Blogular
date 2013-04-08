describe('RegisterCtrl tests: ',function(){
    beforeEach(module('blogApp'));
    var ctrl,$httpBackend,scope;
    beforeEach(inject(function($rootScope,$controller,$injector){
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.when('POST','/register').
            respond(200);

         scope = $rootScope.$new();
        ctrl = $controller('RegisterCtrl',{$scope:scope});
    }));
    it('should submit registration',function(){
        $httpBackend.expectPOST('/register').respond(200,{success:'test'});
        scope.submitRegi();
        $httpBackend.flush();

    });

    it('should set message upon failure of registration',function(){
        $httpBackend.expectPOST('/register').respond(200,{'fail':'some error message'});
        scope.submitRegi();
        $httpBackend.flush();
        expect(scope.message).toBeDefined();
    });

    it('should set message upon total failure of request',function(){
        $httpBackend.expectPOST('/register').respond(41);
        scope.submitRegi();
        $httpBackend.flush();
        expect(scope.message).toBeDefined();
    });
})