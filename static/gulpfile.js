const gulp = require("gulp");
const jspm = require('gulp-jspm-build');

gulp.task('jspm', function(){
return jspm({
        config: "config.js",
		//bundleSfx: true,
        bundleOptions: {
            minify: false,
            mangle: false,
            sourceMaps: true
        },
        bundles: [
            {
                src: "app/main",
                dst: "main-build.js",
                options: {
                    minify: true,
                    mangle: false,
                    sourceMaps: true
                }
            }
        ]
    })
    .on("error", function (error) {
        console.log(error);
    })
    .pipe(gulp.dest("./"));
});
