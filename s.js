var Stt = function () {

	// public 

	this.init = function () {
		draw();
		$("#c").sortable({
			update: function(event, ui) {
				console.log(ui);
			}
		});
		$("#c").disableSelection();
	}
	
	// private

	var data = [
		{test_server: null, status:"dev", no: 1, title: "Task 1"},
		{test_server: "test", status:"test", no: 2, title: "Task 2"},
		{test_server: "new", status:"test", no: 3, title: "Task 3"},
		{test_server: null, status:"dev", no: 4, title: "Task 4"},
		{test_server: "new", status:"done", no: 5, title: "Task 5"},
		{test_server: null, status:"dev", no: 6, title: "Task 6"}
	];

	var sort = function () {
		data.sort(cmp);
	}
	var cmp = function (a, b) {
		return a.no > b.no ? 1 : (a.no < b.no ? -1 : 0);
	}

	var draw = function () {
		for (var x in data) {
			var b = $('#c-tpl').clone().attr('id', null);
			var h = $('<div>').append(b).html();
			h = setVars(data[x], h);
			$('#c').append(h);
		}
	}

	var setVars = function (vars, text) {
		for (var v in vars) {
			text = text.replace(new RegExp('\\{\\{' + v + '\\}\\}'), vars[v]);
		}
		return text;
	}
};

Stt.init = function () {
	Stt.instance = new Stt();
	Stt.instance.init();
	return Stt.instance;
};