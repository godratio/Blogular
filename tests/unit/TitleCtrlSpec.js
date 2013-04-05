/**
 * Created with JetBrains WebStorm.
 * User: RayAndAya
 * Date: 13/03/06
 * Time: 15:15
 * To change this template use File | Settings | File Templates.
 */
describe('TitleCtrl', function () {
    var scope, ctrl;
    beforeEach(module('Plugin.Controller.Title'));
    beforeEach(inject(function ($httpBackend, $rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('TitleCtrl', {$scope: scope});
        //ctrl = new TitleCtrl(scope);
    }));

    it('should absolutely have a title', function () {
        //spec body
        expect(scope.title.length).toBeGreaterThan(1);
    });
});