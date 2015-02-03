var gulp       = require('gulp'),
    fs         = require('fs'),
    browserify = require('browserify'),
    moment     = require('moment'),
    uglify     = require('gulp-uglify'),
    gzip       = require('gulp-gzip'),
    header     = require('gulp-header'),
    buffer     = require('vinyl-buffer'),
    collapse   = require('bundle-collapser/plugin'),
    source     = require('vinyl-source-stream'),
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

var banner = function() {
    var head = [
        '/*! ${title} - v${version} - ${date} %>\n',
        ' * ${homepage}\n',
        ' * Copyright (c) 2013-${year} ${author}; License: ${license} */\n'
    ].join('');

    return header(head, {
        title:    pkg.title || pkg.name,
        version:  pkg.version,
        date:     moment().format('YYYY-MM-DD'),
        homepage: pkg.homepage,
        author:   pkg.author.name,
        year:     moment().format('YYYY'),
        license:  pkg.license
    });
};

var build = function() {
    return browserify('./src/index.js', {
            standalone: 'signal',
            debug: false
        })
        .plugin(collapse)
        .bundle();
};

var min = function() {
    return build()
        .pipe(source('signal.min.js'));
};

gulp.task('build', function() {
    build()
        .pipe(source('signal.js'))
        .pipe(buffer())
        .pipe(banner())
        .pipe(gulp.dest('./'));
});

gulp.task('min', function() {
    min()
        .pipe(buffer())
        .pipe(uglify(UGLIFY_OPTS))
        .pipe(banner())
        .pipe(gulp.dest('./'));
});

gulp.task('zip', function() {
    min()
        .pipe(gzip({ append: true }))
        .pipe(gulp.dest('./'));
});

gulp.task('release', function() {
    gulp.start([
        'build',
        'min',
        'zip'
    ]);
});

gulp.task('test', function() {
    var path     = require('path'),
        nodeunit = require('nodeunit').reporters.default,
        dir      = require('node-dir');

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