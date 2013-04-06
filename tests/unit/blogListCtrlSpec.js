//are these test testing anything useful?
describe('BlogListCtrl test: without filter ', function () {
    beforeEach(module('Plugin.Controller.BlogEntries'));
    beforeEach(module('blogApp'));
    var scope, ctrl, $httpBackend;
    beforeEach(inject(function ($rootScope, $controller, $routeParams, $injector) {
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.when('GET', '/lastUpdateSame').
            respond(
            {result: false}
        );
        $httpBackend.when('GET', '/blog')
            .respond(
                [
                    {title: 'Got', author: 'Ray Garner', categories: [
                        {name: 'category'}
                    ]}
                ]
            );
        $httpBackend.when('GET', '/blog/:id')
            .respond(
                [
                    {title: 'Got', author: 'Ray Garner', categories: [
                        {name: 'categoryID'}
                    ]}
                ]
            );
        $routeParams.name = undefined;

        scope = $rootScope.$new();
        //nofilter tag so this will be all blogs
        //scope.entries = [{title:"Got"}];

        ctrl = $controller('ContentCtrl', {$scope: scope});
    }));
    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
    it('filterTag should be undefined ', function () {
        expect(scope.filterTag).toBeUndefined();
        $httpBackend.flush();
    });
    it('should call getEntries and entries should be loaded if any', function () {
        scope.getEntries();
        $httpBackend.flush();
        expect(scope.entries).toBeDefined();
        expect(scope.categories).toBeDefined();
    });

    /*
     it('should respond with Got', function () {
     expect(scope.entries[0].title).toEqual('Got');
     });
     */
})

describe('BlogListCtrl test: with filter ', function () {
    describe('lastupdate false', function () {
        beforeEach(module('Plugin.Controller.BlogEntries'));
        beforeEach(module('blogApp'));
        var scope, ctrl, $httpBackend;
        beforeEach(inject(function ($rootScope, $controller, $routeParams, $injector) {
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', '/lastUpdateSame').
                respond(
                {result: false}
            );
            $httpBackend.when('GET', '/blog')
                .respond(
                    [
                        {title: 'Got', author: 'Ray Garner', categories: [
                            {name: 'category'}
                        ]}
                    ]
                );
            $httpBackend.when('GET', '/blog/:id')
                .respond(
                    [
                        {title: 'Got', author: 'Ray Garner', categories: [
                            {name: 'categoryID'}
                        ]}
                    ]
                );
            $routeParams.name = 'name';

            scope = $rootScope.$new();
            //nofilter tag so this will be all blogs
            //scope.entries = [{title:"Got"}];

            ctrl = $controller('ContentCtrl', {$scope: scope});
        }));
        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
        it('filterTag should be defined ', function () {
            expect(scope.filterTag).toBeDefined();
            $httpBackend.flush();
        });
        it('should call getEntries and entries should be loaded if any', function () {
            $httpBackend.flush();
            expect(scope.entries).toBeDefined();
            expect(scope.filterTag).toBeDefined();
        });

        /*
         it('should respond with Got', function () {
         expect(scope.entries[0].title).toEqual('Got');
         });
         */
    });
    describe('lastupdate true', function () {
        beforeEach(module('Plugin.Controller.BlogEntries'));
        beforeEach(module('blogApp'));
        var scope, ctrl, $httpBackend;
        beforeEach(inject(function ($rootScope, $controller, $routeParams, $injector) {
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', '/lastUpdateSame').
                respond(
                {result: true}
            );
            $httpBackend.when('GET', '/blog')
                .respond(
                    [
                        {title: 'Got', author: 'Ray Garner', categories: [
                            {name: 'category'}
                        ]}
                    ]
                );
            $httpBackend.when('GET', '/blog/:id')
                .respond(
                    [
                        {title: 'Got', author: 'Ray Garner', categories: [
                            {name: 'categoryID'}
                        ]}
                    ]
                );
            $routeParams.name = 'name';

            scope = $rootScope.$new();
            //nofilter tag so this will be all blogs
            //scope.entries = [{title:"Got"}];

            ctrl = $controller('ContentCtrl', {$scope: scope});
        }));
        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
        it('filterTag should be defined ', function () {
            expect(scope.filterTag).toBeDefined();
            $httpBackend.flush();
        });
        it('should call getEntries and entries should be loaded if any', function () {
            $httpBackend.flush();
            expect(scope.entries).toBeDefined();
            expect(scope.filterTag).toBeDefined();
        });

        /*
         it('should respond with Got', function () {
         expect(scope.entries[0].title).toEqual('Got');
         });
         */
    });
})

describe('blogEntryCtrl test: ', function () {
    beforeEach(module('blogResource'));
    beforeEach(module('blogApp'));
    var scope, ctrl, $httpBackend;
    beforeEach(inject(function ($httpBackend, $rootScope, $controller) {
        $httpBackend = $httpBackend;
        $httpBackend.expectGET('/blog').
            respond([
                {title: 'Got', text: 'blah'}
            ]);

        scope = $rootScope.$new();
        ctrl = $controller(blogEntryCtrl, {$scope: scope});
        $httpBackend.flush();
    }));

    it('should create "blog" model fetched from xhr', function () {
        expect(scope.entry[0].title).toEqual('Got');
        expect(scope.text).toEqual('blah');

    });
})


//TODO:properly create a test for $resources
//TODO:create a test for main app mdules to test for existence of modules to be used
/*
describe('blogResource test', function () {
    describe('when I call blogResource', function () {
        beforeEach(module('blogResource'));
        it('it should exist', expect(blogResource).toBeTruthy());
    });

});

*/
