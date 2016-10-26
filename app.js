var express = require('express');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');

app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
})); 

var services = JSON.parse(process.env.VCAP_SERVICES) || {};

var mysqlCreds = {};
for (var serviceName in services) {
	if (serviceName.indexOf("cleardb") > -1) {
		mysqlCreds = services[serviceName][0]['credentials'];
	}
}

var config = require("./config.json");
var dbConfig = {
		host     : mysqlCreds.hostname || config.mysql.host || "",
		user     : mysqlCreds.username || config.mysql.user || "",
		password : mysqlCreds.password || config.mysql.password || "",
		database : mysqlCreds.name || config.mysql.database || "",
		connectionLimit : config.mysql.connectionLimit || 4,
};

var pool  = mysql.createPool(dbConfig);

app.all(["/createtable"], function(req, res) {
	// by default, will create a student table
	
	var query = "CREATE TABLE student ( \
			id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, \
			firstname VARCHAR(30) NOT NULL, \
			lastname VARCHAR(30) NOT NULL, \
			student_id VARCHAR(50) \
			)";
	pool.query(query, function (err, results, fields) {
		if (err) {
			res.json({err:err});
			return;
		}
		
		res.json({results:results,fields:fields});
	});

});

app.get(["/create","/insert","/add"], function(req, res) {
	//insert a default student row with the firstname John, lastname Doe & random student_id.
	//accepts any key-value pair from POST & GET and assign to the doc as well.
	
	var values = {
			"firstname" : "John",
			"lastname" : "Doe",
			"student_id" : generateStudentID()
	}
	for (var key in req.body) {
		values[key] = req.body[key]
	}
	for (var key in req.query) {
		values[key] = req.query[key]
	}
	var query = "INSERT INTO student SET ?";
	pool.query(query, values, function (err, results, fields) {
		if (err) {
			res.json({err:err});
			return;
		}

		res.json({results:results,fields:fields});
	});
	
});

app.all(["/list"], function(req, res) {
	//list out all the rows in the student table
	
	var query = "SELECT * FROM student";
	pool.query(query, function (err, results, fields) {
		if (err) {
			res.json({err:err});
			return;
		}

		res.json({results:results,fields:fields});
	});
	
});

app.all(["/read","/get"], function(req, res) {
	//read a row specified by the id in GET or POST.
	//If none is specified, will read a random row from the table.
	var id = req.query.id || req.body.id || "";
	if (id != "") {
	
		var query = "SELECT * FROM student WHERE id = ?";
		pool.query(query, id, function (err, results, fields) {
			if (err) {
				res.json({err:err});
				return;
			}

			res.json({results:results,fields:fields});
		});
		
	} else {
		getRandomRow(function(err, results, fields) {
			if (err) {
				res.json({err:err});
				return;
			}

			res.json({results:results,fields:fields});
		});
	}
});

app.all(["/update","/modify"], function(req, res) {
	//updates a row based on the id with a random student_id.
	//accepts any key-value pair from POST & GET and apply to the row as well.
	var id = req.query.id || req.body.id || "";
	var values = {
			"student_id" : generateStudentID()
	}
	for (var key in req.body) {
		values[key] = req.body[key];
	}
	for (var key in req.query) {
		values[key] = req.query[key];
	}
	var query = "UPDATE student SET ? WHERE id = ?";
	if (id != "") {

		var querysql = pool.query(query, [values, id], function (err, results, fields) {
			if (err) {
				res.json({err:err});
				return;
			}

			res.json({results:results,fields:fields});
		});

	} else {
		getRandomRow(function(err, results, fields) {
			if (err) {
				res.json({err:err});
				return;
			}
			
			var id = results[0].id || "";
			pool.query(query, [values, id], function (err, results, fields) {
				if (err) {
					res.json({err:err});
					return;
				}

				res.json({results:results,fields:fields});
			});
			
		});
	}
});


app.all(["/delete","/destroy","/remove"], function(req, res) {
	// deletes a row from the student table based on the id,
	// otherwise, randomly delete 1 document
	// accepts value from POST & GET
	var id = req.query.id || req.body.id || "";
	if (id != "") {

		var query = "DELETE FROM student id = ?";
		pool.query(query, id, function (err, results, fields) {
			if (err) {
				res.json({err:err});
				return;
			}

			res.json({results:results,fields:fields});
		});
		
	} else {
		getRandomRow(function(err, results, fields) {
			if (err) {
				res.json({err:err});
				return;
			}
			
			var id = results[0].id || "";
			var query = "DELETE FROM student WHERE id = ?";
			pool.query(query, [id], function (err, results, fields) {
				if (err) {
					res.json({err:err});
					return;
				}

				res.json({results:results,fields:fields});
			});
			
		});
	}
});

app.all(["/deletetable","/destroytable","/removetable","/droptable"], function(req, res) {
	// deletes the student table,
	// accepts table name value from POST & GET
	var tablename = req.query.tablename || req.body.tablename || config.mysql.tableName || "";
	var query = "DROP TABLE ?";
	pool.query(query, [tablename], function (err, results, fields) {
		if (err) {
			res.json({err:err});
			return;
		}

		res.json({results:results,fields:fields});
	});
	
});


function generateStudentID() {
	return "ID#" + Math.floor(Math.random()*10000);
}

// get a random row from the table if no specific id is selected
function getRandomRow(cb) {
	
	var query = "SELECT * FROM student";
	pool.query(query, function (err, results, fields) {
		if (err) {
			cb(err,null);
			return;
		} else if (results.length == 0) {
			cb("Table is empty",null);
			return;		
		}

		var row = results[Math.floor(Math.random()*results.length)];
		cb(null,[row],fields);
	});
	
}

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

require("cf-deployment-tracker-client").track();