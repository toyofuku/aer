
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.chart = function(req, res){
  res.render('chart', { title: 'Chart' });
};
