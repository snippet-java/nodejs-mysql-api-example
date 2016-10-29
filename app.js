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
var db = require('./lib/db.js');

//==== CREATE STUDENT TABLE ====================================//
// curl <url>/createTable                                       //
//////////////////////////////////////////////////////////////////
app.all(["/createtable"], 					db.createTable);

//==== CREATE / INSERT ROW =====================================//
// curl <url>/create                                            //
//////////////////////////////////////////////////////////////////
app.all(["/create","/insert","/add"], 		db.create);

//==== LIST ALL ROWS IN TABLE===================================//
// curl <url>/list                                              //
//////////////////////////////////////////////////////////////////
app.all(["/list"], 							db.list);

//==== READ 1 ROW BASED ON ID ==================================//
// curl <url>/read?id=3                                         //
//////////////////////////////////////////////////////////////////
app.all(["/read","/get"], 					db.read);

//==== UPDATE 1 ROW BASED ON ID ================================//
// curl <url>/update?id=3&firstname=Bob&lastname=Peter          //
//////////////////////////////////////////////////////////////////
app.all(["/update","/modify"], 				db.update);

//==== DELETE 1 ROW BASED ON ID ================================//
//curl <url>/delete?id=3                                        //
//////////////////////////////////////////////////////////////////
app.all(["/delete","/destroy","/remove"], 	db.deleteRow);

//==== DELETE / DROP STUDENT TABLE =============================//
//curl <url>/deletetable                                        //
//////////////////////////////////////////////////////////////////
app.all(["/deletetable","/droptable","/destroytable","/removetable"], db.deleteTable);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

require("cf-deployment-tracker-client").track();