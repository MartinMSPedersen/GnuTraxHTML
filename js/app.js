//TODO / Known bugs:
// * Make the board to automatic resize to the needed size
// * Implement AI

(function() {
	"use strict";

	var board;
	var globalTileToChange = '';
	var aiPlayerChosen = false;
	var aiWorker;

	var pregameLogic = function() {
		$('#loading').fadeOut(500);
		board = new TraxBoard();
		initGameBoard();
		initTileChooser();
		initResetGameButton();
		initPrompt();
		askForPlayers();
	};

	var initPrompt = function() {
		$('#prompt').dialog({
			autoOpen: false,
			modal: true
		});
		$('#oneplayer').click(function() {
			aiPlayerChosen = true;
			askForAi();
		});
		$('#twoplayer').click(function() {
			aiPlayerChosen = false;
			$('#prompt').dialog('close');
		});
		$('#aiselect button').each(function() {
			var strength = this.id;
			$(this).click(function() {
				initAiWorker(strength);
			});
		});
	};

	var askForPlayers = function() {
		$('#playerselect').show();
		$('#aiselect').hide();
		$('#prompt').dialog('open');
	};

	var askForAi = function() {
		$('#playerselect').hide();
		$('#aiselect').show();
		$('#prompt').dialog('open');
	};

	var resetGame = function() {
		$('#loading').fadeOut(500);
		board = new TraxBoard();
		updateBoard();
	};

	var initResetGameButton = function() {
		$('#resetgame').click(function() {
			resetGame();
		});
	};

	var initAiWorker = function(strength) {
		switch (strength) {
			case 'easy':
				aiWorker = new Worker('js/random_ai.js');
				aiWorker.postMessage({'cmd': 'start'});
				break;
			case 'simple':
				aiWorker = new Worker('js/simple_ai.js');
				aiWorker.postMessage({'cmd': 'start'});
				break;
			case 'hard':
				aiWorker = new Worker('js/hard_ai.js');
				aiWorker.postMessage({'cmd': 'start'});
				break;
			default:
				alert('No AI with that strength');
		}
		aiWorker.addEventListener('message', function(e) {
			if (e.data.res) {
				console.log('Worker started: '+e.data.res);
				$('#prompt').dialog('close');
			} else {
				$('#loading').fadeOut(500);
				console.log(e.data);
				console.log('MOVE: '+e.data.move);
				board.makeMove(e.data.move);
				updateBoard();
			}
		}, false);
	};

	var initTileChooser = function() {
		$('#chooser').dialog({
			autoOpen: false,
			open: function(ui, event) {
				if (board.gameover != board.NOPLAYER) {
					$('#chooser').dialog('close');
					alert('The game is over. Please reset gameboard');
				}
			},
			close: function(ui, event) {
				$('#chooser div').each(function() {
					$(this).addClass('hidden');
				});
			},
			modal: true
		});
		$('#chooser div').each(function() {
			var className = this.className;
			$(this).addClass('hidden');
			$(this).click(function() {
				$('#chooser').dialog('close');
				try {
					board.makeMove(board.posToMoveString(posToPlace[0], posToPlace[1], className));
					addPieceToTile(tileToChange, className);
				} catch (e) {
					alert('Galt move: '+e);
				}
				updateBoard();
				if (aiPlayerChosen && (board.gameover === board.NOPLAYER)) {
					$('#loading').fadeIn(300);
					//TODO: Get move from AI player
					aiWorker.postMessage({'cmd':'getmove', 'board':board});
				}
			});
		});
	};

	$(document).ready(function() {
		pregameLogic();
	});

	var addTileHolder = function(parent, row, col) {
		var newDiv = document.createElement('div');
		newDiv.className = 'griditem'+row+col+' blank';
		parent.append(newDiv);
	};

	var addPieceToTile = function(tile, piece) {
		tile.removeClass('blank');
		tile.removeClass('blank2');
		tile.addClass(piece);
	};

	var updateBoard = function() {
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				var tile = $('.griditem'+j+i)[0];
				var piece = [board.getAt(i,j)];
				var className = board.tilesToString(piece)[0];
				var classes = $(tile).attr('class').split(' ');
				for (var k = 1; k < classes.length; k++) {
					$(tile).removeClass(classes[k]);
				}
				addPieceToTile($(tile), className);
			}
		}
		if (board.gameover != board.NOPLAYER) {
			var winner = 'White';
			if (board.gameover == board.DRAW) {
				winner = 'draw';
			}
			if (board.gameover == board.BLACK) {
				winner = 'black';
			}
			alert('Game over. The winner was: '+winner);
		}
	};

	var setPosVisible = function(row, column) {
		addTileHolder($('#grid'), row, column);
	};

	var clearBoard = function() {
		$('#grid').innerHTML = '';	
	};

	var addClickHandlerToAllGridItems = function() {
		$('#grid div').each(function() {
			var className = this.className;
			$(this).click(function() {
				tileToChange = $('.'+className.split(' ')[0]);
				updateChooser(tileToChange);
				$('#chooser').dialog('open');
			});
		});
	};

	var tileToChange = '';
	var posToPlace = [];
	//TODO: This should only do it from the max column and max row.
	//		Eg. for starters it should only be 0,0
	var initGameBoard = function() {
		clearBoard();
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				setPosVisible(i,j);
			}
		}	
		addClickHandlerToAllGridItems();
		$('#grid').gridLayout('refresh');
	};

	var updateChooser = function(tileToShow) {
		var posPart = tileToShow.selector.replace('.griditem','').split('');
		posPart[0] = parseInt(posPart[0], 10);
		posPart[1] = parseInt(posPart[1], 10);
		posToPlace = posPart;
		if (board.boardEmpty) {
			posToPlace = [0,0];
		}
		var tilesToShow = board.tilesToString(board.getLegalTiles(posToPlace[1], posToPlace[0]));
		$('#chooser div').each(function() {
			var className = this.className;
			if (tilesToShow.indexOf(className.substr(0,2)) > -1) {
				$(this).removeClass('hidden');
			}
		});
	};
})();
