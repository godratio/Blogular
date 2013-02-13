basePath = '../';

files = [
    ANGULAR_SCENARIO,
    ANGULAR_SCENARIO_ADAPTER,
    'tests/lib/angular/angular-scenario.js',
    'public/e2e/scenario.js'
];

autoWatch = false;


browsers = ['C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe'];

singleRun = true;

proxies = {
    '/': 'http://localhost:8000/'
};

junitReporter = {
    outputFile: 'test_out/e2e.xml',
    suite: 'e2e'
};
