// read a row specified by the id in GET or POST
var exports = function(req, res) {
	var pool = req.app.get('pool');
	
	var id = req.query.id || req.body.id || "";
	if (id != "") {
		var query = "SELECT * FROM student WHERE id = ?";
		pool.query(query, id, function (err, data, fields) {
			if (err) {
				res.json({err:err});
				return;
			}

			res.json({data:data,fields:fields});
		});
	} else {
		res.json({err:"Please specify an id to read"});
	}
};

module.exports = exports;
