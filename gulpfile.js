var gulp       = require('gulp'),
    moment     = require('moment'),
    uglify     = require('gulp-uglify'),
    gzip       = require('gulp-gzip'),
    rename     = require('gulp-rename'),
    header     = require('gulp-header'),
    pkg        = require('./package.json'),
    UGLIFY_OPTS = {
        fromString: true,
        mangle: {
            sort:     true,
            toplevel: true,
            eval:     true
        },
        compress: {
            screw_ie8:    true,
            properties:   true,
            unsafe:       true,
            sequences:    true,
            dead_code:    true,
            conditionals: true,
            booleans:     true,
            unused:       true,
            if_return:    true,
            join_vars:    true,
            drop_console: true,
            comparisons:  true,
            loops:        true,
            cascade:      true,
            warnings:     true,
            negate_iife:  true,
            pure_getters: true
        }
    };

gulp.task('min', function() {
    gulp.src('signal.js')
        .pipe(uglify(UGLIFY_OPTS))
        .pipe(rename('signal.min.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('zip', function() {
    gulp.src('signal.min.js')
        .pipe(gzip({ append: true }))
        .pipe(gulp.dest('./'));
});

gulp.task('banner', function() {
    var banner = [
        '/*! ${title} - v${version} - ${date} %>\n',
        ' * ${homepage}\n',
        ' * Copyright (c) 2013-${year} ${author}; License: ${license} */\n'
    ].join('');

    gulp.src('signal.min.js')
        .pipe(header(banner, {
            title:    pkg.title || pkg.name,
            version:  pkg.version,
            date:     moment().format('YYYY-MM-DD'),
            homepage: pkg.homepage,
            author:   pkg.author.name,
            year:     moment().format('YYYY'),
            license:  pkg.license
        }))
        .pipe(gulp.dest('./'));

});


gulp.task('default', function() {
    gulp.start([
        'min',
        'zip',
        'banner'
    ]);
});

gulp.task('test', function() {
    var path = require('path'),
        nodeunit = require('nodeunit').reporters.default,
        dir = require('node-dir');

    var normalizeFilePaths = function(files) {
        return files.map(function(file) {
            var normalPath = path.normalize(path.relative(__dirname, file)),
                properPath = normalPath.split(path.sep).join('/'),
                relativePath = './' + properPath;
            return relativePath;
        });
    };

    dir.files('./test', function(err, files) {
        if (err) { throw err; }

        files = normalizeFilePaths(files);
        nodeunit.run(files);
    });

});