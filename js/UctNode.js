var UctNode = function(position, move, parent) {
	this.visits = 0;
	this.wins = 0;
	this.draws = 0;
	this.children = [];
	this.parent = parent || null;
	this.position = position;
	this.move = move || null;
	this.utils = new TraxUtil();
};

UctNode.prototype.toString = function() {
	var result = "";
	result += "visits="+this.getVisits()+", ";
	result += "wins="+this.getWins()+", ";
	result += "draws="+this.getDraws()+", ";
	result += "winrate="+this.getWinRate()+"\n";
	result += this.getPosition()+"\n";
	result += "move="+this.move+"\n";
	result += "children="+children.length+"\n";
	return result;
};

UctNode.prototype.incWins = function() {
	this.wins++;	
};
UctNode.prototype.incDraws = function() {
	this.draws++;	
};
UctNode.prototype.incVisits = function() {
	this.visits++;	
};

UctNode.prototype.createChildren = function() {
	var localMove = "";
	if (this.position.isGameOver() !== this.position.NOPLAYER) {
		return;
	}
	var moves = this.position.uniqueMoves();
	for (var i = 0; i < moves.length; i++) {
		localMove = moves[i];
		var tcopy = new TraxBoard(this.position);
		try {
			tcopy.makeMove(localMove);
		} catch(e) {
			throw "Cannot make move";
		}
		var child = new UctNode(new TraxBoard(tcopy), localMove, this);
		this.children.push(child);
	}
};

UctNode.prototype.getWinRate = function() {
	if (this.visits === 0)
		return 0;
	return (0.25*this.draws+this.wins) / this.visits;
};

UctNode.prototype.getPosition = function() {
	return this.position;
};

UctNode.prototype.getWins = function() {
	return this.wins;
};
UctNode.prototype.getDraws = function() {
	return this.draws;
};
UctNode.prototype.getVisits = function() {
	return this.visits;
};
UctNode.prototype.getParent = function() {
	return this.parent;
};
UctNode.prototype.getChildren = function() {
	return this.children;
};
UctNode.prototype.getMove = function() {
	return this.move;
};

UctNode.prototype.getWorse = function() {
	var worse_index = 0;
	var worse_winrate = 1;
	for (var i  = 0; i < this.children.length; i++) {
		if (this.children[i].getWinRate() < worse_winrate) {
			worse_winrate = this.children[i].getWinRate();
			worse_index = i;
		}
	}
	return this.children[worse_index];
};

UctNode.prototype.getBest = function() {
	var best_index = 0;
	var best_winrate = 1;
	for (var i  = 0; i < this.children.length; i++) {
		if (this.children[i].getWinRate() > best_winrate) {
			best_winrate = this.children[i].getWinRate();
			best_index = i;
		}
	}
	return this.children[best_index];
};

UctNode.prototype.update = function(result) {
	this.incVisits();
	switch (result) {
		case this.position.DRAW:
			this.incDraws();
			break;
		case this.position.WHITE:
		case this.position.BLACK:
			if (result === this.position.whoToMove()) {
				this.incWins();
			}
			break;
	}
};

UctNode.prototype.UctValue = function() {
	if (this.getVisits() === 0) {
		return 10000 + this.utils.getRandom(100);
	}
	if (this.getParent() === null) {
		return this.getWinRate();
	}
	return (this.getWinRate() + 10 * Math.sqrt(Math.log(this.getParent().getVisits())) / (5* this.getVisits()));
};

UctNode.prototype.printPrincipalVariation = function() {
	var next = this;
	while (next.getChildren().length > 0) {
		console.log(next.getBest().getMove()+ " ");
		next = this.getBest();
	}
};
