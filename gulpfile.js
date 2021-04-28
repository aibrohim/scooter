var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var prefixer = require("gulp-autoprefixer");
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var svgstore = require("gulp-svgstore");
var del = require("del");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");

var server = require("browser-sync").create();

gulp.task("imagemin", function () {
  return gulp.src("src/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("src/img"));
});

gulp.task("webp", function () {
  return gulp.src("src/img/**/*.{png,jpg}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("src/img"))
})

gulp.task("css", function () {
  return gulp.src("src/scss/main.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(prefixer())
    .pipe(gulp.dest("dist/css"))
    .pipe(csso())
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest("dist/css"))
});

gulp.task("html", function () {
  return gulp.src("src/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("dist/"))
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("sprite", function () {
  return gulp.src("src/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("dist/img"))
})

gulp.task("copy", function () {
  return gulp.src([
    "src/img/**",
    "src/fonts/**/*.{woff2,woff}",
    "src/js/**",
    "src/*.ico"
  ], {
    base: "src/"
  })
  .pipe(gulp.dest("dist/"))
})

gulp.task("server", function () {
  server.init({
    server: "dist/"
  });

  gulp.watch("src/scss/**/*.{scss,sass}", gulp.series("css", "refresh"))
  gulp.watch("src/img/icon-*.svg", gulp.series("sprite", "html", "refresh"))
  gulp.watch("src/*.html", gulp.series("html", "refresh"))
});

gulp.task("clean", function () {
  return del("dist");
});

gulp.task("build", gulp.series("clean", "copy", "css", "sprite", "html"));
gulp.task("start", gulp.series("build", "server"))