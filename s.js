var Stt = function () {

	// public 

	this.init = function (o) { init(o); };

	this.getTasks = function () {
		return data;
	}
	this.setTasks = function (newTasks) {
		data = newTasks;
		draw();
	}

	this.addListener = function (type, listener) {
		if (typeof listeners[type] == "undefined") {
			listeners[type] = [];
		}

		listeners[type].push(listener);
	};
	this.removeListener = function (type, listener) {
		if (listeners[type] instanceof Array) {
			var typeListeners = listeners[type];
			for (var i = 0, length = typeListeners.length; i < length; i++) {
				if (typeListeners[i] === listener) {
					typeListeners.splice(i, 1);
					break;
				}
			}
		}
	};
	
	// private

	var statuses = undefined;
	var servers  = undefined;

	var data = undefined;
	var template = undefined;

	var listeners = {};

	var init = function (options) {

		data = options.tasks;
		template = (options.taskTemplate);
		statuses = (options.statuses);
		servers = (options.servers);

		draw();
		$('#c').multisortable({
			items: "> li[data-sortable]",
			handle: ".c-col-no",
			cursor: "move",
			update: function(event, ui) {
				// var id = ui.item.data('item-id');
				var ids = $(this).sortable('toArray', {attribute: 'data-item-id'});
				for (var i in data) {
					data[i].no = ids.indexOf(data[i].id.toString()) + 1;
					$('li[data-item-id="' + data[i].id + '"] > .c-col-no').text(data[i].no);
				}
				sort();

				fire({type: 'datachanged', target: data});
			}
		});
		$("#c .c-col-no").disableSelection();


		$.each(statuses, function (k, v) {
			$('.c-tpl-edit-list-status').append($('<option>', {value: v, text: v}));
		});
		$.each(servers, function (k, v) {
			$('.c-tpl-edit-list-server').append($('<option>', {value: v, text: v}));
		});

		$('.c-control-create').button({icons: {primary: "ui-icon-circle-plus"}, text: true, label: 'Create New Task'})
			.on('click', control.create);

		$('#c-loading').remove();
	}

	var self = this;
	var fire = function (event) {
		if (typeof event == "string") {
			event = { type: event };
		}
		if (!event.target) {
			event.target = self;
		}

		if (!event.type) {
			throw new Error("Event object missing 'type' property.");
		}

		if (listeners[event.type] instanceof Array) {
			var typeListeners = listeners[event.type];
			for (var i = 0, length = typeListeners.length; i < length; i++) {
				typeListeners[i].call(self, event);
			}
		}
	};

	var sort = function () {
		data.sort(cmp);
	}
	var cmp = function (a, b) {
		return a.no > b.no ? 1 : (a.no < b.no ? -1 : 0);
	}

	var draw = function () {
		var $c = $('#c');
		
		$c.find('[data-element="real"]').remove();

		sort();
		for (var x in data) {
			$c.append(drawItem(data[x]));
		}
	}

	var drawItem = function (item) {
		var b = $('#c-tpl').clone()
			.attr('id', null)
			.attr('data-element', 'real')
			.attr('data-sortable', 1);
		var h = $('<div>').append(b).html();
		h = setVars(item, h);
		var $de = $(h);

		$('.c-control-del', $de).button({icons: {primary: "ui-icon-circle-minus"}, text: false})
			.on('click', function () { control.del(item.id); });
		$('.c-control-edit', $de).button({icons: {primary: "ui-icon-pencil"}, text: false})
			.on('click', function () { control.edit(item.id); });

		return $de;
	}

	var setVars = function (vars, text) {
		$escaper = $('<div/>');
		for (var v in vars) {
			var value = $escaper.text(vars[v]).html(); // escape HTML
			text = text.replace(new RegExp('\\{\\{' + v + '\\}\\}', 'g'), value);
		}
		return text;
	}

	var getDataItem = function (id) {
		var index = null;
		if (false === data.every(function (el, i) { index = i; return el.id != id; })) {
			return data[index];
		} else {
			return null;
		}
	};

	var control = {
		create: function () {
			var maxId = 1;
			$.each(data, function (k, v) { if (v.id > maxId) { maxId = v.id; } });
			var newItem = clone(template);
			newItem.id = maxId + 1;
			newItem.no = data.length + 1;
			$('#c').append(drawItem(newItem));

			data.push(newItem);

			fire({type: 'datachanged', target: data});
		},

		del: function (id) {
			var index = null;
			if (false === data.every(function (el, i) { index = i; return el.id != id; }))
			{
				data.splice(index, 1);
				$('li[data-item-id="' + id + '"]').remove();
				for (var i = index; i < data.length; i++) {
					data[i].no = i + 1;
					$('li[data-item-id="' + data[i].id + '"] > .c-col-no').text(data[i].no);
				}

				fire({type: 'datachanged', target: data});
			}
			// else not found
		},

		edit: function (id) {
			var $row = $('li[data-item-id="' + id + '"]');
			var no = $('.c-col-no', $row).text();
			$row.hide();

			var b = $('#c-tpl-edit').clone()
				.attr('id', null);
			var h = $('<div>').append(b).html();
			h = setVars({id: id, 'no': no}, h);
			var $de = $(h);
			$row.after($de);

			$('.c-col-title > input', $de).val($('.c-col-title', $row).text());
			$('.c-col-server > select', $de).val($('.c-col-server', $row).text());
			$('.c-col-status > select', $de).val($('.c-col-status', $row).text());

			$('.c-control-save', $de).button({icons: {primary: "ui-icon-circle-check"}, text: false})
				.on('click', function () { control.editSave($(this).parent().parent().attr('data-item-id')); });
			$('.c-control-cancel', $de).button({icons: {primary: "ui-icon-cancel"}, text: false})
				.on('click', function () { control.editCancel($(this).parent().parent().attr('data-item-id')); });
		},

		editSave: function (id) {
			var $ds = $('li[data-item-id="' + id + '"]');
			var $row = $ds.first();
			var $de  = $ds.last();

			var title = $('.c-col-title > input', $de).val();
			var server = $('.c-col-server > select', $de).val();
			var status = $('.c-col-status > select', $de).val();
			$('.c-col-title', $row).text(title);
			$('.c-col-server', $row).text(server);
			$('.c-col-status', $row).text(status);

			$row.show();
			$de.hide();

			var dataItem = getDataItem(id);
			dataItem.title = title;
			dataItem.server = server;
			dataItem.status = status;

			fire({type: 'datachanged', target: data});
		},

		editCancel: function (id) {
			$ds = $('li[data-item-id="' + id + '"]');
			$ds.first().show();
			$ds.last().remove();
		}
	};

	var clone = function (obj) {
		return $.extend(true, {}, obj);
	}

	// constructor
};

Stt.init = function (options) {
	if (options === undefined) {
		options = {};
	}

	defaults = {
		statuses: ['new', 'dev', 'test', 'ready', 'done'],
		servers:  ['–', 'test1', 'test2'],
		tasks:    [
			{id: 1, server: "–",     status:"new",   no: 1, title: "Task 1"},
			{id: 2, server: "test1", status:"dev",   no: 2, title: "Task 2"},
			{id: 3, server: "test2", status:"test",  no: 3, title: "Task 3"},
			{id: 4, server: "–",     status:"ready", no: 4, title: "Task 4"},
			{id: 5, server: "–",     status:"done",  no: 5, title: "Task 5"},
		],
		taskTemplate: {id: null, server: "–", status: "new", no: null, title: "New Task"}
	};
	
	options = $.extend(defaults, options);

	Stt.instance = new Stt();

	if (options.persistenceProvider) {
		options.persistenceProvider.attach(Stt.instance);

		options.persistenceProvider.load(function (tasks) {
			if (tasks !== undefined) {
				options.tasks = tasks;
			}
			Stt.instance.init(options);
		});
	} else {
		Stt.instance.init(options);
	}

	return Stt.instance;
};

Stt.PersistenceProviders = {};
Stt.PersistenceProviders.HttpRest = function (options) {
	// {url: ''} [url]/:   GET — task list, PUT — add new task;
	//           [url]/id: POST — update, GET — get task, DELETE — remove task
	throw "Not implemented";
};
Stt.PersistenceProviders.HttpJson = function (options) {
	// {url: ''} [url]:    GET  — get task list, POST — update task list;
	throw "Not implemented";
};
Stt.PersistenceProviders.Html5WebStorage = function (options) {
	// {key: ''}
	options = $.extend({key: 'SttStorage'}, options);

	var testLs = function () {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	};
	var testJson = function () {
		try {
			return 'JSON' in window && window['JSON'] !== null;
		} catch (e) {
			return false;
		}
	};

	if (!testLs() || !testJson()) {
		throw "Local storage or JSON is not supported in this vrowser";
	}

	this.update = function (data) {
		localStorage.setItem(options.key, JSON.stringify(data));
	};

	this.load = function (callback) {
		var data = $.parseJSON(localStorage.getItem(options.key));
		if (data !== null) {
			callback(data);
			return;
		} else {
			callback(undefined);
			return;
		}
	};

	this.attach = function (sstInstance) {
		var self = this;
		sstInstance.addListener('datachanged', function (e) {self.update(e.target);});
	};
};
Stt.PersistenceProviders.Dropbox = function (options) {
	// {apiKey: ''}
	options = $.extend({apiKey: '6e45l48npfoxq6c'}, options);

	var client = new Dropbox.Client({key: options.apiKey});

	client.authenticate(function(error, client) {
		if (error) {
			alert('Dropbox auth failed: ' + error);
			return;
		}

		console.log('Dropbox auth successful');
	});

	this.update = function (data) {

		$('#status').text('Saving to Dropbox...').show();
		client.writeFile("sst.json", JSON.stringify(data), function(error, stat) {
			if (error) {
				alert("Failed to save data to Dropbox account: " + error);
				return;
			}

			$('#status').text('Saved');
			setTimeout(function() {
				$('#status').fadeOut('slow');
			}, 10000);
		});
	};

	this.load = function (callback) {

		client.readFile("sst.json", function(error, content) {
			if (error) {
				if (error.status == 404) {
					callback(undefined);
					return ;
				}
				alert("Failed to save data to Dropbox account: " + error);
				return;
			}

			var data = $.parseJSON(content);
			if (data !== null) {
				callback(data);
				return;
			} else {
				callback(undefined);
				return
			}
		});
	};

	this.attach = function (sstInstance) {
		var self = this;
		sstInstance.addListener('datachanged', function (e) {self.update(e.target);});
	};
};