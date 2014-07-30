importScripts('TraxBoard.js');
importScripts('TraxUtil.js');

//A simple random AI player for Trax
self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'start':
			self.postMessage({'res': 'OK'});
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

var getMove = function(board) {
	var tmpBoard = new TraxBoard(board);
	var util = new TraxUtil();
	var move = util.getRandomMove(tmpBoard);
	self.postMessage({'res': JSON.stringify(move)});
	return move;
};
