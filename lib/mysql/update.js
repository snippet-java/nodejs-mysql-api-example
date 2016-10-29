// updates a row based on the id with a random student_id.
// accepts any key-value pair from POST & GET and apply to the row as well.
var exports = function(req, res) {
	var pool = req.app.get('pool');
	
	var id = req.query.id || req.body.id || "";
	var values = {
		"student_id" : generateStudentID()	// assign new student_id
	}
	
	for (var key in req.body)	values[key] = req.body[key];
	for (var key in req.query)	values[key] = req.query[key];
	
	var query = "UPDATE student SET ? WHERE id = ?";
	if (id != "") {
		pool.query(query, [values, id], function (err, data, fields) {
			if (err) {
				res.json({err:err});
				return;
			}

			res.json({data:data,fields:fields});
		});
	} else {
		res.json({err:"Please specify an id to modify"});
	}
};

// generate a random student ID
function generateStudentID() {
	return "ID#" + Math.floor(Math.random()*10000);
}

module.exports = exports;
