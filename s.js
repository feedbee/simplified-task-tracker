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
	}
	
	// private

	var data = [
		{id: 1, test_server: null, status:"dev", no: 1, title: "Task 1"},
		{id: 2, test_server: "test", status:"test", no: 2, title: "Task 2"},
		{id: 3, test_server: "new", status:"test", no: 3, title: "Task 3"},
		{id: 4, test_server: null, status:"dev", no: 4, title: "Task 4"},
		{id: 5, test_server: "new", status:"done", no: 5, title: "Task 5"},
		{id: 6, test_server: null, status:"dev", no: 6, title: "Task 6"}
	];

	var sort = function () {
		data.sort(cmp);
	}
	var cmp = function (a, b) {
		return a.no > b.no ? 1 : (a.no < b.no ? -1 : 0);
	}

	var draw = function () {
		for (var x in data) {
			var b = $('#c-tpl').clone()
				.attr('id', null)
				.attr('data-sortable', 1);
			var h = $('<div>').append(b).html();
			h = setVars(data[x], h);
			var de = $(h);
			$('#c').append(de);

			$('.c-control-del', de).on('click', function () { control.del($(this).parent().attr('data-item-id')); });
		}
	}

	var setVars = function (vars, text) {
		for (var v in vars) {
			text = text.replace(new RegExp('\\{\\{' + v + '\\}\\}', 'g'), vars[v]);
		}
		return text;
	}

	var control = {
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
		}
	};
};

Stt.init = function () {
	Stt.instance = new Stt();
	Stt.instance.init();
	return Stt.instance;
};