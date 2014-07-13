console.log("Welcome tester");

var board = new TraxBoard(false);
console.assert(board.boardEmpty == true);
console.assert(board.board.length == 17);
var piece = board.EMPTY;
console.assert(board.blank(piece) == true);
board.setCorners();
console.assert(board.firstrow == -1, 'First row is not -1');

var board = new TraxBoard(false);

console.assert(board.getLegalTiles(0,0).length == 2);
console.log(board.getLegalTiles(0,0));
console.log(board.tilesToString(board.getLegalTiles(0,0)));

board.makeMove("@0/");
console.assert(board.num_of_tiles == 1);
board.printToScreen();

board.makeMove("B1\\");
console.assert(board.num_of_tiles == 2);
board.printToScreen();
board.makeMove("A2\\");
console.assert(board.num_of_tiles == 4);
board.printToScreen();

console.log(board);
console.log('All tests done');