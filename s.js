var Stt = function () {

	// public 

	this.init = function () {
		draw();
		$('#c').multisortable({handle: ".c-col-no"});
		$("#c").sortable({
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
	}
	
	// private

	var statuses = ['new', 'dev', 'test', 'ready', 'done'];
	var servers  = ['–', 'new', 'test'];

	var data = [
		{id: 1, server: "–",    status:"dev",  no: 1, title: "Task 1"},
		{id: 2, server: "test", status:"test", no: 2, title: "Task 2"},
		{id: 3, server: "new",  status:"test", no: 3, title: "Task 3"},
		{id: 4, server: "–",    status:"dev",  no: 4, title: "Task 4"},
		{id: 5, server: "new",  status:"done", no: 5, title: "Task 5"},
		{id: 6, server: "–",    status:"dev",  no: 6, title: "Task 6"}
	];
	var template = {id: null, server: "–", status: "new", no: null, title: "New Task"};

	var sort = function () {
		data.sort(cmp);
	}
	var cmp = function (a, b) {
		return a.no > b.no ? 1 : (a.no < b.no ? -1 : 0);
	}

	var draw = function () {
		for (var x in data) {
			$('#c').append(drawItem(data[x]));
		}
	}

	var drawItem = function (item) {
		var b = $('#c-tpl').clone()
			.attr('id', null)
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
			var newItem = $.extend(true, {}, template);
			newItem.id = maxId + 1;
			newItem.no = data.length + 1;
			$('#c').append(drawItem(newItem));

			data.push(newItem);
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
				console.log(data);
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

			console.log(data);
		},

		editCancel: function (id) {
			$ds = $('li[data-item-id="' + id + '"]');
			$ds.first().show();
			$ds.last().remove();
		}
	};
};

Stt.init = function () {
	Stt.instance = new Stt();
	Stt.instance.init();
	return Stt.instance;
};