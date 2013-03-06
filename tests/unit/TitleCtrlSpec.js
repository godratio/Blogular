/**
 * Created with JetBrains WebStorm.
 * User: RayAndAya
 * Date: 13/03/06
 * Time: 15:15
 * To change this template use File | Settings | File Templates.
 */
describe('TitleCtrl', function(){
    var scope, ctrl;


    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {


        scope = $rootScope.$new();
        //ctrl = $controller(TitleCtrl, {$scope: scope});
        ctrl = new TitleCtrl(scope);
    }));

    it('should absolutely have a title', function() {
        //spec body
        expect(scope.title.length).toBeGreaterThan(1);
    });
});