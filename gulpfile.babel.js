import gulp from 'gulp'
import gpug from 'gulp-pug'
import del from 'del'
import ws from 'gulp-webserver'
import image from 'gulp-image'
import gulp_sass from "gulp-sass";
import node_sass from "node-sass";
import autoprefixer from 'gulp-autoprefixer'
import miniCss from 'gulp-csso'
import bro from 'gulp-bro'
import babelify from 'babelify'
import ghPages from 'gulp-gh-pages'

const sass = gulp_sass(node_sass);

const routes ={
  pug:{
    watch:"src/**/*.pug",
    src :"src/*.pug",
    dest:"build" 
  },
  img: {
    src: "src/img/*",
    dest: "build/img"
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css"
  },
  js: {
    watch:"src/js/**/*.js", 
    src: "src/js/main.js",
    dest: "build/js"
  }
}

const pug = () => 
  gulp
    .src(routes.pug.src)
    .pipe(gpug())
    .pipe(gulp.dest(routes.pug.dest));

 
const clean = ()=> del(["build/", ".publish"]);

const img = () => 
  gulp
  .src(routes.img.src)
  .pipe(image())
  .pipe(gulp.dest(routes.img.dest))

const styles = () => 
  gulp.
  src(routes.scss.src)
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    browsers:['last 2 versions']
  }))
  .pipe(miniCss())  
  .pipe(gulp.dest(routes.scss.dest))

const js = () =>
  gulp.src(routes.js.src)
  .pipe(bro({
    transform:[
      babelify.configure({presets: ["@babel/preset-env"]}),
      ["uglifyify", {global:true}]
    ]
  }))
  .pipe(gulp.dest(routes.js.dest))
 

const webserver = () => 
  gulp
  .src("build")
  .pipe(ws({livereload : true, open:true})); 

const ghDeploy = () =>
 gulp.src("build/**/*").pipe(ghPages())

const watch = () => {
  //watch는 파일 수정했을 때 바로바로 반영되는걸 지켜본다는 뜻.. 
  // routes 에 watch 옵션 추가하고, 모든 파일을 지켜보겠다는 뜻!  
  // 첫번째 인자는 지켜볼 파일 쓰고, 두번째 인자는 어떤 task를 수행할 것인지 적으면 됨
  gulp.watch(routes.pug.watch, pug)
  gulp.watch(routes.img.src, img)
  gulp.watch(routes.js.watch, js)
  gulp.watch(routes.scss.watch, styles);
}


//dev의 준비 과정에서 벌어지는 일. 
//build 하기 전 준비 과정에서도 벌어지는 일.  
const prepare = gulp.series([clean, img]);
const assets = gulp.series([pug, styles, js ]);
// const postDev = gulp.series([webserver, watch]) 
//두가지 일을 동시에 실행시키고 싶으면, series 사용하면 안됨 
// const postDev = gulp.parallel([webserver, watch]) 
const live = gulp.parallel([webserver, watch]);
export const build = gulp.series([prepare, assets])
export const dev = gulp.series([build, live])
export const deploy = gulp.series([build, ghDeploy, clean])