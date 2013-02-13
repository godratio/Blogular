'use strict';

/* jasmine specs for controllers go here */

describe('TitleCtrl', function(){
    var scope, ctrl;


    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {


        scope = $rootScope.$new();
        ctrl = $controller(TitleCtrl, {$scope: scope});
    }));

    it('should absolutely have a title', function() {
        //spec body
        expect(scope.title.length).toBeGreaterThan(1);
    });
});

describe('BlogListCtrl test: ',function(){
    beforeEach(module('blogResource'));
    var scope, ctrl, $httpBackend;
    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
        $httpBackend = _$httpBackend_;
        $httpBackend.expectGET('/blog').
            respond([{title: 'Got'}, {title: 'Blog'}]);

        scope = $rootScope.$new();
        ctrl = $controller(ContentCtrl, {$scope: scope});
        $httpBackend.flush();
    }));

    it('should create "phones" model with 2 phones fetched from xhr', function() {
        expect(scope.entries[0].title).toEqual('Got');
    });
})

describe('blogEntryCtrl test: ',function(){
    beforeEach(module('blogResource'));
    var scope, ctrl, $httpBackend;
    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
        $httpBackend = _$httpBackend_;
        $httpBackend.expectGET('/blog').
            respond([{title: 'Got',text:'blah'}]);

        scope = $rootScope.$new();
        ctrl = $controller(blogEntryCtrl, {$scope: scope});
        $httpBackend.flush();
    }));

    it('should create "blog" model fetched from xhr', function() {
        expect(scope.entry[0].title).toEqual('Got');
        expect(scope.text).toEqual('blah');

    });
})


//TODO:properly create a test for $resources
//TODO:create a test for main app mdules to test for existence of modules to be used
describe('blogResource test', function(){
    describe('when I call blogResource', function(){
        beforeEach(module('blogResource'));
        it('it should exist',expect(blogResource).toBeTruthy());
    });

});

