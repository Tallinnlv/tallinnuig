'use strict';
const theme = require('guadalupe');
// const theme = require('@frctl/mandelbrot');
// const theme = require('sidewinder');

const hbs = require('@frctl/handlebars')({
    helpers: {
        default: function(param, defaultValue) {
            // helper for adding param with default value
            if (typeof param === 'undefined') {
                return defaultValue;
            } else {
                return param;
            }
        },
        uppercase: function(str) {
            return str.toUpperCase();
        },
        concat: function(x, y) {
            x = x ? x : '';
            y = y ? y : '';

            return x + ' ' + y;
        },
        cond: function(v1, operator, v2){
            switch (operator) {
                case '<':
                    return (v1 < v2);
                case '>':
                    return (v1 > v2);
                case '<=':
                    return (v1 <= v2);
                case '>=':
                    return (v1 >= v2);
                case '==':
                    return (v1 == v2);
                case '%':
                    return (v1 % v2)
            }
        },
        attr: function() {
            let ret = '';
            let prefix = 'attr-';
            let p = this;

            for (let key in p) {
                if (p.hasOwnProperty(key) && key.startsWith(prefix) && p[key]) {
                    ret += key.replace(prefix, '');
                    if (typeof p[key] === 'string') {
                        ret += '="' + p[key].replace(/"/g, '&quot;') + '"';
                    }
                    ret += ' ';
                    delete p[key];
                }
            }

            return ret;
        },
    }
    /* other configuration options here */
});

/* Create a new Fractal instance and export it for use elsewhere if required */
const fractal = module.exports = require('@frctl/fractal').create();
fractal.components.engine(hbs); /* set as the default template engine for components */
fractal.docs.engine(hbs); /* you can also use the same instance for documentat


/* Set the title of the project */
fractal.set('project.title', 'TallinnUIG Component Library');

/* Tell Fractal where the components will live */
fractal.components.set('path', __dirname + '/src');
fractal.components.set('default.preview', '@preview');
fractal.components.set('label', 'Komponendid');

/* Tell Fractal where the documentation pages will live */
fractal.docs.set('path', __dirname + '/docs');
fractal.docs.set('label', 'Dokumentatsioon');
fractal.docs.set('indexLabel', 'index');
// fractal.docs.set('markdown', false);
// fractal.docs.set('ext', '.hbs');


/*
 * Configuring the web UI
 */
// static assets path.
fractal.web.set('static.path', __dirname + '/public');
// static build path
fractal.web.set('builder.dest', __dirname + '/build');

/*
 * Fractal Web Theme settings
 */
const projectTheme = theme(
    {
        "styles": [
            "default",
            "/assets/css/tallinn.css",
            "/assets/css/theme.css",
            "/assets/css/utils.css"
        ],
        "scripts": [
            "default",
            "/assets/js/tallinn.js"
        ]
        // , "panels": ["preview","html"]
    }
);

projectTheme.addLoadPath(__dirname + '/theme/views');

fractal.web.theme(projectTheme);