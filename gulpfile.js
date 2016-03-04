'use strict';

// Dependencies
var gulp = require('gulp');
var cached = require('gulp-cached');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var order = require('gulp-order');
var reload = require('gulp-livereload');
var plumber = require('gulp-plumber');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');

var commander = require('commander');
var connect = require('connect');
var fs = require('fs');
var http = require('http');
var Q = require('q');
var runSequence = require('run-sequence');
var spawn = require('cross-spawn-async').spawn;

// Configuration
var watching = false;
var options = commander
  .option('-p, --port [port]', 'web server port', 8000)
  .parse(process.argv);

// Tasks
gulp.task('default', function(cb) {
  runSequence('run', cb);
});

gulp.task('run', function(cb) {
  runSequence('install', 'watch', 'serve', cb);
});

gulp.task('watch', ['build'], function() {
  watching = true;

  gulp.watch(['src/index.html'], ['index']);
  gulp.watch(['src/content/**/*'], ['assets']);
  gulp.watch(['src/**/*.html'], ['templates']);
  gulp.watch(['src/**/*.sass', 'src/**/*.scss'], ['styles']);
});

gulp.task('build', function(cb) {
  runSequence('clean', ['assets', 'templates', 'styles'], 'index', cb);
});

gulp.task('install', function(cb) {
  spawn('bower', ['update', '--quiet'], {stdio: 'inherit'}).on('exit', cb);
});

gulp.task('clean', function(cb) {
  var del = require('del');

  del(['dist/content'], cb);
});

gulp.task('index', function() {
  var inject = require('gulp-inject');

  return gulp.src('src/index.html')
    .pipe(inject(gulp.src(['dist/*.js', 'dist/*.css'], {read: false}), {
      ignorePath: ['dist'],
      addRootSlash: false
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('assets', function() {
  return gulp.src('src/content/**/*')
    .pipe(gulp.dest('dist/content'));
});

gulp.task('templates', function() {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('styles', function() {
  var bourbon = require('node-bourbon');
  var sass = require('gulp-sass');

  return gulp.src(['src/**/*.sass', 'src/**/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: bourbon.includePaths
    }).on('error', onError))
    .pipe(sourcemaps.write('.', {sourceRoot: '../src'}))
    .pipe(gulp.dest('dist'))
    .pipe(filter('**/*.css'))
    .pipe(reload());
});

gulp.task('serve', serve);

gulp.task('list', function() {
  var taskListing = require('gulp-task-listing');

  taskListing();
});

// Helpers
function onError(e) {
  gutil.log(gutil.colors.red('Error in plugin'), '\'' + gutil.colors.cyan(e.plugin) + '\'');

  console.log('Message:');
  console.log(e.message);

  if (watching) {
    this.emit('end');
  } else {
    throw e;
  }
}

function onFileChange(e) {
  if (e.type === 'deleted') {
    delete cached.caches.jslint[e.path];
  }
}

function fallback(url) {
  return function(req, res) {
    return fs.createReadStream(url).pipe(res);
  };
}

function serve() {
  var livereload = require('connect-livereload');
  var modrewrite = require('connect-modrewrite');
  var serveStatic = require('serve-static');
  var app = connect();
  var root = '';

  reload.listen();

  app.use(root, livereload());
  app.use(root, serveStatic('dist'));
  app.use(root, fallback('dist/index.html'));

  return start(app, options.port, 'Server started http://localhost:' + options.port, function() {
    reload.server.close();
  });
}

function start(app, port, message, onClose) {
  var deferred = Q.defer();
  var server = app.listen(port, function(err) {
    if (err) {
      deferred.reject();
    } else {
      gutil.log(gutil.colors.green(message));
      deferred.resolve(server);
    }
  });

  server.on('close', onClose || function() {});

  return deferred.promise;
}
