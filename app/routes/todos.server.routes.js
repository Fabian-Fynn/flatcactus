'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var wgs = require('../../app/controllers/wgs.server.controller');
	var xtasklists = require('../../app/controllers/xtasklists.server.controller');
	var todos = require('../../app/controllers/todos.server.controller');

	// Todos Routes
	app.route('/todos')
		//.get(users.requiresLogin, todos.list)
		.post(users.requiresLogin, todos.create);

	app.route('/todo/all-from-share')
		.get(users.requiresLogin, wgs.wgByUser, todos.getAllFromWg);

	app.route('/todos/:todoId')
		.get(users.requiresLogin, wgs.wgByUser, xtasklists.checkIfAllowed, todos.read)
		.put(users.requiresLogin, wgs.wgByUser, xtasklists.checkIfAllowed, todos.update)
		.delete(users.requiresLogin, wgs.wgByUser, xtasklists.checkIfAllowed, todos.delete);

	// Finish by binding the Todo middleware
	app.param('todoId', todos.todoByID);
};
