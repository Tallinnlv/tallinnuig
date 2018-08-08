let gulp = require('gulp');
let fractal = require('./fractal.js');
let path = require('path');
let cached = require('gulp-cached');
let remember = require('gulp-remember');
let sq = require('gulp-sequence');
let cottonmouth = require('@gotoandplay/cottonmouth');
let argv = require('yargs').argv;
let gulpif = require('gulp-if');
let sass = require('gulp-sass');
let postcss = require('gulp-postcss');
let sourcemaps = require('gulp-sourcemaps');
let cleanCSS = require('gulp-clean-css');
let header = require('gulp-header');
let fs = require('fs');
let autoprefixer = require('autoprefixer');
let concat = require('gulp-concat');
let stylelint = require('gulp-stylelint');

let autoPrefixerConfig = {
    browsers: ['last 2 versions', 'last 3 iOS versions', "ie >= 11"]
};

let projectName = "tallinn";
let sourcePath = 'src';
let scssSrc = sourcePath + '/**/*.scss';
let scssUtils = 'utils/styles/*.scss';
// let scssUtils = 'utils/styles/utils.scss';
// let scssTheme = 'utils/styles/theme.scss';
// let jsUtils = 'utils/js/utils.js';
let assetsSrc = sourcePath + '/**/assets/**/*';
// let iconsSrc = sourcePath + '/components/icon/svg/*.svg';
let jsSrc = sourcePath + '/**/*.js';

/* files what will be prepended in every scss file */
let sassVars = [
    // path.resolve(path.join('src', 'components', 'functions.scss')),
    path.resolve(path.join('src', 'variables.scss')),
    path.resolve(path.join('src', 'mixins.scss'))
];


let cottonmouthConfig = {
    fractal: fractal,
    // tag: argv.tag,
    // components: argv.component,
    prependComponents: ['reset', 'typography', 'icon'],
    appendComponents: ['helper'],
    sortAssets: ['scss', 'js']
};

let cleanCSSOptions = {
    processImport: false,
    rebase: false
};

let dependencies = cottonmouth(cottonmouthConfig);

//set default destination
argv.dest ? true : argv.dest = "public";

/*
Start a local Fractal instance.
*/
gulp.task('fractal:start', function () {
    const logger = fractal.cli.console;
    const server = fractal.web.server({
        sync: true
    });

    server.on('error', function (err) {
        return logger.error(err.message);
    });

    return server.start().then(function () {
        logger.success('Fractal server is now running at ' + server.url);
    });
});


/*
Build a static version of Fractal.
*/
gulp.task('fractal:build', function(cb) {
    const builder = fractal.web.builder();

    fractal.set('minify', true);

    builder.build().then(function() {
        cb();
    });
});


/**
 * Styles
 */
gulp.task('styles', function () {

    return dependencies.then( (dependencies) => {
        let paths = dependencies.paths.scss;
        let prepend = '';

        for (let i = 0; i < sassVars.length; i++) {
            prepend += fs.readFileSync(sassVars[i]);
        }

        let concatFileName = projectName + '.css';

        if (argv.minify) {
            concatFileName = projectName + '.min.css';
        }

        //set default destination
        argv.dest ? true : argv.dest = "public";

        return gulp.src(paths)
            .pipe(sourcemaps.init())
            .pipe(cached('styles'))
            .pipe(header(prepend))
            .pipe(sass({
                outputStyle: 'expanded',
                includePaths: [
                    'src/'
                ],
            }).on('error', sass.logError))
            .pipe(postcss([autoprefixer(autoPrefixerConfig)]))
            .pipe(remember('styles'))
            .pipe(concat(concatFileName))
            // .pipe(gulpif((argv.concat), concat(concatFileName)))
            .pipe(gulpif((argv.minify), cleanCSS(cleanCSSOptions)))
            .pipe(sourcemaps.write(path.join('.')))
            .pipe(gulp.dest(path.join(argv.dest, '/assets/css')));
    });
});

// Concat all components javascript
gulp.task('scripts', function() {
    let gulpImports = require('gulp-imports');

    return dependencies.then((dependencies) => {
        let paths = dependencies.paths.js;

        return gulp.src(paths)
            .pipe(sourcemaps.init())
            .pipe(gulpImports())
            .pipe(gulpif(((argv.env == 'export' && argv.concat) || argv.env != 'export'), concat(projectName+'.js')))
            .pipe(sourcemaps.write(path.join('.')))
            .pipe(gulp.dest(path.join(argv.dest, '/assets/js')));
    });
});

/*
Copy styleguide utility styles to destination folder.
*/
gulp.task('utils:styles', function() {
    let rename = require('gulp-rename');
    let concatFileName = "utils.css";

    let prepend = '';
    for (let i = 0; i < sassVars.length; i++) {
        prepend += fs.readFileSync(sassVars[i]);
    }

    return gulp.src(scssUtils)
        .pipe(sourcemaps.init())
        .pipe(header(prepend))
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(postcss([autoprefixer(autoPrefixerConfig)]))
        .pipe(concat(concatFileName))
        .pipe(gulpif((argv.minify), rename('utils.min.css')))
        .pipe(gulpif((argv.minify), cleanCSS(cleanCSSOptions)))
        .pipe(sourcemaps.write(path.join('.')))
        .pipe(gulp.dest(path.join(argv.dest, '/assets/css')));
});

gulp.task('utils',['utils:styles']);


// Lint styles
gulp.task('lint:styles', function () {
    return gulp.src(scssSrc)
        .pipe(cached('stylesLint'))
        .pipe(stylelint({
            reporters: [
                {
                    formatter: 'string',
                    console: true
                }
            ]
        }))
        .pipe(remember('stylesLint'));
});

/**
 * Assets
 */

//Copy all necessary assets to destination folder.
gulp.task('assets', function () {
    let flatten = require('gulp-flatten');

    return gulp.src(assetsSrc)
        .pipe(flatten({
            includeParents: -1
        }))
        .pipe(gulp.dest(path.join(argv.dest, '/assets')));
});

/*
Developer mode
Generate assets, start Fractal & watch for changes in source.
*/
gulp.task('dev', function (cb) {
    let sassGraph = require('sass-graph');
    // argv.dest = destinations.dev;
    // argv.env = 'dev';
    // argv.concat = true;


    let styleWatcher = gulp.watch(scssSrc, ['lint:styles', 'styles']);
    // gulp.watch(iconsSrc, ['icons']); //switch off
    gulp.watch(scssUtils, ['utils:styles']);
    gulp.watch("theme/scss/**/*.scss", ['theme:styles']);
    gulp.watch(assetsSrc, ['assets']);
    // gulp.watch(jsSrc, ['lint:scripts', 'scripts:components']);
    gulp.watch(jsSrc, ['scripts']);

    let styleGraph = sassGraph.parseDir(path.join(sourcePath));

    /**
     * If global letiable files have changed, delete style cache and recompile everything.
     */
    styleWatcher.on('change', function (event) {
        if (sassVars.includes(event.path)) {
            delete cached.caches['styles'];
        } else if (styleGraph.index[event.path] && styleGraph.index[event.path].importedBy.length) {
            let importedBy = styleGraph.index[event.path].importedBy;

            for (let i = 0; i < importedBy.length; i++) {
                delete cached.caches['styles'][importedBy[i]];
            }
        }
    });

    // sq(['clean'], ['lint', 'styles', 'scripts', 'icons', 'assets', 'utils'], ['fractal:start'])(cb);
    sq(['clean'], ['lint:styles', 'styles', 'scripts','theme:styles', 'assets','utils'], ['fractal:start'])(cb);
});

/**
 * Utils
 */
gulp.task('clean', function () {
    let del = require('del');
    // return del(argv.dest);
    return del('build');
});

gulp.task('theme:styles', function () {
    const sassGlob = require('gulp-sass-glob');

    return gulp.src('./theme/scss/theme.scss')
     /*   .pipe(stylelint({
            reporters: [{formatter: 'string', console: true}]
        }))*/
        .pipe(sassGlob())
        .pipe(sass({
            includePaths: 'node_modules'
        }).on('error', sass.logError))
        .pipe(postcss([autoprefixer(autoPrefixerConfig)]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.join(argv.dest, '/assets/css')));
});


/*
Generate assets and build Fractal.
*/
gulp.task('default', function(cb) {
    argv.dest = "public";
    argv.env = 'dev';
    argv.concat = true;
    argv.minify = true;

    dependencies.then(() => {
        // sq(['clean'], ['lint', 'styles','scripts', 'icons', 'assets', 'utils'], ['fractal:build'])(cb);
        sq(['clean'], ['lint:styles', 'styles','theme:styles','scripts', 'assets', 'utils'], ['fractal:build'])(cb);
    });
});
