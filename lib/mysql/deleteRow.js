// deletes a row from the student table based on the id,
// accepts value from POST & GET
var exports = function(req, res) {
	var pool = req.app.get('pool');
	
	var id = req.query.id || req.body.id || "";
	if (id != "") {
		var query = "DELETE FROM student WHERE id = ?";
		pool.query(query, [id], function (err, results, fields) {
			if (err) {
				res.json({err:err});
				return;
			}

			res.json({results:results,fields:fields});
		});
	} else {
		res.json({err:"Please specify an id to delete"});
	}
};

module.exports = exports;
