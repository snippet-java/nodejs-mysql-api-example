// list out all the rows in the student table
var exports = function(req, res) {
	var pool = req.app.get('pool');
	
	var query = "SELECT * FROM student";
	pool.query(query, function (err, data, fields) {
		if (err) {
			res.json({err:err});
			return;
		}

		res.json({data:data,fields:fields});
	});
};

module.exports = exports;
