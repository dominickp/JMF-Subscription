var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jasmine = require('gulp-jasmine');

// *******************************************


gulp.task('jshint', function(){
    return gulp.src(['*.js', 'tests/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jasmine', function () {
    return gulp.src('src/tests/**/*.js')
        // gulp-jasmine works on filepaths so you can't have any plugins before it
        .pipe(jasmine());
});

gulp.task('test', ['jasmine', 'jshint']);

// ***************************************

gulp.task('connect', function(){
    connect.server({
        root: 'dist',
        livereload: true
    });
});

//
//gulp.task('watch', function(){
//    gulp.watch('src/js/**/*.js', ['buildApp']);
//    gulp.watch('src/css/**/*.css', ['buildCSS']);
//    gulp.watch('src/**/*.html', ['moveHTML']);
//});

// *******************************************

gulp.task('default', ['test', 'watch', 'connect']);