
describe('blogEntryCtrl test: ', function () {
    beforeEach(module('blogApp'));
    var io = io;
    var scope, ctrl, $httpBackend;
    beforeEach(inject(function ($rootScope, $controller, $injector) {
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.when('GET', '/blog')
            .respond(
                [
                    {title: 'Got', author: 'Ray Garner',
                        categories: [
                            {name: 'category'}
                        ],
                        comments: [
                            { body: 'commentbody', date: Date.now(), username: 'raygarner' }
                        ]
                    }
                ]
            );
        $httpBackend.when('GET', '/blog/:id')
            .respond(
                [
                    {title: 'Got', author: 'Ray Garner', categories: [
                        {name: 'categoryID'}
                    ],
                        comments: [
                            { body: 'commentbody', date: Date.now(), username: 'raygarner' }
                        ]}
                ]
            );

        scope = $rootScope.$new();
        scope.entry = "";
        ctrl = $controller('blogEntryCtrl', {$scope: scope});
    }));

    it('should create "blog" model fetched from xhr', function () {
        $httpBackend.flush();
        expect(scope.entry.title).toBeDefined();
        expect(scope.text).toBeUndefined();

    });

    it('should properly submit comment', function () {
        console.log("submit comment");
        $httpBackend.flush();

        scope.entry.comments = [];
        console.log(scope.entry.comments);
        scope.entry.comments.push({ body: 'commentbody', date: Date.now(), username: 'raygarner' });

        scope.body = "new comment";
        $httpBackend.expectPOST('/blog').respond(200);

        scope.submitComment();
        $httpBackend.flush();
        //should have a new comment at last position order
        expect(scope.entry.comments[1].body).toBe('commentbody');
        //body should be cleared
        expect(scope.body).toBe("");
    });
    //TODO:write unit test for event emitters and listenrs here
});

