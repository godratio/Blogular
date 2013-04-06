//im aware this is ultra trival... just building confidence... dont judge me ;)
describe('showFactory Test: ',function(){
    beforeEach(module('blogApp'));
    it('should be initialized as false',inject(function(show){
        expect(show.state).toBeFalsy();
    }));
    it('should change to true if change to... true',inject(function(show){
        show.state = true;
        expect(show.state).toBeTruthy();
    }))
})