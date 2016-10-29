// by default, will create a student table
var exports = function(req, res) {
	var pool = req.app.get('pool');
	
	var query = "\
			CREATE TABLE student ( \
				id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, \
				firstname VARCHAR(30) NOT NULL, \
				lastname VARCHAR(30) NOT NULL, \
				student_id VARCHAR(50) \
			)";
	
	pool.query(query, function (err, data, fields) {
		if (err) {
			res.json({err:err});
			return;
		}
		
		res.json({data:data,fields:fields});
	});	
};

module.exports = exports;
