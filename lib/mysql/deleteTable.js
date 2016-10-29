// deletes / drops the student table,
// accepts table name value from POST & GET
var exports = function(req, res) {
	var pool = req.app.get('pool');
	
	var tablename = req.query.tablename || req.body.tablename || "student";
	var query = "DROP TABLE ??";
	pool.query(query, [tablename], function (err, results, fields) {
		if (err) {
			res.json({err:err});
			return;
		}

		res.json({results:results,fields:fields});
	});

};

module.exports = exports;
