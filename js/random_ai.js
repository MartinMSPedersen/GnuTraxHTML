//A random AI player for Trax
self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'start':
			self.postMessage('WORKER STARTED: ' + data.msg);
			break;
		case 'getmove':
			var newMove = getMove(data.board);
			self.postMessage({'move': newMove});
			break;
		case 'stop':
			self.close();
		default:
			self.postMessage('Unknown command: ' + data.msg);
	};
}, false);

var getMove = function(board)
};
