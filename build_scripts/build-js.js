const gulp = require('gulp')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default

gulp.src([
  "./src/js/*.js",

])
.pipe(concat('bundle.min.js'))
.pipe(uglify({ mangle: false }))
.pipe(gulp.dest('./public/js'))
