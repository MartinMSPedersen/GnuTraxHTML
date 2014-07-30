var TraxUtil = function() {
	
};

TraxUtil.prototype.getRandom = function (limit) {
	return Math.random()*limit;
};

TraxUtil.prototype.log = function(msg) {
	console.log(msg);
};

TraxUtil.prototype.getRandomMove = function(board) {
	var move;
	var losingMoves = 0;
	if (board.isGameOver() != board.NOPLAYER) {
		return "";
	}
	
	var moves = board.uniqueMoves();
	if (moves.length === 1) {
		return moves[0];
	}
	
	var moves_not_losing = [];
	
	for (var i=0; i<moves.length; i++) {
	    var t_copy=new TraxBoard(board);
	    t_copy.makeMove(moves[i]);
	    var gameOverValue = t_copy.isGameOver();
	    switch (gameOverValue) {
	    	case board.WHITE:
	    	case board.BLACK:
				if (t_copy.whoDidLastMove()==gameOverValue) {
				    return (moves[i]);	/* Winning move found */
				}
				/* losing move found */
		    	losingMoves++;
		    break;
		    case board.NOPLAYER:
		    case board.DRAW:
				moves_not_losing.push(moves[i]);
			break;
	    }
	}
	if (moves_not_losing.length === 0) {
	    return moves[0];
	}
	return moves_not_losing[Math.floor(Math.random()*moves_not_losing.length)];

};