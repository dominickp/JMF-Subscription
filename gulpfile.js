var gulp = require('gulp');
var jshint = require('gulp-jshint');

// *******************************************

gulp.task('karma', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('jshint', function(){
    return gulp.src(['*.js', 'tests/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', ['karma', 'jshint']);

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