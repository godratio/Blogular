describe('PhoneCat App', function() {

    describe('Phone list view', function() {

        beforeEach(function() {
            browser().navigateTo('../index.html');
        });

        it('1 is 1', function() {
            expect({value: 1}).toBe(1);
        });
/*
        it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
            expect(browser().location().url()).toBe("/");
        });
    */
    });
});