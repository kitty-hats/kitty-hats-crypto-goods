var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var stylus = require('stylus');
var puppeteer = require('puppeteer')

var indexRouter = require('./routes/index');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(80);

const captureScreenshots = async (req, res) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  var id = req.params.id;

  await page.setUserAgent('page');
  await page.goto(`https:\/\/stage.kittyhats.co/#/cg/${id}`)
  await page.waitFor(5000);
  await page.setViewport({ width: 1675, height: 1675 });
  await page.screenshot({path: `/tmp/${id}.png`, clip: {x: 0, y: 70, width: 560, height: 470}});
  browser.close()

  res.sendFile(`/tmp/${id}.png`)
}

app.get('/:id.png', captureScreenshots)

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
