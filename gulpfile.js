/* --------- plugins --------- */
var
	gulp        = require('gulp'),
	compass     = require('gulp-compass'),
	jade        = require('gulp-jade'),
	browserSync = require('browser-sync').create(),
	plumber     = require('gulp-plumber'),
	wiredep     = require('wiredep').stream,
	useref      = require("gulp-useref"),
	gulpif      = require("gulp-if"),
	uglify      = require("gulp-uglify"),
	minifyCss   = require("gulp-minify-css"),
	del         = require("del"),
	imagemin    = require("gulp-imagemin"),
	size        = require("gulp-size"),
	filter      = require("gulp-filter");

/* --------- paths --------- */

var
	paths = {
		jade : {
			location    : 'app/markups/**/*.jade',
			compiled    : 'app/markups/_pages/*.jade',
			destination : 'app/'
		},

		scss : {
			location    : 'app/sass/**/*.scss',
			entryPoint  : 'app/css/main.css'
		},

		compass : {
			configFile  : 'config.rb',
			cssFolder   : 'app/css',
			scssFolder  : 'app/sass',
			imgFolder   : 'app/img'
		},

		browserSync : {
			baseDir : './app',
			watchPaths : ['app/*.html', 'app/css/*.css', 'app/js/*.js']
		}
	};


/* --------- wiredep --------- */
// Подключаем Bower файлы
gulp.task('wiredep-bower', function () {
	return gulp.src('app/markups/*.jade')
		.pipe(wiredep({
			directory: 'app/bower'
			/*, overrides: {
			 "qtip2": {
			 "main": ["./jquery.qtip.min.js", "./jquery.qtip.min.css"],
			 "dependencies": {"jquery": ">=1.6.0"}
			 }
			 }*/
			//, exclude: ["bower/qtip2/"]
			//, ignorePath: /^(\.\.\/)*\.\./
		}))
		.pipe(gulp.dest('app/markups'));
});

//gulp.task("bower-json", function () {
//	return gulp.watch("bower.json", ["wiredep-bower"]);
//});

/* --------- jade --------- */

gulp.task('jade', ['wiredep-bower'], function() {
	gulp.src(paths.jade.compiled)
		.pipe(plumber())
		.pipe(jade({
			pretty: '\t',
		}))
		.pipe(gulp.dest(paths.jade.destination));
});

/* --------- scss-compass --------- */

gulp.task('compass', function() {
	gulp.src(paths.scss.location)
		.pipe(plumber())
		.pipe(compass({
			config_file: paths.compass.configFile,
			css: paths.compass.cssFolder,
			sass: paths.compass.scssFolder,
			image: paths.compass.imgFolder
		}));
});

/* --------- browser sync --------- */

gulp.task('sync', function() {
	browserSync.init({
		server: {
			baseDir: paths.browserSync.baseDir
		},
		port: 1000,
	});
});

/* --------- watch --------- */

gulp.task('watch', function(){
	gulp.watch("bower.json", ["wiredep-bower"]);
	gulp.watch(paths.jade.location, ['jade']);
	gulp.watch(paths.scss.location, ['compass']);
	gulp.watch(paths.browserSync.watchPaths).on('change', browserSync.reload);
});

/* --------- default --------- */

//gulp.task('default', ['wiredep-bower']);
gulp.task('default', ['wiredep-bower', 'jade', 'compass', 'sync', 'watch']);

/*******************************************
 * DIST
 ******************************************/
// Переносим CSS JS HTML в папку DIST
gulp.task("useref", function () {
	//var assets = useref.assets();
	return gulp.src("./app/*.html")
		.pipe(useref())
		.pipe(gulpif("*.js", uglify()))
		.pipe(gulpif("*.css", minifyCss({compatibility: "ie8"})))
		//.pipe(assets.restore())
		//.pipe(useref())
		.pipe(gulp.dest("dist"));
});

// Очищаем директорию DIST
gulp.task("clean-dist", function () {
	return del(["./dist/**", "!./dist/"]);
});

// Запускаем локальный сервер для DIST
gulp.task("dist-server", function () {
	browserSync.init({
		notify: false,
		port: 2000,
		server: { baseDir: "./dist" }
	});
});

// Перенос шрифтов
gulp.task("fonts", function() {
	gulp.src("./app/fonts/**/*")
		//.pipe(filter(["*.eot", "*.svg", "*.ttf", "*.woff", "*.woff2"]))
		.pipe(gulp.dest("./dist/fonts/"))
});

// Перенос картинок
gulp.task("images", function () {
	return gulp.src("./app/img/**/*")
		.pipe(imagemin({
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest("./dist/img"));
});

// Перенос остальных файлов (favicon и т.д.)
gulp.task("extras", function () {
	return gulp.src(["./app/*.*", "!./app/*.html"])
		.pipe(gulp.dest("./dist"));
});

// Вывод размера папки APP
gulp.task("size-app", function () {
	return gulp.src("app/**/*").pipe(size({title: "APP size: "}));
});

// Сборка и вывод размера папки DIST
gulp.task("dist", ["useref", "images", "fonts", "extras", "size-app"], function () {
	return gulp.src("dist/**/*").pipe(size({title: "DIST size: "}));
});

// Собираем папку DIST - только когда файлы готовы
gulp.task("build", ["clean-dist", "wiredep-bower"], function () {
	gulp.start("dist");
});

// Отправка проекта на сервер
gulp.task("deploy", function() {
	var conn = ftp.create({
		host: "host",
		user: "user",
		password: "password",
		parallel: 10,
		log: gutil.log
	});

	return gulp.src(["./dist/**/*"], { base: "./dist/", buffer: false})
		.pipe(conn.dest("/public_html/"));
});