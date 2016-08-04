import { argv } from 'yargs'
import config from '../config'
import webpackConfig from './webpack.config'
import _debug from 'debug'

const debug = _debug('app:karma')
debug('Create configuration.')

function removeAllValuesFromAry(ary, val) {
  let jj = 0
  for (let element of ary) {
    if (element !== val) {
      ary[jj++] = element
    }
  }
  ary.length = jj
}

const karmaConfig = {
  basePath: '../', // project root in relation to bin/karma.js
  files: [
    {
      pattern: `./${config.dir_test}/test-bundler.js`,
      watched: false,
      served: true,
      included: true
    },
    {
      pattern:  './tests/resources/**/*.json',
      watched:  true,
      served:   true,
      included: true
    }
  ],
  mochaReporter:            {
    showDiff:      true,
    output:        'full', // 'autowatch'
    ignoreSkipped: true,
    colors:        {
      success: 'blue',
      info:    'green',
      warning: 'cyan',
      error:   'red'
    }
  },
  client:                   {
    mocha: {
      // change Karma's debug.html to the mocha web reporter so that you
      // can see and rerun individual tests in the Karma [DEBUG] tab in
      // Chrome or Firefox.
      reporter: 'html'

      // Which tests are run by mocha is an intersection of this 'grep' and
      // test-bundler.js:testsContext.  Changing 'grep' requires the TDD, continuous
      // running tests to be restarted whereas changing test-bundler.js:testsContext
      // will be reflected immediately.
      //
      // grep: "loadAddressesData"
    }
  },
  singleRun: !argv.watch,
  frameworks: ['mocha'],
  reporters: ['mocha'],
  preprocessors: {
    [`${config.dir_test}/test-bundler.js`]: ['webpack'],
    './tests/resources/**/*.json':          ['json_fixtures']
  },
  jsonFixturesPreprocessor: {
    // strip this from the file path \ mock data name
    stripPrefix:       'tests/resources/mockdata',
    // strip this to the file path \ fixture name
    // prependPrefix:     'mock/',
    // change the global fixtures variable name
    variableName:      '__mockData__',
    // camelize fixture filenames (e.g 'fixtures/aa-bb_cc.json' becomes
    // __fixtures__['fixtures/aaBbCc'])
    camelizeFilenames: true
    // transform the filename
    // transformPath:     function(path) {
    //  return path + '.js'
    // }
  },
  captureTimeout:           60000,
  retryLimit:               4,
  browserComment_0:         'karma may not wait long enough for Chrome to start prior to retrying.',
  browserComment_1:         'https://github.com/karma-runner/karma/issues/2116',
  browsers:                 [ /* 'SlimerJS', 'Chrome', 'IE', 'PhantomJS' */ 'Firefox'],
  webpack:                  {
    devtool:    'cheap-module-source-map',
    resolve:    {
      ...webpackConfig.resolve,
      alias: {
        ...webpackConfig.resolve.alias,
        sinon: 'sinon/pkg/sinon.js'
      }
    },
    plugins: webpackConfig.plugins,
    module: {
      noParse: [
        /\/sinon\.js/
      ],
      loaders: webpackConfig.module.loaders.concat([
        {
          test: /sinon(\\|\/)pkg(\\|\/)sinon\.js/,
          loader: 'imports?define=>false,require=>false'
        }
      ])
    },
    // Enzyme fix, see:
    // https://github.com/airbnb/enzyme/issues/47
    externals: {
      ...webpackConfig.externals,
      'react/addons': true,
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': 'window'
    },
    sassLoader: webpackConfig.sassLoader
  },
  webpackMiddleware: {
    noInfo: true
  },
  coverageReporter: {
    reporters: config.coverage_reporters
  }
}

debug('Create coverage configuration.')
// TODO: Checkout babel-plugin-__coverage__ or babel-plugin-istanbul
// to replace mothballed isparta.
// TODO: Checkout https://github.com/caitp/karma-coveralls to publish
// 'lcov' coverage report to http://coveralls.io
if (config.globals.__COVERAGE__) {
  karmaConfig.reporters.push('coverage')

  // SlimerJS doesn't work with coverage.
  // TODO: Recheck SlimerJS after the mothballed isparta is replaced
  // with babel-plugin-__coverage__ or babel-plugin-istanbul
  removeAllValuesFromAry(karmaConfig.browsers, 'SlimerJS')
  if (!karmaConfig.browsers.length) {
    karmaConfig.browsers.push('PhantomJS')
  }
  karmaConfig.webpack.module.preLoaders = [{
    test: /\.(js|jsx)$/,
    include: new RegExp(config.dir_client),
    loader: 'isparta',
    exclude: /node_modules/
  }]
}

// cannot use `export default` because of Karma.
module.exports = (cfg) => cfg.set(karmaConfig)
