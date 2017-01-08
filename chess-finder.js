let Board = require("./Board.js");


let board = new Board();
// board.setInitialPosition();
board.setNoPawnsPosition();
board.getpseudoLegalMoves();
var x = board.pieces;

var stopHere = 12;
