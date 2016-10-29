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

//==== CONFIGURE DATABASE ======================================//
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var mysqlCreds = {};
for (var serviceName in services) {
	if (serviceName.indexOf("cleardb") > -1) {
		mysqlCreds = services[serviceName][0]['credentials'];
	}
}

var services = {mysql:{}};
if (JSON.stringify(mysqlCreds) == "{}") {
	services = require("./services.json");
}

var dbConfig = {
		host     : mysqlCreds.hostname || services.mysql.host || "",
		user     : mysqlCreds.username || services.mysql.user || "",
		password : mysqlCreds.password || services.mysql.password || "",
		database : mysqlCreds.name || services.mysql.database || "",
		connectionLimit : services.mysql.connectionLimit || 4,
};

var pool  = mysql.createPool(dbConfig);
app.set('pool', pool);
var db = require('./lib/mysql/db.js');
//==============================================================//

//==== CREATE STUDENT TABLE ====================================//
// curl <url>/mysql/createtable                                 //
//==============================================================//
app.all(db.paths.createTable, db.createTable);

//==== CREATE / INSERT ROW =====================================//
// curl <url>/mysql/create                                      //
//==============================================================//
app.all(db.paths.create, db.create);

//==== LIST ALL ROWS IN TABLE===================================//
// curl <url>/mysql/list                                        //
//==============================================================//
app.all(db.paths.list, db.list);

//==== READ 1 ROW BASED ON ID ==================================//
// curl <url>/mysql/read?id=3                                   //
//==============================================================//
app.all(db.paths.read, db.read);

//==== UPDATE 1 ROW BASED ON ID ================================//
// curl <url>/mysql/update?id=3&firstname=Bob&lastname=Peter    //
//==============================================================//
app.all(db.paths.update, db.update);

//==== DELETE 1 ROW BASED ON ID ================================//
//curl <url>/mysql/delete?id=3                                  //
//==============================================================//
app.all(db.paths.delete_, db.delete_);

//==== DELETE / DROP STUDENT TABLE =============================//
//curl <url>/mysql/deletetable                                  //
//==============================================================//
app.all(db.paths.deleteTable, db.deleteTable);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

require("cf-deployment-tracker-client").track();