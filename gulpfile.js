const gulp = require('gulp');
const clean = require('gulp-clean');

const clean_shared = () => gulp.src(['shared/', './mock/aws.dev.json'], {
  allowEmpty: true
}).pipe(clean());

const copy_files = (pattern, dest) => gulp.src([pattern]).pipe(gulp.dest(dest));

const copy_aws_config = () => copy_files('../ki-shared-utility/mock/aws.dev.json', './mock');
const copy_run_js = () => copy_files('../ki-shared-utility/mock/run.js', './mock');
const copy_src_files = () => copy_files('../ki-shared-utility/src/*', 'shared');

const copy_babelrc = () => copy_files('../ki-shared-utility/.babelrc', './');
const copy_git_ignore = () => copy_files('../ki-shared-utility/.gitignore', './');
const copy_buildspec = () => copy_files('../ki-shared-utility/buildspec.yml', './');

const build = gulp.series(clean_shared, copy_aws_config, copy_run_js, copy_src_files, copy_babelrc, copy_git_ignore, copy_buildspec);

gulp.task('default', build);
gulp.task('build', build);
