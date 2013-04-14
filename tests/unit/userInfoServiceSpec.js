describe('UserInfoService tests:',function(){
    beforeEach(module('blogApp'));
    var userInfoService;
    beforeEach(inject(function($injector){
        userInfoService = $injector.get('userInfoService');
    }))
    it('initailizes a username to Guest and can get that username',function(){
        expect(userInfoService.getUsername()).toBe('Guest');
    });
    it('sets a username',function(){
        userInfoService.setUsername('test');
        expect(userInfoService.getUsername()).toBe('test');
    });
})