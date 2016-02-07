const gulp = require('gulp')
const babel = require('gulp-babel')
const install = require('gulp-install')
const zip = require('gulp-zip')

// first run the 'config' and 'deps' tasks
// then compile ./src/index.js
// put the output in ./build/index.js
gulp.task('build', ['config', 'deps'], function () {
  return gulp.src('src/*.js')
         .pipe(babel({
           presets: ['es2015']
         }))
         .pipe(gulp.dest('build'))
})

// copy ./config.json into ./build
gulp.task('config', function (cb) {
  return gulp.src('./config.json')
         .pipe(gulp.dest('build'))
})

// `npm install --production` into ./build
gulp.task('deps', function (cb) {
  return gulp.src('./package.json')
         .pipe(gulp.dest('build'))
         .pipe(install({production: true}))
})

// first run the 'build' task
// then zip everything in ./build
// put the output in ./dist/aws.zip
gulp.task('zip', ['build'], function (cb) {
  return gulp.src('build/**/*')
         .pipe(zip('aws.zip'))
         .pipe(gulp.dest('dist'))
})

// make 'zip' the default task
gulp.task('default', ['zip'])

