var TraxBoard = function(org) {
	var i, j;
	if (org) {
		this.wtm = org.wtm;
		this.gameover = org.gameover;
		this.num_of_tiles = org.num_of_tiles;
		this.board = [];
		this.board_save = [];
		for (i = 0; i < 17; i++) {
			this.board[i] = [];
			this.board_save[i] = [];
			for (j = 0; j < 17; j++) {
				this.board[i][j] = org.board[i][j];
				this.board_save[i][j] = org.board_save[i][j];
			}
		}
		this.firstrow = org.firstrow;
		this.firstcol = org.firstcol;
		this.lastrow = org.lastrow;
		this.lastcol = org.lastcol;
		this.firstrow_save = org.firstrow_save;
		this.firstcol_save = org.firstcol_save;
		this.lastrow_save = org.lastrow_save;
		this.lastcol_save = org.lastcol_save;
		this.boardEmpty = org.boardEmpty;
	} else {
		this.wtm = this.WHITE;
		this.gameover = this.NOPLAYER;
		this.num_of_tiles = 0;
		this.board = [];
		this.board_save = [];
		for (i = 0; i < 17; i++) {
			this.board[i] = [];
			this.board_save[i] = [];
			for (j = 0; j < 17; j++) {
				this.board[i][j] = this.EMPTY;
				this.board_save[i][j] = this.EMPTY;
			}
		}
		this.boardEmpty = true;
	}
	
	this.col_row_array = [];
	for (i = 0; i < 9; i++) {
		this.col_row_array[i] = [];
		for (j = 0; j < 9; j++) {
			this.col_row_array[i][j] = '';
		}
	}
	for (j = 0; j <= 8; j++) {
		var str = '@'+j;
		var idx1 = 0;
		var idx2 = j; 
		this.col_row_array[idx1][idx2] = str;
	}
	for (i = 65; i <= 72; i++) {
		for (j = 0; j <= 8; j++) {
			var str = ''+String.fromCharCode(i)+j;
			var idx1 = i - 64;
			var idx2 = j; 
			this.col_row_array[idx1][idx2] = str;
		}
	}
};

TraxBoard.prototype.blank = function (piece) {
	return piece == this.EMPTY;
};

TraxBoard.prototype.setCorners = function () { 
	this.firstrow=-1;
	this.firstcol=-1;
	this.lastcol=-1;
	this.lastrow=-1;
	for (var i=0; i<17; i++) {
		for (var j=0; j<17; j++) {
			if ((this.firstrow<0) && (this.board[i][j]!=this.EMPTY)) this.firstrow=i;
			if ((this.lastrow<0) && (this.board[16-i][j]!=this.EMPTY)) this.lastrow=16-i;
			if ((this.firstcol<0) && (this.board[j][i]!=this.EMPTY)) this.firstcol=i;
			if ((this.lastcol<0) && (this.board[j][16-i]!=this.EMPTY)) this.lastcol=16-i;
		}
	}
};

TraxBoard.prototype.getRowSize = function() { 
	return ((this.num_of_tiles == 0)?0:1+(this.lastrow-this.firstrow)); 
};
TraxBoard.prototype.getColSize = function () { 
	return ((this.num_of_tiles == 0)?0:1+(this.lastcol-this.firstcol)); 
};

TraxBoard.prototype.isBlank = function(row, col) { 
	return (this.getAt(row, col) == this.EMPTY); 
};

TraxBoard.prototype.getAt = function(row, col) {
	if ((row < 1) || (row > 8))
		return this.EMPTY;
	if ((col < 1) || (col > 8))
		return this.EMPTY;
	return this.board[this.firstrow + row - 1][this.firstcol + col - 1];
};

TraxBoard.prototype.putAt = function (row, col, piece) {
	if (piece == this.EMPTY) {
		if (this.board[this.firstrow + row - 1][this.firstcol + col - 1] != this.EMPTY)
			this.num_of_tiles--;
		this.board[this.firstrow + row - 1][this.firstcol + col - 1] = piece;
		return;
	} else {
		if (this.boardEmpty) {
			this.boardEmpty = false;
			this.firstrow = 7;
			this.firstcol = 7;
			this.lastrow = 7;
			this.lastcol = 7;
			this.num_of_tiles = 1;
			this.board[this.firstrow][this.firstcol] = piece;
			return;
		}
		if (row == 0) {
			this.firstrow--;
			row++;
		}
		if (col == 0) {
			this.firstcol--;
			col++;
		}
		if (row > this.getRowSize()) {
			this.lastrow += row - this.getRowSize();
		}
		if (col > this.getColSize()) {
			this.lastcol += col - this.getColSize();
		}
		this.num_of_tiles++;
	}
	this.board[this.firstrow + row - 1][this.firstcol + col - 1] = piece;
};

TraxBoard.prototype.canMoveDown = function () { 
	return (this.getRowSize() < 8); 
};
TraxBoard.prototype.canMoveRight = function () { 
	return (this.getColSize() < 8); 
};



TraxBoard.prototype.forcedMove = function(brow, bcol) {
	if (!this.isBlank(brow, bcol))
		return true;
	if ((brow < 1) || (brow > 8) || (bcol < 1) || (bcol > 8))
		return true;

	var up = this.getAt(brow - 1, bcol);
	var down = this.getAt(brow + 1, bcol);
	var left = this.getAt(brow, bcol - 1);
	var right = this.getAt(brow, bcol + 1);

	var neighbors = 0;

	if (!this.blank(up))
		neighbors++;
	if (!this.blank(down))
		neighbors++;
	if (!this.blank(left))
		neighbors++;
	if (!this.blank(right))
		neighbors++;

	if (neighbors < 2)
		return true; // Less than two pieces bordering

	var white_up = 0, 
		black_up = 0, 
		white_down = 0, 
		black_down = 0, 
		white_left = 0, 
		black_left = 0, 
		white_right = 0, 
		black_right = 0;

	if (up == this.SN || up == this.SW || up == this.SE)
		white_up = 1;
	if (up == this.WE || up == this.NW || up == this.NE)
		black_up = 1;
	if (down == this.NS || down == this.NW || down == this.NE)
		white_down = 1;
	if (down == this.WE || down == this.SW || down == this.SE)
		black_down = 1;
	if (left == this.EW || left == this.EN || left == this.ES)
		white_left = 1;
	if (left == this.NS || left == this.NW || left == this.SW)
		black_left = 1;
	if (right == this.WE || right == this.WN || right == this.WS)
		white_right = 1;
	if (right == this.NS || right == this.NE || right == this.SE)
		black_right = 1;

	var white = white_up + white_down + white_left + white_right;
	var black = black_up + black_down + black_left + black_right;

	if ((white > 2) || (black > 2)) // Illegal filled cave
		return false;

	if ((white < 2) && (black < 2)) // Done
		return true;

	var piece = this.EMPTY;
	if (white == 2) {
		switch (white_up + 2 * white_down + 4 * white_left + 8 * white_right) {
				case 3:
					piece = this.NS;
					break;
				case 12:
					piece = this.WE;
					break;
				case 5:
					piece = this.NW;
					break;
				case 9:
					piece = this.NE;
					break;
				case 6:
					piece = this.WS;
					break;
				case 10:
					piece = this.SE;
					break;
		}
	} else { // right==2
		switch (black_up + 2 * black_down + 4 * black_left + 8 * black_right) {
			case 12:
				piece = this.NS;
				break;
			case 3:
				piece = this.WE;
				break;
			case 10:
				piece = this.NW;
				break;
			case 6:
				piece = this.NE;
				break;
			case 9:
				piece = this.WS;
				break;
			case 5:
				piece = this.SE;
				break;
		}
	}
	this.putAt(brow, bcol, piece);

	if (this.forcedMove(brow - 1, bcol) == false) {
		return false;
	}
	if (this.forcedMove(brow + 1, bcol) == false) {
		return false;
	}
	if (this.forcedMove(brow, bcol - 1) == false) {
		return false;
	}
	if (this.forcedMove(brow, bcol + 1) == false) {
		return false;
	}
	return true;
};

TraxBoard.prototype.getNumOfTiles = function() { 
	return this.num_of_tiles; 
};

TraxBoard.prototype.rotate = function() {
	var result = new Traxboard(this);
	for (var i=0; i<17; i++) {
		for (var j=0; j<17; j++) {
			switch (this.board[16-j][i]) {
				case NS:
					result.board[i][j]=this.WE;
					break;
				case WE:
					result.board[i][j]=this.NS;
					break;
				case EMPTY:
					result.board[i][j]=this.EMPTY;
					break;
				case NW:
					result.board[i][j]=this.NE;
					break;
				case NE:
					result.board[i][j]=this.SE;
					break;
				case SE:
					result.board[i][j]=this.SW;
					break;
				case SW:
					result.board[i][j]=this.NW;
					break;
			}
		}
	}
	result.setCorners();
	return result;
};

TraxBoard.prototype.saveState = function() {
	this.wtm_save = this.wtm;
	this.boardEmpty_save = this.boardEmpty;
	this.gameover_save = this.gameover;
	this.num_of_tiles_save = this.num_of_tiles;
	this.firstrow_save = this.firstrow;
	this.firstcol_save = this.firstcol;
	this.lastrow_save = this.lastrow;
	this.lastcol_save = this.lastcol;
	for (var i = 0; i < 17; i++) {
		for (var j = 0; j < 17; j++) {
			this.board_save[i][j] = this.board[i][j];
		}
	}
};

TraxBoard.prototype.restoreState = function() {
	this.wtm = this.wtm_save;
	this.boardEmpty = this.boardEmpty_save;
	this.gameover = this.gameover_save;
	this.num_of_tiles = this.num_of_tiles_save;
	this.firstrow = this.firstrow_save;
	this.firstcol = this.firstcol_save;
	this.lastrow = this.lastrow_save;
	this.lastcol = this.lastcol_save;
	for (var i = 0; i < 17; i++) {
		for (var j = 0; j < 17; j++) {
			this.board[i][j] = this.board_save[i][j];
		}
	}
};

TraxBoard.prototype.makeMove = function(move) {
	var oldNotation;
	var col, row, neighbor;
	var dir;
	var ohs_up = 0, 
		ohs_down = 0, 
		ohs_right = 0, 
		ohs_left = 0, 
		eks_up = 0, 
		eks_down = 0, 
		eks_right = 0, 
		eks_left = 0;

	if (this.gameover != this.NOPLAYER)
		throw "Game is over.";
	if (move.length !== 3)
		throw "not a move.";
	move = move.toUpperCase();
	if (this.boardEmpty) {
		if (move === "A1C" || move === "@0/") {
			this.putAt(1, 1,this.NW);
			this.switchPlayer();
			return;
		}
		if (move === "A1S" || move === "@0+") {
			this.putAt(1, 1,this.NS);
			this.switchPlayer();
			return;
		}
		throw "Only A1C,A1S,@0/ and @0+ accepted as first move. Got " + move;
	}

	// handle the old notation 1A special case (changing 1A -> A0)
	if (move.substr(0,2) === "1A") {
		col = 1;
		row = 0;
	} else {
		col = move[0].charCodeAt(0) - '@'.charCodeAt(0);
		row = move[1].charCodeAt(0) - '0'.charCodeAt(0);
	}
	if ((col < 0) || (col > 8))
		throw "Illegal column.";
	if ((row < 0) || (row > 8))
		throw "Illegal row.";
	if (col == 0 && row == 0)
		throw "no neighbors.";

	dir = move[2];
	switch (dir) {
	case 'C':
	case 'S':
	case 'U':
	case 'L':
	case 'R':
	case 'D':
		oldNotation = true;
		break;
	case '/':
	case '+':
	case '\\':
		oldNotation = false;
		break;
	default:
		throw "unknown direction.";
	}

	if (oldNotation) {
		if (!this.isBlank(row, col)) {
			if (col == 1)
				col--;
			else if (row == 1)
				row--;
		}
	}

	if (col == 0 && row == 0)
		throw "no neighbors.";
	if ((row == 0) && (!this.canMoveDown()))
		throw "illegal row.";
	if ((col == 0) && (!this.canMoveRight()))
		throw "illegal column.";
	if (!this.isBlank(row, col))
		throw "occupied." + move + " illegal";

	this.saveState();
	var up = this.getAt(row - 1, col), 
		down = this.getAt(row + 1, col), 
		left = this.getAt(row, col - 1), 
		right = this.getAt(row, col + 1);

	if (up ==this.SN || up ==this.SE || up ==this.SW)
		ohs_up = 1;
	if (up ==this.EW || up ==this.NW || up ==this.NE)
		eks_up = 1;
	if (down ==this.NS || down ==this.NE || down ==this.NW)
		ohs_down = 1;
	if (down ==this.EW || down ==this.SW || down ==this.SE)
		eks_down = 1;
	if (left ==this.EN || left ==this.ES || left ==this.EW)
		ohs_left = 1;
	if (left ==this.WS || left ==this.WN || left ==this.NS)
		eks_left = 1;
	if (right ==this.WN || right ==this.WE || right ==this.WS)
		ohs_right = 1;
	if (right ==this.ES || right ==this.NS || right ==this.EN)
		eks_right = 1;
	neighbor = 1 * ohs_up + 2 * ohs_down + 4 * ohs_left + 8 * ohs_right
			+ 16 * eks_up + 32 * eks_down + 64 * eks_left + 128 * eks_right;

	switch (neighbor) {
	case 0:
		throw "no neighbors.";
	case 1:
		switch (dir) {
		case '/':
		case 'L':
			this.putAt(row, col,this.NW);
			break;
		case '\\':
		case 'R':
			this.putAt(row, col,this.NE);
			break;
		case '+':
		case 'S':
			this.putAt(row, col,this.NS);
			break;
		case 'U':
		case 'C':
		case 'D':
			throw "illegal direction.";
		}
		break;
	case 2:
		switch (dir) {
		case '/':
		case 'R':
			this.putAt(row, col,this.SE);
			break;
		case '\\':
		case 'L':
			this.putAt(row, col,this.SW);
			break;
		case '+':
		case 'S':
			this.putAt(row, col,this.NS);
			break;
		case 'C':
		case 'U':
		case 'D':
			throw "illegal direction.";
		}
		break;
	case 4:
		switch (dir) {
		case '/':
		case 'U':
			this.putAt(row, col,this.WN);
			break;
		case '\\':
		case 'D':
			this.putAt(row, col,this.WS);
			break;
		case '+':
		case 'S':
			this.putAt(row, col,this.WE);
			break;
		case 'C':
		case 'R':
		case 'L':
			throw "illegal direction.";
		}
		break;
	case 8:
		switch (dir) {
		case '/':
		case 'D':
			this.putAt(row, col,this.ES);
			break;
		case '\\':
		case 'U':
			this.putAt(row, col,this.EN);
			break;
		case '+':
		case 'S':
			this.putAt(row, col,this.EW);
			break;
		case 'C':
		case 'R':
		case 'L':
			throw "illegal direction.";
		}
		break;
	case 16:
		switch (dir) {
		case '/':
		case 'L':
			this.putAt(row, col,this.SE);
			break;
		case '\\':
		case 'R':
			this.putAt(row, col,this.SW);
			break;
		case '+':
		case 'S':
			this.putAt(row, col,this.WE);
			break;
		case 'C':
		case 'U':
		case 'D':
			throw "illegal direction.";
		}
		break;
	case 18:
		switch (dir) {
		case '/':
		case 'R':
			this.putAt(row, col,this.SE);
			break;
		case '\\':
		case 'L':
		case 'C':
			this.putAt(row, col,this.SW);
			break;
		case '+':
		case 'S':
		case 'U':
		case 'D':
			throw "illegal direction.";
		}
		break;
	case 20:
		switch (dir) {
		case '/':
		case 'L':
		case 'U':
			throw "illegal direction.";
		case '\\':
		case 'C':
		case 'R':
		case 'D':
			this.putAt(row, col,this.WS);
			break;
		case '+':
		case 'S':
			this.putAt(row, col,this.WE);
			break;
		}
		break;
	case 24:
		switch (dir) {
		case '/':
		case 'L':
		case 'C':
		case 'D':
			this.putAt(row, col,this.SE);
			break;
		case 'U':
		case '\\':
		case 'R':
			throw "illegal direction.";
		case 'S':
		case '+':
			this.putAt(row, col,this.WE);
			break;
		}
		break;
	case 32:
		switch (dir) {
		case '/':
		case 'R':
			this.putAt(row, col,this.NW);
			break;
		case 'D':
		case 'U':
		case 'C':
			throw "illegal direction.";
		case '\\':
		case 'L':
			this.putAt(row, col,this.NE);
			break;
		case 'S':
		case '+':
			this.putAt(row, col,this.WE);
			break;
		}
		break;
	case 33:
		switch (dir) {
		case '/':
		case 'L':
			this.putAt(row, col, this.NW);
			break;
		case 'R':
		case '\\':
			this.putAt(row, col, this.NE);
			break;
		case 'C':
		case 'S':
		case '+':
		case 'D':
		case 'U':
			throw "illegal direction.";
		}
		break;
	case 36:
		if (dir == '/')
			this.putAt(row, col,this.NW);
		if (dir == '\\')
			throw "illegal direction.";
		if (dir == '+')
			this.putAt(row, col,this.WE);
		if (dir == 'S')
			this.putAt(row, col,this.WE);
		if (dir == 'C')
			this.putAt(row, col,this.WN);
		if (dir == 'L')
			throw "illegal direction.";
		if (dir == 'R')
			this.putAt(row, col,this.WN);
		if (dir == 'U')
			this.putAt(row, col,this.WN);
		if (dir == 'D')
			throw "illegal direction.";
		break;
	case 40:
		if (dir == '/')
			throw "illegal direction.";
		if (dir == '\\')
			this.putAt(row, col,this.EN);
		if (dir == '+')
			this.putAt(row, col,this.EW);
		if (dir == 'S')
			this.putAt(row, col,this.WE);
		if (dir == 'C')
			putAt(row, col,this.NE);
		if (dir == 'L')
			this.putAt(row, col,this.NE);
		if (dir == 'R')
			throw "illegal direction.";
		if (dir == 'U')
			this.putAt(row, col,this.NE);
		if (dir == 'D')
			throw "illegal direction.";
		break;
	case 64:
		if (dir == '/')
			this.putAt(row, col,this.ES);
		if (dir == '\\')
			this.putAt(row, col,this.EN);
		if (dir == '+')
			this.putAt(row, col,this.NS);
		if (dir == 'S')
			this.putAt(row, col,this.NS);
		if (dir == 'C')
			throw "illegal direction.";
		if (dir == 'L')
			throw "illegal direction.";
		if (dir == 'R')
			throw "illegal direction.";
		if (dir == 'U')
			this.putAt(row, col,this.SE);
		if (dir == 'D')
			this.putAt(row, col,this.NE);
		break;
	case 65:
		if (dir == '/')
			throw "illegal direction.";
		if (dir == '\\')
			this.putAt(row, col,this.NE);
		if (dir == '+')
			this.putAt(row, col,this.NS);
		if (dir == 'S')
			this.putAt(row, col,this.NS);
		if (dir == 'C')
			this.putAt(row, col,this.NE);
		if (dir == 'L')
			throw "illegal direction.";
		if (dir == 'R')
			this.putAt(row, col,this.NE);
		if (dir == 'U')
			throw "illegal direction.";
		if (dir == 'D')
			this.putAt(row, col,this.NE);
		break;
	case 66:
		if (dir == '/')
			this.putAt(row, col,this.SE);
		if (dir == '\\')
			throw "illegal direction.";
		if (dir == '+')
			this.putAt(row, col,this.SN);
		if (dir == 'S')
			this.putAt(row, col,this.SN);
		if (dir == 'C')
			this.putAt(row, col,this.SE);
		if (dir == 'L')
			throw "illegal direction.";
		if (dir == 'R')
			this.putAt(row, col,this.SE);
		if (dir == 'U')
			this.putAt(row, col,this.SE);
		if (dir == 'D')
			throw "illegal direction.";
		break;
	case 72:
		if (dir == '/')
			this.putAt(row, col,this.ES);
		if (dir == '\\')
			this.putAt(row, col,this.EN);
		if (dir == '+')
			throw "illegal direction.";
		if (dir == 'S')
			throw "illegal direction.";
		if (dir == 'C')
			throw "illegal direction.";
		if (dir == 'L')
			throw "illegal direction.";
		if (dir == 'R')
			throw "illegal direction.";
		if (dir == 'U')
			this.putAt(row, col,this.NE);
		if (dir == 'D')
			this.putAt(row, col,this.SE);
		break;
case 128:
	if (dir == '/')
		this.putAt(row, col,this.WN);
	if (dir == '\\')
		this.putAt(row, col,this.WS);
	if (dir == '+')
		this.putAt(row, col,this.NS);
	if (dir == 'S')
		this.putAt(row, col,this.NS);
	if (dir == 'C')
		throw "illegal direction.";
	if (dir == 'L')
		throw "illegal direction.";
	if (dir == 'R')
		throw "illegal direction.";
	if (dir == 'U')
		this.putAt(row, col,this.WS);
	if (dir == 'D')
		this.putAt(row, col,this.WN);
	break;
case 129:
	if (dir == '/')
		this.putAt(row, col,this.NW);
	if (dir == '\\')
		throw "illegal direction.";
	if (dir == '+')
		this.putAt(row, col,this.NS);
	if (dir == 'S')
		this.putAt(row, col,this.NS);
	if (dir == 'C')
		this.putAt(row, col,this.NW);
	if (dir == 'L')
		this.putAt(row, col,this.NW);
	if (dir == 'R')
		throw "illegal direction.";
	if (dir == 'U')
		throw "illegal direction.";
	if (dir == 'D')
		this.putAt(row, col,this.NW);
	break;
case 130:
	if (dir == '/')
		throw "illegal direction.";
	if (dir == '\\')
		this.putAt(row, col,this.SW);
	if (dir == '+')
		this.putAt(row, col,this.SN);
	if (dir == 'S')
		this.putAt(row, col,this.SN);
	if (dir == 'C')
		this.putAt(row, col,this.SW);
	if (dir == 'L')
		this.putAt(row, col,this.SW);
	if (dir == 'R')
		throw "illegal direction.";
	if (dir == 'U')
		this.putAt(row, col,this.SW);
	if (dir == 'D')
		throw "illegal direction.";
	break;
case 132:
	if (dir == '/')
		this.putAt(row, col,this.WN);
	if (dir == '\\')
		this.putAt(row, col,this.WS);
	if (dir == '+')
		throw "illegal direction.";
	if (dir == 'S')
		throw "illegal direction.";
	if (dir == 'C')
		throw "illegal direction.";
	if (dir == 'L')
		throw "illegal direction.";
	if (dir == 'R')
		throw "illegal direction.";
	if (dir == 'U')
		this.putAt(row, col,this.WN);
	if (dir == 'D')
		this.putAt(row, col,this.WS);
	break;
	}
	if (row == 0)
		row++;
	if (col == 0)
		col++;
	if (!this.forcedMove(row - 1, col)) {
		this.restoreState();
		throw "illegal filled cave.";
	}
	if (!this.forcedMove(row + 1, col)) {
		this.restoreState();
		throw "illegal filled cave.";
	}
	if (!this.forcedMove(row, col - 1)) {
		this.restoreState();
		throw "illegal filled cave.";
	}
	if (!this.forcedMove(row, col + 1)) {
		this.restoreState();
		throw "illegal filled cave.";
	}
	/* note that switchPlayer() _must_ come before isGameOver() */
	this.switchPlayer();
	this.isGameOver(); // updates the gameOver attribute
 };

TraxBoard.prototype.switchPlayer = function() {
	switch (this.wtm) {
		case this.WHITE:
			this.wtm = this.BLACK;
			break;
		case this.BLACK:
			this.wtm = this.WHITE;
			break;
	}
}

TraxBoard.prototype.isGameOver = function() {
	var WhiteWins = false, 
		BlackWins = false;
	var sp;

	if (this.gameover != this.NOPLAYER)
		return this.gameover;
	if (this.num_of_tiles < 4) {
		this.gameover = this.NOPLAYER;
		return this.gameover;
	}

	if (this.uniqueMoves().length == 0) {
		this.gameover = this.DRAW;
		return this.gameover;
	}

	// check for line win.
	// check left-right line
	if (this.getColSize() == 8) {
		// check left-right line
		for (var row = 1; row <= 8; row++) {
			if (this.checkLine(row, 1, 'r', 'h')) {
				// Line win
				sp = this.getAt(row, 1);
				if (sp == this.NS || sp == this.NE || sp == this.ES)
					BlackWins = true;
				else
					WhiteWins = true;
			}
		}
	}
	// check up-down line
	if (this.getRowSize() == 8) {
		for (var col = 1; col <= 8; col++) {
			if (this.checkLine(1, col, 'd', 'v')) {
				// Line win
				sp = this.getAt(1, col);
				if (sp == this.WE || sp == this.WS || sp == this.SE)
					BlackWins = true;
				else
					WhiteWins = true;
			}
		}
	}

	// if (need_loop_check==true) {
	// Now check loop wins
	for (var i = 1; i < 8; i++) {
		for (var j = 1; j < 8; j++) {
			switch (this.getAt(i, j)) {
			case this.NW:
				if (this.checkLine(i, j, 'u', 'l'))
					BlackWins = true;
				break;
			case this.SE:
				if (this.checkLine(i, j, 'u', 'l'))
					WhiteWins = true;
				break;
			case this.EMPTY:
			case this.NS:
			case this.WE:
			case this.NE:
			case this.WS:
				break;
			}
		}
	}
	// }

	if (WhiteWins && BlackWins) {
		this.gameover = this.whoDidLastMove();
		return this.gameover;
	}
	if (WhiteWins) {
		this.gameover = this.WHITE;
		return this.gameover;
	}
	if (BlackWins) {
		this.gameover = this.BLACK;
		return this.gameover;
	}
	return this.NOPLAYER;
}

TraxBoard.prototype.isRightLeftMirror = function() { 
	return isLeftRightMirror();
};

TraxBoard.prototype.isDownUpMirror = function() { 
	return isUpDownMirror();
};

TraxBoard.prototype.isUpDownMirror = function() {
	var piece, i, j, i2;

	i2 = this.getRowSize();
	for (i = 1; i <= ((this.getRowSize() + 1) / 2); i++) {
		for (j = 1; j <= this.getColSize(); j++) {
			piece = this.getAt(i, j);
			switch (this.getAt(i2, j)) {
			case this.NW:
				if (piece != this.SW)
					return false;
				break;
			case this.NE:
				if (piece != this.SE)
					return false;
				break;
			case this.SW:
				if (piece != this.NW)
					return false;
				break;
			case this.SE:
				if (piece != this.NE)
					return false;
				break;
			case this.NS:
				if (piece != this.NS)
					return false;
				break;
			case this.WE:
				if (piece != this.WE)
					return false;
				break;
			case this.EMPTY:
				if (piece != this.EMPTY)
					return false;
				break;
			}
		}
		i2--;
	}
	return true;
};

TraxBoard.prototype.isLeftRightMirror = function() {
	var piece, i, j, j2;

	for (i = 1; i <= this.getRowSize(); i++) {
		j2 = this.getColSize();
		for (j = 1; j <= ((this.getColSize() + 1) / 2); j++) {
			piece = this.getAt(i, j);
			switch (this.getAt(i, j2)) {
			case this.NW:
				if (piece != this.NE)
					return false;
				break;
			case this.NE:
				if (piece != this.NW)
					return false;
				break;
			case this.SW:
				if (piece != this.SE)
					return false;
				break;
			case this.SE:
				if (piece != this.SW)
					return false;
				break;
			case this.NS:
				if (piece != this.NS)
					return false;
				break;
			case this.WE:
				if (piece != this.WE)
					return false;
				break;
			case this.EMPTY:
				if (piece != this.EMPTY)
					return false;
				break;
			}
			j2--;
		}
	}
	return true;
};

TraxBoard.prototype.checkLine = function (row, col, direction, type) {
	var start_row = row;
	var start_col = col;
	var ix = 0;
	var newdir;

	newdir = " uurllr" // 'u' 1.. 6
			+ "ddlrrl" // 'd' 7..12
			+ "llduud" // 'l' 13..18
			+ "rruddu"; // 'r' 19..24

	for (;;) {
		if (this.isBlank(row, col))
			return false; // no line starts with a empty space
		// or we are out of range
		switch (direction) {
		case 'u':
			// newdir's first line
			ix = 0;
			break;
		case 'd':
			// newdir's second line
			ix = 6;
			break;
		case 'l':
			// newdir's third line
			ix = 12;
			break;
		case 'r':
			// newdir's fourth line
			ix = 18;
			break;
		}
		ix += this.getAt(row, col);
		direction = newdir[ix];
		switch (direction) {
		case 'u':
			row--;
			break;
		case 'd':
			row++;
			break;
		case 'l':
			col--;
			break;
		case 'r':
			col++;
			break;
		}
		if ((type == 'h') && (col == 9))
			return true; // left-right win
		if ((type == 'v') && (row == 9))
			return true; // top-buttom win
		if ((row == start_row) && (col == start_col)) {
			if (type == 'l')
				return true; // loop win
			else
				return false;
		}
	}
};

TraxBoard.prototype.isRotateMirror = function () {
	var i, j, piece, i2, j2;

	i2 = this.getRowSize();
	for (i = 1; i <= ((this.getRowSize() + 1) / 2); i++) {
		j2 = this.getColSize();
		for (j = 1; j <= this.getColSize(); j++) {
			piece = this.getAt(i, j);
			switch (this.getAt(i2, j2)) {
			case this.NW:
				if (piece != this.SE)
					return false;
				break;
			case this.NE:
				if (piece != this.SW)
					return false;
				break;
			case this.SW:
				if (piece != this.NE)
					return false;
				break;
			case this.SE:
				if (piece != this.NW)
					return false;
				break;
			case this.NS:
				if (piece != this.NS)
					return false;
				break;
			case this.WE:
				if (piece != this.WE)
					return false;
				break;
			case this.EMPTY:
				if (piece != this.EMPTY)
					return false;
				break;
			}
			j2--;
		}
		i2--;
	}
	return true;
};

TraxBoard.prototype.whoToMove = function () { 
	return this.wtm; 
};

TraxBoard.prototype.whoDidLastMove = function () {
	if (this.boardEmpty)
		return this.NOPLAYER;
	switch (this.wtm) {
	case this.WHITE:
		return this.BLACK;
	case this.BLACK:
		return this.WHITE;
	}
};

TraxBoard.prototype.getBorder = function () { 
	return this.getBorder(false); 
};

TraxBoard.prototype.getBorder = function (needNumbers) {
	var result = new String();
	var dummy = [];
	var i, j, k, starti, startj, icopy, jcopy;
	var direction;
	var wnum = []; // every white line gets a number
	var bnum = [];
	var currentWNum = 1;
	var currentBNum = 1;

	if (this.whoDidLastMove() == this.NOPLAYER)
		return result;
	for (i = 1; i < 9; i++) {
		wnum[i] = [];
		bnum[i] = [];
		for (j = 1; j < 9; j++) {
			for (k = 0; k < 4; k++) {
				//TODO Why this loop?
				wnum[i][j] = 0;
				bnum[i][j] = 0;
			}
		}
	}
	starti = 1;
	startj = 1;
	while (this.getAt(starti, startj) == this.EMPTY)
		starti++;

	direction = 'd';
	i = starti;
	j = startj;
	while (true) {
		switch (direction) {
		case 'd':
			switch (this.getAt(i, j)) {
			case this.NW:
			case this.SW:
			case this.WE:
				result += 'W';
				break;
			case this.NS:
			case this.NE:
			case this.SE:
				result += 'B';
				break;
			}
			if (this.getAt(i + 1, j - 1) != this.EMPTY) {
				direction = 'l';
				result += '+';
				i++;
				j--;
				break;
			}
			if (this.getAt(i + 1, j) == this.EMPTY) {
				direction = 'r';
				result += '-';
				break;
			}
			i++;
			break;
		case 'u':
			switch (this.getAt(i, j)) {
			case this.EW:
			case this.NE:
			case this.ES:
				result += 'W';
				break;
			case this.WS:
			case this.SN:
			case this.NW:
				result += 'B';
				break;
			}
			if (this.getAt(i - 1, j + 1) != this.EMPTY) {
				direction = 'r';
				result += '+';
				i--;
				j++;
				break;
			}
			if (this.getAt(i - 1, j) == this.EMPTY) {
				direction = 'l';
				result += '-';
				break;
			}
			i--;
			break;
		case 'l':
			switch (this.getAt(i, j)) {
			case this.NW:
			case this.SN:
			case this.NE:
				result += 'W';
				break;
			case this.WE:
			case this.SE:
			case this.SW:
				result += 'B';
				break;
			}
			if (this.getAt(i - 1, j - 1) != this.EMPTY) {
				direction = 'u';
				result += '+';
				i--;
				j--;
				break;
			}
			if (this.getAt(i, j - 1) == this.EMPTY) {
				if ((i == starti) && (j == startj))
					return result;
				result += '-';
				direction = 'd';
				break;
			}
			j--;
			break;
		case 'r':
			switch (this.getAt(i, j)) {
			case this.NS:
			case this.SE:
			case this.SW:
				result += 'W';
				break;
			case this.NE:
			case this.NW:
			case this.WE:
				result += 'B';
				break;
			}
			if (this.getAt(i + 1, j + 1) != this.EMPTY) {
				direction = 'd';
				result += '+';
				i++;
				j++;
				break;
			}
			if (this.getAt(i, j + 1) == this.EMPTY) {
				direction = 'u';
				result += '-';
				break;
			}
			j++;
			break;
		}
	}
};

TraxBoard.prototype.neighbor_value = function (x, y) {
	var value = 0;
	var up = this.getAt(x - 1, y), 
		down = this.getAt(x + 1, y), 
		left = this.getAt(x, y - 1), 
		right = this.getAt(x, y + 1);
	if (up == this.SN || up == this.SE || up == this.SW) {
		value += 1;
	} // ohs_up
	if (up == this.EW || up == this.NW || up == this.NE) {
		value += 16;
	} // eks_up
	if (down == this.NS || down == this.NE || down == this.NW) {
		value += 2;
	} // ohs_down
	if (down == this.EW || down == this.SW || down == this.SE) {
		value += 32;
	} // eks_down
	if (left == this.EN || left == this.ES || left == this.EW) {
		value += 4;
	} // ohs_left;
	if (left == this.WS || left == this.WN || left == this.NS) {
		value += 64;
	} // eks_left;
	if (right == this.WN || right == this.WE || right == this.WS) {
		value += 8;
	} // ohs.right
	if (right == this.ES || right == this.NS || right == this.EN) {
		value += 128;
	} // eks.right
	return value;
};

TraxBoard.prototype.getLegalTiles = function (x, y) {
	var result = [];
	if (this.boardEmpty) {
		result.push(this.NW);
		result.push(this.NS);
	}
	switch (this.neighbor_value(x, y)) {
	case 0:
		return result;
	case 1:
		result.push(this.NW);
		result.push(this.NS);
		result.push(this.NE);
		return result;
	case 128:
		result.push(this.WS);
		result.push(this.NS);
		result.push(this.WN);
		return result;
	case 2:
		result.push(this.SW);
		result.push(this.SE);
		result.push(this.SN);
		return result;
	case 32:
		result.push(this.WE);
		result.push(this.WN);
		result.push(this.NE);
		return result;
	case 8:
		result.push(this.EW);
		result.push(this.ES);
		result.push(this.EN);
		return result;
	case 4:
		result.push(this.WE);
		result.push(this.WS);
		result.push(this.WN);
		return result;
	case 64:
		result.push(this.NS);
		result.push(this.NE);
		result.push(this.SE);
		return result;
	case 16:
		result.push(this.WE);
		result.push(this.WS);
		result.push(this.SE);
		return result;
	case 36:
		result.push(this.WN);
		result.push(this.WE);
		return result;
	case 66:
		result.push(this.SN);
		result.push(this.SE);
		return result;
	case 132:
		result.push(this.WN);
		result.push(this.WS);
		return result;
	case 72:
		result.push(this.EN);
		result.push(this.ES);
		return result;
	case 65:
		result.push(this.NS);
		result.push(this.NE);
		return result;
	case 20:
		result.push(this.WE);
		result.push(this.WS);
		return result;
	case 33:
		result.push(this.NW);
		result.push(this.NE);
		return result;
	case 18:
		result.push(this.SW);
		result.push(this.SE);
		return result;
	case 129:
		result.push(this.NW);
		result.push(this.NS);
		return result;
	case 24:
		result.push(this.EW);
		result.push(this.ES);
		return result;
	case 40:
		result.push(this.EW);
		result.push(this.EN);
		return result;
	case 130:
		result.push(this.SN);
		result.push(this.SW);
		return result;
	}
};

TraxBoard.prototype.uniqueMoves = function () {
	var Moves = [];
	var AMove;
	var i, j, k;
	var dl, dr, ur, ul, rr;
	var neighbors = []; // which neighbors - default all
	for (i = 0; i < 10; i++) {
		neighbors[i] = [];
	}
	// values 0
	var dirlist = []; // which directions for
	// move
	// 0 /, 1 \, 2 +
	// true means already used
	// default all values false
	var ohs_up, ohs_down, ohs_right, ohs_left, eks_up, eks_down, eks_right, eks_left;
	var up, down, left, right;
	var ohs, eks;
	var iBegin, jBegin, iEnd, jEnd;
	var lrsym, udsym, rsym;
	var col = "@ABCDEFGH";
	var row = "012345678";

	if (this.gameover != this.NOPLAYER) {
		return [];
	}

	if (this.boardEmpty == true) { // empty board only these two moves
		Moves.push("@0/");
		Moves.push("@0+");
		return Moves;
	}
	if (this.getRowSize() * this.getColSize() == 1) {
		switch (this.getAt(1, 1)) {
		case this.NW:
			Moves.push("@1+");
			Moves.push("@1/");
			Moves.push("B1+");
			Moves.push("B1/");
			Moves.push("B1\\");
			break;
		case this.NS:
			Moves.push("@1+");
			Moves.push("@1/");
			Moves.push("A0/");
			Moves.push("A0+");
			break;
		}
		return Moves;
	}

	for (i = 0; i < 10; i++) {
		dirlist[i] = [];
		for (j = 0; j < 10; j++) {
			dirlist[i][j] = [];
			for (k = 0; k < 3; k++) {
				dirlist[i][j][k] = false;
			}
		}
	}

	lrsym = this.isLeftRightMirror();
	udsym = this.isUpDownMirror();
	rsym = this.isRotateMirror();
	iBegin = (this.canMoveDown() == true) ? 0 : 1;
	jBegin = (this.canMoveRight() == true) ? 0 : 1;
	iEnd = (this.getRowSize() < 8) ? this.getRowSize() + 1 : 8;
	jEnd = (this.getColSize() < 8) ? this.getColSize() + 1 : 8;
	if (lrsym)
		jEnd = (this.getColSize() + 1) / 2;
	if (rsym || udsym)
		iEnd = (this.getRowSize() + 1) / 2;

	for (i = iBegin; i <= iEnd; i++) {
		for (j = jBegin; j <= jEnd; j++) {
			if (!(this.isBlank(i, j))) {
				neighbors[i][j] = 0;
			} else {
				ohs_up = 0;
				ohs_down = 0;
				ohs_right = 0;
				ohs_left = 0;
				eks_up = 0;
				eks_down = 0;
				eks_right = 0;
				eks_left = 0;
				up = this.getAt(i - 1, j);
				down = this.getAt(i + 1, j);
				left = this.getAt(i, j - 1);
				right = this.getAt(i, j + 1);

				if (up == this.SN || up == this.SW || up == this.SE) {
					ohs_up = 1;
				} else if (up != this.EMPTY) {
					eks_up = 1;
				}

				if (down == this.NS || down == this.NW || down == this.NE) {
					ohs_down = 1;
				} else if (down != this.EMPTY) {
					eks_down = 1;
				}

				if (left == this.EN || left == this.ES || left == this.WE)
					ohs_left = 1;
				else if (left != this.EMPTY)
					eks_left = 1;

				if (right == this.WE || right == this.WS || right == this.WN)
					ohs_right = 1;
				else if (right != this.EMPTY)
					eks_right = 1;

				ohs = ohs_up + ohs_down + ohs_left + ohs_right;
				eks = eks_up + eks_down + eks_left + eks_right;
				neighbors[i][j] = 1 * ohs_up + 2 * ohs_down + 4 * ohs_left
						+ 8 * ohs_right + 16 * eks_up + 32 * eks_down + 64
						* eks_left + 128 * eks_right;
			}
		}
	}

	for (i = iBegin; i <= iEnd; i++) {
		for (j = jBegin; j <= jEnd; j++) {
			if (neighbors[i][j] != 0) {
				dl = this.getAt(i + 1, j - 1);
				dr = this.getAt(i + 1, j + 1);
				ur = this.getAt(i - 1, j + 1);
				ul = this.getAt(i - 1, j - 1);
				rr = this.getAt(i, j + 2);
				switch (neighbors[i][j]) {
				case 1: {
					if (dr == this.NS || dr == this.NW || dr == this.NE)
						dirlist[i][j + 1][1] = true;
					if (dr == this.WN || dr == this.WS || dr == this.WE)
						dirlist[i + 1][j][1] = true;
					if (dl == this.EW || dl == this.ES || dl == this.ES)
						dirlist[i + 1][j][0] = true;
					if (ur == this.SW || ur == this.SE || ur == this.SN)
						dirlist[i][j + 1][0] = true;
					break;
				}
				case 2: {
					if (dr == this.NS || dr == this.NW || dr == this.NE)
						dirlist[i][j + 1][1] = true;
					if (ur == this.SW || ur == this.SE || ur == this.SN)
						dirlist[i][j + 1][0] = true;
					break;
				}
				case 4: {
					if (dl == this.ES || dl == this.EN || dl == this.EW)
						dirlist[i + 1][j][0] = true;
					if (dr == this.WN || dr == this.WS || dr == this.WE)
						dirlist[i + 1][j][1] = true;
					if (ur == this.SW || ur == this.SN || ur == this.SE)
						dirlist[i][j + 1][0] = true;
					if (dr == this.NS || dr == this.NE || dr == this.NW)
						dirlist[i][j + 1][1] = true;
					break;
				}
				case 8: {
					if (dl == this.ES || dl == this.EN || dl == this.EW)
						dirlist[i + 1][j][0] = true;
					if (dr == this.WN || dr == this.WE || dr == this.WS)
						dirlist[i + 1][j][1] = true;
					break;
				}
				case 16: {
					if (dr == this.SW || dr == this.SE || dr == this.WE)
						dirlist[i][j + 1][1] = true;
					if (dr == this.SE || dr == this.SN || dr == this.EN)
						dirlist[i + 1][j][1] = true;
					if (dl == this.NW || dl == this.NS || dl == this.WS)
						dirlist[i + 1][j][0] = true;
					if (ur == this.NW || ur == this.NE || ur == this.WE)
						dirlist[i][j + 1][0] = true;
					break;
				}
				case 18:
				case 33: {
					dirlist[i][j + 1][1] = true;
					dirlist[i][j + 1][0] = true;
					dirlist[i][j][2] = true;
					break;
				}
				case 20:
				case 65: {
					if (rr != this.EMPTY)
						dirlist[i][j + 1][2] = true;
					dirlist[i + 1][j][0] = true;
					dirlist[i + 1][j][1] = true;
					dirlist[i][j + 1][0] = true;
					dirlist[i][j][0] = true;
					break;
				}
				case 24:
				case 129: {
					dirlist[i + 1][j][1] = true;
					dirlist[i][j][1] = true;
					break;
				}
				case 32: {
					if (dr == this.SE || dr == this.SW || dr == this.EW)
						dirlist[i][j + 1][1] = true;
					if (ur == this.NW || ur == this.NE || ur == this.WE)
						dirlist[i][j + 1][0] = true;
					break;
				}
				case 36: {
					if (ul == this.NW || ul == this.SW || ul == this.NS)
						dirlist[i - 1][j][1] = true;
					dirlist[i][j + 1][1] = true;
					dirlist[i][j + 1][0] = true;
					dirlist[i][j][1] = true;
					break;
				}
				case 40:
				case 130: {
					dirlist[i][j][0] = true;
					break;
				}
				case 64: {
					if (dl == this.WN || dl == this.WS || dl == this.NS)
						dirlist[i + 1][j][0] = true;
					if (dr == this.EN || dr == this.ES || dr == this.NS)
						dirlist[i + 1][j][1] = true;
					if (ur == this.NW || ur == this.NE || ur == this.WE)
						dirlist[i][j + 1][0] = true;
					if (dr == this.SE || dr == this.SW || dr == this.EW)
						dirlist[i][j + 1][1] = true;
					break;
				}
				case 66: {
					if (ul == this.EW || ul == this.ES || ul == this.EN)
						dirlist[i - 1][j][1] = true;
					dirlist[i][j + 1][1] = true;
					dirlist[i][j + 1][0] = true;
					dirlist[i][j][1] = true;
					break;
				}
				case 72:
				case 132: {
					dirlist[i + 1][j][0] = true;
					dirlist[i + 1][j][1] = true;
					dirlist[i][j][2] = true;
					break;
				}
				case 128: {
					if (dl == this.WS || dl == this.WN || dl == this.SN)
						dirlist[i + 1][j][0] = true;
					if (dr == this.EN || dr == this.ES || dr == this.NS)
						dirlist[i + 1][j][1] = true;
					break;
				}
				}
			}
		}
	}

	// remove left-right symmetry moves
	if (lrsym && this.getColSize() % 2 == 1) {
		for (i = iBegin; i <= iEnd; i++) {
			dirlist[i][jEnd][0] = true;
		}
	}
	// remove up-down symmetry moves
	if (udsym && this.getRowSize() % 2 == 1) {
		for (j = jBegin; j <= jEnd; j++) {
			dirlist[iEnd][j][1] = true;
		}
	}

	// collects the moves
	for (i = iBegin; i <= iEnd; i++)
		for (j = jBegin; j <= jEnd; j++) {
			// remove rotation symmetry moves
			if (rsym && this.getRowSize() % 2 == 1) {
				var jMiddle = (this.getColSize() + 1) / 2;
				if (j > jMiddle && i == iEnd) {
					continue;
				}
			}
			if (neighbors[i][j] != 0) {
				ohs_up = 0;
				ohs_down = 0;
				ohs_right = 0;
				ohs_left = 0;
				eks_up = 0;
				eks_down = 0;
				eks_right = 0;
				eks_left = 0;
				up = this.getAt(i - 1, j);
				down = this.getAt(i + 1, j);
				left = this.getAt(i, j - 1);
				right = this.getAt(i, j + 1);

				if (up == this.SN || up == this.SW || up == this.SE)
					ohs_up = 1;
				else if (up != this.EMPTY)
					eks_up = 1;
				if (down == this.NS || down == this.NW || down == this.NE)
					ohs_down = 1;
				else if (down != this.EMPTY)
					eks_down = 1;
				if (left == this.EN || left == this.ES || left == this.WE)
					ohs_left = 1;
				else if (left != this.EMPTY)
					eks_left = 1;
				if (right == this.WE || right == this.WS || right == this.WN)
					ohs_right = 1;
				else if (right != this.EMPTY)
					eks_right = 1;

				if (dirlist[i][j][0] == false) {
					this.saveState();
					if ((ohs_up + ohs_left > 0)
							|| (eks_right + eks_down > 0))
						this.putAt(i, j, this.NW);
					if ((eks_up + eks_left > 0)
							|| (ohs_right + ohs_down > 0))
						this.putAt(i, j, this.SE);
					if (this.forcedMove(i - 1, j) && this.forcedMove(i + 1, j)
							&& this.forcedMove(i, j - 1) && this.forcedMove(i, j + 1)) {
						Moves.push(this.col_row_array[j][i] + "/");
					}
					this.restoreState();
				}
				if (dirlist[i][j][1] == false) {
					this.saveState();
					if ((ohs_up + ohs_right > 0)
							|| (eks_left + eks_down > 0))
						this.putAt(i, j, this.NE);
					if ((eks_up + eks_right > 0)
							|| (ohs_left + ohs_down > 0))
						this.putAt(i, j, this.SW);
					if (this.forcedMove(i - 1, j) && this.forcedMove(i + 1, j)
							&& this.forcedMove(i, j - 1) && this.forcedMove(i, j + 1)) {
						Moves.push(this.col_row_array[j][i] + "\\");
					}
					this.restoreState();
				}
				if (dirlist[i][j][2] == false) {
					this.saveState();
					if ((ohs_up + ohs_down > 0)
							|| (eks_left + eks_right > 0))
						this.putAt(i, j, this.NS);
					if ((eks_up + eks_down > 0)
							|| (ohs_left + ohs_right > 0))
						this.putAt(i, j, this.WE);
					if (this.forcedMove(i - 1, j) && this.forcedMove(i + 1, j)
							&& this.forcedMove(i, j - 1) && this.forcedMove(i, j + 1)) {
						Moves.push(this.col_row_array[j][i] + "+");
					}
					this.restoreState();
				}
			}
		}
	return Moves;
};

TraxBoard.prototype.updateLine = function (colour, entry, row, col) {
	var theNum;

	while (true) {
		theNum = 0;
		if (colour == 'w')
			theNum = 1024;
		switch (entry) {
		case 'w':
			theNum += 512;
			break;
		case 'e':
			theNum += 256;
			break;
		case 's':
			theNum += 128;
			break;
		case 'n':
			theNum += 64;
			break;
		}
		switch (this.getAt(row, col)) {
		case this.NS:
			theNum += 32;
			break;
		case this.WE:
			theNum += 16;
			break;
		case this.NW:
			theNum += 8;
			break;
		case this.NE:
			theNum += 4;
			break;
		case this.SW:
			theNum += 2;
			break;
		case this.SE:
			theNum += 1;
			break;
		}
		switch (theNum) {
		case 1024 + 512 + 16:
			if (this.getAt(row, col + 1) == this.EMPTY)
				return;
		col++;
		break;
		case 1024 + 512 + 8:
			if (this.getAt(row - 1, col) == this.EMPTY)
				return;
		row--;
		entry = 's';
		break;
		case 1024 + 512 + 2:
			if (this.getAt(row + 1, col) == this.EMPTY)
				return;
		row++;
		entry = 'n';
		break;
		case 1024 + 256 + 16:
			if (this.getAt(row, col - 1) == this.EMPTY)
				return;
		col--;
		break;
		case 1024 + 256 + 4:
			if (this.getAt(row - 1, col) == this.EMPTY)
				return;
		row--;
		entry = 's';
		break;
		case 1024 + 256 + 1:
			if (this.getAt(row + 1, col) == this.EMPTY)
				return;
		row++;
		entry = 'n';
		break;
		case 1024 + 128 + 32:
			if (this.getAt(row - 1, col) == this.EMPTY)
				return;
		row--;
		break;
		case 1024 + 128 + 2:
			if (this.getAt(row, col - 1) == this.EMPTY)
				return;
		col--;
		entry = 'e';
		break;
		case 1024 + 128 + 1:
			if (this.getAt(row, col + 1) == this.EMPTY)
				return;
		col++;
		entry = 'w';
		break;
		case 1024 + 64 + 32:
			if (this.getAt(row + 1, col) == this.EMPTY)
				return;
		row++;
		break;
		case 1024 + 64 + 8:
			if (this.getAt(row, col - 1) == this.EMPTY)
				return;
		col--;
		entry = 'e';
		break;
		case 1024 + 64 + 4:
			if (this.getAt(row, col + 1) == this.EMPTY)
				return;
		col++;
		entry = 'w';
		break;
		case 512 + 32:
			if (this.getAt(row, col + 1) == this.EMPTY)
				return;
		col++;
		break;
		case 512 + 4:
			if (this.getAt(row + 1, col) == this.EMPTY)
				return;
		row++;
		entry = 'n';
		break;
		case 512 + 1:
			if (this.getAt(row - 1, col) == this.EMPTY)
				return;
		row--;
		entry = 's';
		break;
		case 256 + 32:
			if (this.getAt(row - 1, col) == this.EMPTY)
				return;
		row--;
		break;
		case 256 + 8:
			if (this.getAt(row, col + 1) == this.EMPTY)
				return;
		row++;
		entry = 'n';
		break;
		case 256 + 2:
			if (this.getAt(row - 1, col) == this.EMPTY)
				return;
		row--;
		entry = 's';
		break;
		case 128 + 16:
			if (this.getAt(row - 1, col) == this.EMPTY)
				return;
		row--;
		break;
		case 128 + 8:
			if (this.getAt(row, col + 1) == this.EMPTY)
				return;
		col++;
		entry = 'w';
		break;
		case 128 + 4:
			if (this.getAt(row, col - 1) == this.EMPTY)
				return;
		col--;
		entry = 'e';
		break;
		case 64 + 16:
			if (this.getAt(row + 1, col) == this.EMPTY)
				return;
		row++;
		break;
		case 64 + 2:
			if (this.getAt(row, col + 1) == this.EMPTY)
				return;
		col++;
		entry = 'w';
		break;
		case 64 + 1:
			if (this.getAt(row, col - 1) == this.EMPTY)
				return;
		col--;
		entry = 'e';
		break;
		}
	}
};

TraxBoard.prototype.printToScreen = function () {
	document.write("<pre>"+this.toString()+"</pre>");
};

TraxBoard.prototype.toString = function () {
	var result = [];
	var i, j, k;
	var leftpiece, uppiece, upleftpiece;
	var cols = "     A     B     C     D     E     F     G     H     ";
	var rows = "1 2 3 4 5 6 7 8 ";

	if (this.boardEmpty)
		return '';
	result.push(cols.substring(0, 5 + 6 * this.getColSize()));
	result.push('\n');
	for (i = 1; i <= this.getRowSize(); i++) {
		for (k = 0; k < 4; k++) {
			if (k == 2) {
				result.push(rows.substring(i * 2 - 2, i * 2));
				// result.push(rows,i*2-2,2);
			} else {
				result.push("  ");
			}
			for (j = 1; j <= this.getColSize(); j++) {
				switch (this.getAt(i, j)) {
				case this.NS:
					switch (k) {
					case 0:
						result.push("+--o--");
						break;
					case 1:
						result.push("|  o  ");
						break;
					case 2:
						result.push("######");
						break;
					case 3:
						result.push("|  o  ");
						break;
					}
					break;
				case this.WE:
					switch (k) {
					case 0:
						result.push("+--#--");
						break;
					case 1:
						result.push("|  #  ");
						break;
					case 2:
						result.push("ooo#oo");
						break;
					case 3:
						result.push("|  #  ");
						break;
					}
					break;
				case this.NW:
					switch (k) {
					case 0:
						result.push("+--o--");
						break;
					case 1:
						result.push("| o   ");
						break;
					case 2:
						result.push("oo   #");
						break;
					case 3:
						result.push("|   # ");
						break;
					}
					break;
				case this.NE:
					switch (k) {
					case 0:
						result.push("+--o--");
						break;
					case 1:
						result.push("|   o ");
						break;
					case 2:
						result.push("##   o");
						break;
					case 3:
						result.push("| #   ");
						break;
					}
					break;
				case this.SW:
					switch (k) {
					case 0:
						result.push("+--#--");
						break;
					case 1:
						result.push("|   # ");
						break;
					case 2:
						result.push("oo   #");
						break;
					case 3:
						result.push("| o   ");
						break;
					}
					break;
				case this.SE:
					switch (k) {
					case 0:
						result.push("+--#--");
						break;
					case 1:
						result.push("| #   ");
						break;
					case 2:
						result.push("##   o");
						break;
					case 3:
						result.push("|   o ");
						break;
					}
					break;
				case this.EMPTY:
					uppiece = this.getAt(i - 1, j);
					leftpiece = this.getAt(i, j - 1);
					upleftpiece = this.getAt(i - 1, j - 1);
					switch (k) {
					case 0:
						if ((uppiece == this.SN) || (uppiece == this.SW)
								|| (uppiece == this.SE)) {
							result.push("+--o--");
							break;
						}
						if ((uppiece == this.WE) || (uppiece == this.WN)
								|| (uppiece == this.EN)) {
							result.push("+--#--");
							break;
						}
						if ((upleftpiece != this.EMPTY) || (leftpiece != this.EMPTY)) {
							result.push("+     ");
							break;
						}
						result.push("      ");
						break;
					case 1:
						if (leftpiece == this.EMPTY)
							result.push("      ");
						else
							result.push("|     ");
						break;
					case 2:
						if (leftpiece == this.EMPTY)
							result.push("      ");
						if ((leftpiece == this.EW) || (leftpiece == this.EN)
								|| (leftpiece == this.ES))
							result.push("o     ");
						if ((leftpiece == this.NS) || (leftpiece == this.NW)
								|| (leftpiece == this.SW))
							result.push("#     ");
						break;
					case 3:
						if (leftpiece == this.EMPTY)
							result.push("      ");
						else
							result.push("|     ");
						break;
					}
					break;
				} // switch (getAt(i,j));
			} // for (j)

			upleftpiece = this.getAt(i - 1, j - 1);
			leftpiece = this.getAt(i, j - 1);
			switch (k) {
			case 0:
				if ((upleftpiece != this.EMPTY) || (leftpiece != this.EMPTY))
					result.push("+");
				break;
			case 1:
				if (leftpiece != this.EMPTY)
					result.push("|");
				break;
			case 2:
				if ((leftpiece == this.EW) || (leftpiece == this.EN)
						|| (leftpiece == this.ES))
					result.push("o");
				if ((leftpiece == this.NS) || (leftpiece == this.NW)
						|| (leftpiece == this.SW))
					result.push("#");
				break;
			case 3:
				if (leftpiece != this.EMPTY)
					result.push("|");
				break;
			}
			result.push("\n");
		}
	}
	result.push("  ");
	for (j = 1; j <= this.getColSize(); j++) {
		leftpiece = this.getAt(this.getRowSize(), j - 1);
		uppiece = this.getAt(this.getRowSize(), j);
		if ((uppiece == this.EMPTY) && (leftpiece == this.EMPTY))
			result.push("      ");
		if ((uppiece == this.EMPTY) && (leftpiece != this.EMPTY))
			result.push("+     ");
		if ((uppiece == this.SN) || (uppiece == this.SW) || (uppiece == this.SE))
			result.push("+--o--");
		if ((uppiece == this.WE) || (uppiece == this.WN) || (uppiece == this.NE))
			result.push("+--#--");
	}
	if (this.getAt(this.getRowSize(), this.getColSize()) != this.EMPTY)
		result.push("+");
	result.push("\n");
	return result.join('').toString();
};

TraxBoard.prototype.tilesToString = function (tiles) {
	var res = [];
	for (var i in tiles) {
		res.push(this.Pieces[tiles[i]][0]);
	}
	return res;
};

TraxBoard.prototype.posToMoveString = function (col, row, tile) {
	var res = '';
	switch (col) {
		case 0:
			res = '@';
			break;
		case 1:
			res = 'A';
			break;
		case 2:
			res = 'B';
			break;
		case 3:
			res = 'C';
			break;
		case 4:
			res = 'D';
			break;
		case 5:
			res = 'E';
			break;
		case 6:
			res = 'F';
			break;
		case 7:
			res = 'G';
			break;
		case 8:
			res = 'H';
			break;
		case 9:
			res = 'I';
			break;
	}
	res += row;
	switch (tile) {
		case 'ns':
		case 'we':
			res += '+';
			break;
		case 'nw':
		case 'se':
			res += '/';
			break;
		case 'ne':
		case 'ws':
			res += '\\';
			break;
	}
	return res;
};

TraxBoard.prototype.col_row_array = [];
TraxBoard.prototype.firstrow = 0;
TraxBoard.prototype.firstcol = 0;
TraxBoard.prototype.lastrow = 0;
TraxBoard.prototype.lastcol = 0;
TraxBoard.prototype.boardEmpty_save = false;
TraxBoard.prototype.wtm_save = 0;
TraxBoard.prototype.gameover_save = 0;
TraxBoard.prototype.num_of_tiles_save = 0;
TraxBoard.prototype.firstrow_save = -1;
TraxBoard.prototype.lastrow_save = -1;
TraxBoard.prototype.firstcol_save = -1;
TraxBoard.prototype.lastcol_save = -1;
//Consts

TraxBoard.prototype.Pieces = {
	0 : ['blank'],
	1 : ['ns', 'sn'],
	2 : ['we', 'ew'],
	3 : ['nw', 'wn'],
	4 : ['ne', 'en'],
	5 : ['ws', 'sw'],
	6 : ['se', 'es']
};


TraxBoard.prototype.EMPTY = 0;
TraxBoard.prototype.INVALID = 7;
TraxBoard.prototype.NS = 1;
TraxBoard.prototype.SN = 1;
TraxBoard.prototype.WE = 2;
TraxBoard.prototype.EW = 2;
TraxBoard.prototype.NW = 3;
TraxBoard.prototype.WN = 3;
TraxBoard.prototype.NE = 4;
TraxBoard.prototype.EN = 4;
TraxBoard.prototype.WS = 5;
TraxBoard.prototype.SW = 5;
TraxBoard.prototype.SE = 6;
TraxBoard.prototype.ES = 6;
TraxBoard.prototype.WHITE = 0;
TraxBoard.prototype.BLACK = 1;
TraxBoard.prototype.DRAW = 2;
TraxBoard.prototype.NOPLAYER = 3;
TraxBoard.prototype.NORESULT = 3;
