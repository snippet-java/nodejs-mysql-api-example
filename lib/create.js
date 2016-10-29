// insert a default student row with the firstname John, lastname Doe & random student_id.
// accepts any key-value pair from POST & GET and assign to the doc as well.
var exports = function(req, res) {
	var pool = req.app.get('pool');
	
	var values = {
		"firstname"  : "John",
		"lastname"   : "Doe",
		"student_id" : generateStudentID()
	}
	
	// assign all key-value in GET & POST into value;
	for (var key in req.body)	values[key] = req.body[key];
	for (var key in req.query)	values[key] = req.query[key];
	
	var query = "INSERT INTO student SET ?";
	pool.query(query, values, function (err, results, fields) {
		if (err) {
			res.json({err:err});
			return;
		}

		res.json({results:results,fields:fields});
	});
};

// generate a random student ID
function generateStudentID() {
	return "ID#" + Math.floor(Math.random()*10000);
}

module.exports = exports;
