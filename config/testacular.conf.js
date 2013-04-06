// Testacular configuration
// Generated on Mon Feb 11 2013 08:33:19 GMT+0900 (Tokyo Standard Time)


// base path, that will be used to resolve files and exclude
basePath = '../';


// list of files / patterns to load in the browser
files = [
    JASMINE,
    JASMINE_ADAPTER,
    'public/javascripts/angular/angular.js',
    // 'public/javascripts/angular/angular-*.js',
    'public/javascripts/angular/angular-resource.js',
    'public/javascripts/angular/angular-mocks.js',
    'public/javascripts/external/scope.onready.js',
    'public/javascripts/app/*.js',
    'public/javascripts/external/*/*.js',
    'public/javascripts/external/angular-http-auth.js',
    'public/javascripts/external/socketmodule.js',


    'tests/unit/controllerSpec.js',
    'tests/unit/TitleCtrlSpec.js' ,
    'tests/unit/blogListCtrlSpec.js'

];


// list of files to exclude
exclude = [

];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['dots'];


// web server port
port = 8085;


// cli runner port
runnerPort = 9101;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
//browsers = ['C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'];
browsers = ['Chrome'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 5000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
