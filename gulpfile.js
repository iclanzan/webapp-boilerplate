'use strict';

var path = require('path');
var gulp = require('gulp');
var lazypipe = require('lazypipe');
var es = require('event-stream');
var cs = require('combined-stream');
var args = require('yargs').argv;

// Load plugins
var $ = require('gulp-load-plugins')();

// Load package.json
var pkg = require('./package.json');

// Environment specific configuration
var env = args.env || process.env.NODE_ENV || 'development';
var config = pkg.config = pkg.config[env];

// Error notification handler
var errorNotifier = $.notify.onError({
  title: function () {
    return pkg.name + ' error';
  },
  message: function (error) {
    console.log(error);
    return error.message || 'A task has reported errors!';
  }
});

function extname(file) {
  return path.extname(file).slice(1);
}

var stylesSrc = 'app/styles/*.scss';
var scriptsSrc = ['gulpfile.js', 'app/scripts/**/*.js', 'app/components/**/*.js', 'app/app.js'];

var connectPaths = ['.tmp/output', 'app/assets', 'app/scripts', 'app/components', 'app/bower_components', 'app'];

function styles(isBuild) {
  var stylesPipe = lazypipe()
    .pipe(gulp.src, stylesSrc)
    .pipe($.sass, {
      outputStyle: 'nested',
      includePaths: ['app/bower_components', 'app/components']
    })
    .pipe($.csslint, '.csslintrc')
    .pipe($.csslint.reporter)
    .pipe($.csslint.failReporter)
    .pipe($.autoprefixer, ['last 2 versions', 'Android 4']);

  if (isBuild) {
    stylesPipe = stylesPipe.pipe($.csso);
  }

  stylesPipe = stylesPipe
    .pipe(gulp.dest, (isBuild ? '' : '.tmp/') + 'output/styles');

  var stylesStream = stylesPipe();
  if (!isBuild) {
    stylesStream.on('error', errorNotifier);
  }

  var stream = es.merge(
    stylesStream,
    $.bowerFiles().pipe($.filter('**/*.css'))
  );

  return stream;
}

function scripts(isBuild) {
  var configPipe = lazypipe()
    .pipe(gulp.src, 'app/config.js')
    .pipe($.template, pkg)
    .pipe(gulp.dest, '.tmp/output');

  var scriptsPipe = lazypipe()
    .pipe(gulp.src, scriptsSrc)
    .pipe($.jshint, '.jshintrc')
    .pipe($.jshint.reporter, 'default')
    .pipe($.jshint.reporter, 'fail')
    .pipe($.jscs);

  var templatesPipe = lazypipe()
    .pipe(gulp.src, 'app/components/**/*.html')
    .pipe($.htmlhint, '.htmlhintrc')
    .pipe($.htmlhint.reporter)
    .pipe($.jst)
    .pipe($.declare, {
      root: 'app',
      namespace: 'templates',
      noRedeclare: true
    })
    .pipe($.concat, 'templates.js')
    .pipe(gulp.dest, isBuild ? 'output' : '.tmp/output');

  var stream = $.filter(['**/*.js', '!gulpfile.js']);

  cs.create()
    .append($.bowerFiles())
    .append(configPipe())
    .append(templatesPipe())
    .append(scriptsPipe())
    .pipe(stream);

  if (isBuild) {
    stream = stream
      .pipe($.concat('app.min.js'))
      .pipe($.uglify())
      .pipe(gulp.dest('output/scripts'));
  }

  if (!isBuild) {
    stream.on('error', errorNotifier);
  }

  return stream;
}

function injector(filepath, file) {
  switch (extname(filepath)) {
    case 'css':
      return '<style>' + file.contents + '</style>';
    case 'js':
      return '<script>' + file.contents + '</script>';
    case 'html':
      return '<link rel="import" href="' + filepath + '">';
  }
}

// Link JS and CSS inside HTML
function wire(isBuild) {
  console.log(arguments);
  var injectOptions = {
    ignorePath: connectPaths.concat('output')
  };

  if (isBuild) {
    injectOptions.transform = injector;
  }

  var pipeline = lazypipe()
    .pipe(gulp.src, 'app/*.html')
    .pipe($.htmlhint, '.htmlhintrc')
    .pipe($.htmlhint.reporter)
    .pipe($.template, pkg)
    .pipe($.filter, 'index.html')
    .pipe($.inject, es.merge(
      styles(isBuild),
      scripts(isBuild)
    ), injectOptions);

  if (isBuild) {
    pipeline = pipeline.pipe($.minifyHtml);
  }

  return pipeline.pipe(gulp.dest, isBuild ? 'output' : '.tmp/output')()
    .on('error', errorNotifier);
}

// Minify images
gulp.task('images', function () {
  return gulp.src('app/assets/**/*.{png,jpg,jpeg,gif}')
    .pipe($.cache($.imagemin({
      optimizationLevel: 7,
      pngquant: true,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('output'))
    .on('error', errorNotifier);
});

// Minify SVG files
gulp.task('svgmin', function () {
  return gulp.src('app/assets/**/*.svg')
    .pipe($.svgmin())
    .pipe(gulp.dest('output'));
});

// Copy assets that don’t need to be processed
gulp.task('copy', function () {
  return gulp.src(['app/assets/**/*.!(png|jpg|jpeg|gif|svg|md)'])
    .pipe(gulp.dest('output'));
});

// Copy fonts
gulp.task('fonts', function () {
  return $.bowerFiles()
    .pipe($.filter([
      '**/*.eot',
      '**/*.svg',
      '**/*.ttf',
      '**/*.woff'
    ]))
    .pipe($.flatten())
    .pipe(gulp.dest('output/fonts'));
});

// Clean
gulp.task('clean', function () {
  return gulp.src(['output', '.tmp/output'], {read: false})
    .pipe($.clean());
});

// Build
gulp.task('build', ['wireBuild', 'images', 'fonts', 'svgmin', 'copy']);

// Default task
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

// Connect
gulp.task('connect', function () {
  $.connect.server({
    root: connectPaths,
    host: config.connect.host,
    port: config.connect.port,
    livereload: true
  });
});

// Compile and lint stylesheets (Sass)
gulp.task('styles', styles.bind(null, false));

// Lint scripts
gulp.task('scripts', scripts.bind(null, false));

gulp.task('wireDev', wire.bind(null, false));

gulp.task('wireBuild', wire.bind(null, true));

// Open browser
gulp.task('serve', ['connect', 'wireDev'], function () {
  require('open')('http://' + config.connect.host + ':' + config.connect.port);
});

// Watch
gulp.task('watch', ['serve'], function () {
  gulp.watch([
    'app/{assets,scripts}/**/*',
    'app/components/**/*.js',
    '.tmp/output/**/*'
  ], function (event) {
    return gulp.src(event.path)
      .pipe($.connect.reload());
  });

  gulp.watch([stylesSrc, 'app/components/**/*', scriptsSrc, 'app/index.html', 'bower.json'], ['wireDev']);
});

// Bump app version
function bump(type) {
  return gulp.src(['package.json', 'bower.json'])
    .pipe($.bump({type: type}))
    .pipe(gulp.dest('./'));
}

gulp.task('bump', bump.bind(null, 'patch'));
gulp.task('bump-minor', bump.bind(null, 'minor'));
gulp.task('bump-major', bump.bind(null, 'major'));

gulp.task('rename', function () {
  return gulp.src(['package.json', 'bower.json'])
    .pipe($.jsonEditor({name: path.basename(__dirname)}))
    .pipe(gulp.dest('./'));
});

// Create zip archive
gulp.task('zip', ['build'], function () {
  return gulp.src('output/**/*')
    .pipe($.zip(pkg.name + '-' + pkg.version + '.zip'))
    .pipe(gulp.dest('archives'));
});
