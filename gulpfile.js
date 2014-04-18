'use strict';

var gulp = require('gulp');
var run = require('open');
var wiredep = require('wiredep').stream;
var pipe = require('multipipe');

// Load plugins
var $ = require('gulp-load-plugins')();

// Load package.json
var pkg = require('package.json');

var reporter = function (property) {
  return $.notify({
    title: function (file) {
      return file[property].errorCount + ' error(s): ' + property;
    },
    message: function (file) {
      if (file.success) {
        return false;
      }

      return file[property].results.map(function (result) {
        console.log(Object.keys(result.error));
        return result.relative + '\n' + '[' + result.error.line + ':' + result.error.character + '] ' + result.error.reason;
      }).join('\n');
    },
    onLast: true
  });
};

var notifier = $.notify({
  title: function () {
    return pkg.name + ' notification';
  },
  message: function (file) {
    return 'Tasks completed successfully.';
  },
  onLast: true
});

var errorNotifier = $.notify.onError({
  title: function () {
    return pkg.name + ' error';
  },
  message: function (error) {
    return 'Plugin ' + error.plugin + ' reported erors!';
  }
});



// Styles (Sass)
gulp.task('styles', function () {
  return pipe(
    gulp.src('app/styles/main.scss'),
    $.sass({
      style: 'expanded',
      loadPath: ['app/bower_components']
    }),
    $.csslint('.csslintrc'),
    $.csslint.reporter(),
    $.autoprefixer('last 2 versions'),
    gulp.dest('app/styles'),
    $.size()
  )
  .on('error', errorNotifier);
});

// Scripts
gulp.task('scripts', function () {
  return pipe(
    gulp.src(['gulpfile.js', 'app/scripts/**/*.js']),
    $.jshint('.jshintrc'),
    $.jscs(),
    $.jshint.reporter('default'),
    $.size()
  )
  .on('error', errorNotifier);
});

// Content (Markdown)
gulp.task('content', function () {
  return gulp.src('app/content/**/*.md')
    .pipe($.markdown())
    .pipe(gulp.dest('dist'));
});

// HTML
gulp.task('html', ['styles', 'scripts'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return pipe(
    gulp.src('app/*.html'),
    $.useref.assets(),
    jsFilter,
    $.uglify(),
    jsFilter.restore(),
    cssFilter,
    $.csso(),
    cssFilter.restore(),
    $.useref.restore(),
    $.useref(),
    gulp.dest('dist'),
    $.size()
  )
  .on('error', errorNotifier);
});

// Images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
});

// Fonts
gulp.task('fonts', function () {
  return $.bowerFiles()
    .pipe($.filter([
      '**/*.eot',
      '**/*.svg',
      '**/*.ttf',
      '**/*.woff'
    ]))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size());
});

// Clean
gulp.task('clean', function () {
  return gulp.src(['dist/styles', 'dist/scripts', 'dist/images', 'dist/fonts'], {read: false}).pipe($.clean());
});

// Build
gulp.task('build', ['html', 'images', 'fonts']);

// Default task
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

// Connect
gulp.task('connect', function () {
  $.connect.server({
    root: ['app'],
    host: '0.0.0.0',
    port: 9000,
    livereload: true
  });
});

// Open
gulp.task('serve', ['connect', 'styles'], function () {
  run('http://0.0.0.0:9000');
});

// Inject Bower components
gulp.task('wiredep', function () {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      directory: 'app/bower_components',
      ignorePath: 'app/bower_components/'
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      directory: 'app/bower_components',
      ignorePath: 'app/'
    }))
    .pipe(gulp.dest('app'));
});

// Watch
gulp.task('watch', ['connect', 'serve'], function () {
  // Watch for changes in `app` folder
  gulp.watch([
    'app/*.html',
    'app/styles/**/*.scss',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ], function (event) {
    return gulp.src(event.path)
      .pipe($.connect.reload());
  });

  // Watch .scss files
  gulp.watch('app/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('app/scripts/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch('app/images/**/*', ['images']);

  // Watch bower files
  gulp.watch('bower.json', ['wiredep']);
});
