describe('UserInfoCtrlSpec tests: ',function(){
    beforeEach(module('blogApp'));
    var scope,ctrl,$httpBackend;
    beforeEach(inject(function($injector,$controller,$rootScope){
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.when('POST','/logout').
            respond(410);
        scope = $rootScope.$new();
        ctrl = $controller('UserInfoCtrl',{$scope:scope});

    }));
    it('should set username on init',function(){
        expect(scope.username).toBeDefined();
    });
    it('should attempt to logout on call of logout function',function(){
        $httpBackend.expectPOST('/logout').respond('410');
    });
})