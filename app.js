var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var puppeteer = require('puppeteer')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'html');

const captureScreenshots = async (req, res) => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
  const page = await browser.newPage()

  var id = req.params.id;

  await page.setUserAgent('page');
  await page.goto(`https:\/\/kittyhats.co/#/cg/${id}`)
 
  var intervalId = setInterval(async function(){
    var loaded = await page.evaluate(function(){
      return window.allItemsLoaded;
    })
    if(loaded === true){
      await page.setViewport({ width: 1675, height: 1675 });
      await page.screenshot({path: `/tmp/${id}.png`, clip: {x: 0, y: 10, width: 550, height: 530}});
      browser.close()
      res.sendFile(`/tmp/${id}.png`)
      clearInterval(intervalId)
    }
  }, 100);

}

app.get('/:id.png', captureScreenshots)

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
