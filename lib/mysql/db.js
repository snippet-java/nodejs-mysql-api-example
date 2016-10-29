var createTable	= require('./createTable.js');
var create		= require('./create.js');
var list		= require('./list.js');
var read		= require('./read.js');
var update		= require('./update.js');
var deleteRow	= require('./deleteRow.js');
var deleteTable	= require('./deleteTable.js');

var exports = {
	createTable	: createTable,
	create		: create,
	list		: list,
	read		: read,
	update		: update,
	deleteRow	: deleteRow,
	deleteTable	: deleteTable
}

module.exports = exports;
