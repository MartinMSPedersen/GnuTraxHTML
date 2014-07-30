importScripts('TraxBoard.js');
importScripts('TraxUtil.js');
importScripts('book.js');
importScripts('UctNode.js');
//A random AI player for Trax
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
	var player = new ComputerPlayerUct(10000);
	//self.postMessage({'res': JSON.stringify(moves)});
	return player.computerMove(tmpBoard);
};

var ComputerPlayerUct = function(maxSims) {
	this.maxSimulations = maxSims || 2000;
	this.utils = new TraxUtil();
};

ComputerPlayerUct.prototype.simpleMove = function (tb) {
	  var percent=this.utils.getRandom(100);

      if (tb.getNumOfTiles()==0) {
        if (percent<50) {
	  return "@0/";
        } else {
          return "@0+";
        }
      }
      if (tb.getNumOfTiles()==1) {
        if (tb.getAt(1,1)==tb.NW) {
          if (percent<15) {
            return "B1\\";
          }
	  if (percent<90) {
            return "@1/";
          } else {
	    return "B1+";
	  }
        }
        if (tb.getAt(1,1)==tb.NS) {
          if (percent<5) {
            return "A0+";
          }
          if (percent<15) {
            return "A0/";
          }
          if (percent<25) {
            return "B1/";
          }
          return "B1+";
        }
      }
      if (tb.getNumOfTiles()==2) {
        if (tb.getAt(1,1)==tb.NW) {
          if (tb.getAt(1,2)==tb.NE) return "A2/";
	  if (tb.getAt(2,1)==tb.WS) return "B1/";
        }
      }
      return null;
};

ComputerPlayerUct.prototype.score = function (wtm, bv, board) {
	if (bv.alwaysPlay) return Infinity; 
	if (bv.neverPlay) return -Infinity;
	if (wtm==board.WHITE) return (this.utils.getRandom(50)+1000*bv.black/(bv.black+bv.white+bv.draw+1));
	return (this.utils.getRandom(50)+1000*bv.white/(bv.black+bv.white+bv.draw+1));

};

ComputerPlayerUct.prototype.openingMove = function(tb) {
		var bestMove=null;

      if (bookdata==null) {
	  //System.out.println("book is null");
	  return null; 
      }
      var bestScore=-Infinity;

	  var moves = tb.uniqueMoves();
      for (var i = 0; i < moves.length; i++) {
	 var t_copy=new TraxBoard(tb);
		  var move = moves[i];
	 try { t_copy.makeMove(move); }
	 catch (e) {
	     throw "This should never happen. (027)";
	 }
	 var bv=bookdata[''+t_copy.whoDidLastMove()+t_copy.getBorder()];
	 if (bv) {
	   //System.out.println(move+": "+bv.alwaysPlay+bv.score(t_copy.whoToMove()));
	   if (bv.alwaysPlay) {
	       return move;
	   }
	   var score=this.score(t_copy.whoToMove(), bv, tb)+this.utils.getRandom(50);
	   if ((score==bestScore && (this.utils.getRandom(10)%2==0)) || score>bestScore) {
	     bestMove=move;
	     bestScore=score;
	   }
	 }
      }
      if (bestMove!=null) return bestMove;
      return null;

};

ComputerPlayerUct.prototype.computerMove = function(tb) {
	var simple=null;

 	simple=this.simpleMove(tb);
	if (simple!=null) { 
	    //System.out.println("Simple move found"); 
	    this.utils.log("Simple move found");
	    return simple; 
	}
        simple=this.openingMove(tb);
	if (simple!=null) { 
	    this.utils.log("Move found in opening book."); 
	    return simple; 
	}

	var root = new UctNode(tb);
	var maxSimulations;
	
	maxSimulations=this.maxSimulations/(65-tb.getNumOfTiles()/2);
	for (var simulationCount=0; simulationCount<maxSimulations;  simulationCount++) {
	    this.playSimulation (root);
	}
	
	
	return root.getWorse().getMove();
	
};

ComputerPlayerUct.prototype.playRandomGame = function(tb) {
	while (tb.isGameOver()==tb.NOPLAYER) {
	    try { tb.makeMove (this.utils.getRandomMove (tb)); }
	    catch (e) { throw "Illegal move"; }
	}
	return tb.isGameOver();
};

ComputerPlayerUct.prototype.UCTSelect = function(node) {
	var value, bestUct = -1, best_index = -1;
	var children = node.getChildren();
	if (children == null) {
		node.createChildren();
		children = node.getChildren();
	}
	if (children.length==0) {
	    throw "Doh 2!";
	}
	for (var i = 0; i < children.length; i++) {
	    value = children[i].UctValue();
	    if (value > bestUct) {
			best_index = i;
			bestUct = value;
	    }
	}
	return children[best_index];

};

ComputerPlayerUct.prototype.playSimulation = function(node) {
	var result=-1;
	
	if (node.getVisits()<5)	{
	    result=this.playRandomGame(new TraxBoard(node.getPosition()));
	    node.update(result); 
	    return result;
	}
	else {
	    if ((node.getChildren()==null) || (node.getChildren().length==0)) {
		node.createChildren();
	    }
	    var next=this.UCTSelect(node);
	    if (next==null) {
		throw "Doh!";
	    }
	    if (next.getPosition().isGameOver()!=next.getPosition().NOPLAYER) {
		result=next.getPosition().isGameOver();
		next.update(result);
		return result;
	    }
	    result=this.playSimulation(next);
	    next.update(result);
	}
	return result;
};