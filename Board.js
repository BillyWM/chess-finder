let Point = require("./Point.js");
let Pieces = require("./Pieces.js");
let Piece = Pieces.Piece;
let Bishop = Pieces.Bishop;
let Knight = Pieces.Knight;
let Rook = Pieces.Rook;
let Pawn = Pieces.Pawn;
let Queen = Pieces.Queen;
let King = Pieces.King;


/**
 *  Maintains a reference to all pieces
 * 
 *  Empty board state until it's populated with e.g setInitialPosition
 */
class Board {

    constructor() {

        // Init explicitly empty 8x8 board.
        // Board oriented in standard way i.e from white's perspective.
        // Stored as array of rows, 8th rank to 1st, as this is more intuitive than more clever mechanisms
        this.pieceList = [];
        for (let i=0; i < 8; i++) {
            this.pieceList.push([null, null, null, null, null, null, null, null]);
        }

    }

    setInitialPosition() {
        this.setPositionFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    }

    setNoPawnsPosition() {
        this.setPositionFromFEN("rnbqkbnr/8/8/8/8/8/8/RNBQKBNR w KQkq - 0 1");        
    }

    /**
     * Full list of pieces, useful for iterating possible moves
     */
    get pieces() {
        let rank, file;
        let pieceArray = [];

        // Filter out empty squares from each row
        let pieceRows = this.pieceList.map(
            (row) => row.filter( (sq) => sq !== null)
        );

        // Flatten rows into single-dimensional array
        pieceRows.forEach( (row) => pieceArray = pieceArray.concat(row));

        return pieceArray;
    }

    /**
     * Set a piece in a given location
     * 
     * @param {String} type
     * @param {String} color
     * @param {String} square Algebraic notation of square
     */
    addPiece(type, color, square) {

        let piece;
       
        switch (type) {
            case Piece.types.PAWN:
                piece = new Pawn(color);
                break;
            case Piece.types.BISHOP:
                piece = new Bishop(color);
                break;
            case Piece.types.KNIGHT:
                piece = new Knight(color);
                break;
            case Piece.types.ROOK:
                piece = new Rook(color);
                break;
            case Piece.types.KING:
                piece = new King(color);
                break;
            case Piece.types.QUEEN:
                piece = new Queen(color);
                break;
        }

        this.setPieceAtSquare(square, piece);
    }

    /**
     * Get piece at a square denoted by numeric coordinates (0, 0) to (7, 7)
     * 
     * a8 = (0, 0)
     * h1 = (7, 7)
     * 
     * @param {Number} file
     * @param {Number} rank
     * @returns {Piece|null}
     */
    getPieceAtSquare(square) {

        let point = this.algebraicToPoint(square);

        return this.pieceList[point.rank][point.file];
    }

    /**
     * 
     * 
     * @param {String} square
     * @param {Piece|null} piece The piece to set. Pass null to clear a square
     */
    setPieceAtSquare(square, piece) {
        let point = this.algebraicToPoint(square);

        piece.point = point;

        this.pieceList[7 - point.rank][point.file] = piece;
    }

    /**
     * Clears a square by setting it to null
     */
    clearSquare(square) {
        this.setPieceAtSquare(square, null);
    }

     /**
     * Checks whether a square is occupied by a piece
     * 
     * @param {String} square
     */
    squareIsOccupied(square) {
        return this.getPieceAtSquare(square) !== null;
    }

    /**
     * Convert square denoted in algebraic notation to numeric point for internal array lookup
     * 
     * @param {String} square
     */
    algebraicToPoint(square) {

        let letter = square[0];
        let number = square[1];
        let file = "abcdefgh".indexOf(letter);
        let rank = 8 - number;

        return new Point(file, rank);
    }

    /**
     * Definition of pseudo-legal:
     * 
     *      Piece can move to target square
     *          AND target square is not occupied by own color piece
     *          AND target square is not occupied by enemy king
     * 
     *          SPECIAL CASE : Castling
     *              AND in between squares are not occupied
     * 
     *  
     * Definition of legal:
     * 
     *      Move is at least pseudo-legal
     *          AND move does not put king in check
     * 
     *          SPECIAL CASE : En passant
     *              AND target square is en passant square.
     * 
     *              NOTE: However, EP square is part of game state, so it must be passed in from outside.
     *              It cannot be reliably inferred from game position.
     *              (Example: 1. pawn moves one, knight moves out 2. pawn moves one more, knight moves back.
     *                  Stupid but valid. This cannot be distinguished from 1. pawn moves two, without move history information)
     * 
     *          SPECIAL CASE : Castling
     *              AND no squares that the king will pass during castling are attacked by enemy
     *              AND king and rook have not moved
     * 
     *                  NOTE: Whether the king and rook have moved is part of the game state, which is not
     *                  tracked by this class. This information must be passed in from outside. The strictest
     *                  check we can do without this information is confirm they're on the right squares.
     * 
     * 
     */
    getpseudoLegalMoves() {

        let moves = [];
        let newMoves;

        for (let p = 0; p < this.pieces.length; p++) {
            newMoves = this.getpseudoLegalMovesForPiece(this.pieces[p]);
            if (newMoves) moves = moves.concat(newMoves);
        }

        return moves;
    }

    /**
     * @param {Piece} piece
     */
    getpseudoLegalMovesForPiece(piece) {

        let pseudoMoves = [];
        let lineList;
        let pointList;

        switch (piece.type) {
            case Piece.types.BISHOP:
                lineList = piece.getDiagonals();
                pseudoMoves = this.findUnblockedPointsOnLine(lineList, piece.color);
                
                console.log(`The pseudomoves for the ${piece.color} Bishop on ${piece.square} are:`);
                pseudoMoves.forEach( x => console.log(x.toAlgebraic()));

                break;
            case Piece.types.ROOK:
                lineList = piece.getStraightLines();
                pseudoMoves = this.findUnblockedPointsOnLine(lineList, piece.color);

                console.log(`The pseudomoves for the ${piece.color} Rook on ${piece.square} are:`);
                pseudoMoves.forEach( x => console.log(x.toAlgebraic()));
                break;

            case Piece.types.QUEEN:
                lineList = piece.getAllLines();
                pseudoMoves = this.findUnblockedPointsOnLine(lineList, piece.color);

                console.log(`The pseudomoves for the ${piece.color} Queen on ${piece.square} are:`);
                pseudoMoves.forEach( x => console.log(x.toAlgebraic()));
                break;

            case Piece.types.KING:
                pointList = piece.getSurroundingPoints();
                pseudoMoves = this.findUnblockedPoints(pointList, piece.color, true);

                console.log(`The pseudomoves for the ${piece.color} King on ${piece.square} are:`);
                pseudoMoves.forEach( x => console.log(x.toAlgebraic()));
                break;

            case Piece.types.KNIGHT:
                pointList = piece.getKnightPoints();
                pseudoMoves = this.findUnblockedPoints(pointList, piece.color, true);

                console.log(`The pseudomoves for the ${piece.color} Knight on ${piece.square} are:`);
                pseudoMoves.forEach( x => console.log(x.toAlgebraic()));
                break;

            case Piece.types.PAWN:
                pointList = this.getPawnPseudoMoves(piece);
                console.log(`The pseudomoves for the ${piece.color} Pawn on ${piece.square} are:`);
                pseudoMoves.forEach( x => console.log(x.toAlgebraic()));
                break;
                
        }
    }

    /**
     * Check for forward moves (1 or 2) and possible attacks
     * TODO: En passant when this information is provided
     */
    getPawnPseudoMoves(piece) {

        let pointList = [];
        // pointList = pointList.concat(piece.getPointAhead(), piece.getPointTwoAhead());
        // getPawnAttackPoints

        // Can they move forward one?
        let pointAhead = piece.getPointAhead();
        if (pointAhead) pointList.concat(pointAhead);

        // Can only move forward two on certain ranks


    }

    /**
     * King is currently in check
     */
    isInCheck(color) {

    }

    /**
     * King is in check from two sources (triple-check and higher is impossible)
     */
    isInDoubleCheck(color) {

    }

    /**
     * Side is checkmated
     * 
     */
    isCheckmated(color) {

        // If single check:
        //      * See if pieces can capture the attacker.
        //          * King can only capture attacker if attacker not defended
        //      * See if pieces can block attacker
        //      * Exclude (absolutely) pinned pieces from capturing or blocking attacker
        //      * Check king moves for safe squares
        //      * If no captures, blocks, or safe squares: checkmate
        // If double check:
        //      * King must move, and cannot capture. Only need to check potential king move squares. If none are safe, checkmate.

    }

    /**
     * Side has no legal moves.
     * 
     * NOTE: A side is only stalemated once it's their turn to move.
     *      This function only determines that the position is a stalemated position.
     *      Information about which player's turn it is to move is part of game state, and not included in this class.
     *      
     */
    isPseudoStalemated(color) {

    }

    /**
     * Check discrete set of points for unblocked squares
     * (For knight, king, and pawn moves)
     */
    findUnblockedPoints(pointList, color, includeCaptures = true) {

        // includeCaptures flag is for pawns, as only their diagonal moves can capture.

        let point;
        let pieceOnSquare;
        let validPoints = [];

        for (let i=0; i < pointList.length; i++) {
            point = pointList[i];
            pieceOnSquare = this.getPieceAtSquare(point.toAlgebraic());

            // Valid: empty and capturable squares
            if (!pieceOnSquare || (includeCaptures && pieceOnSquare.color !== color && !pieceOnSquare.isKing)) {
                validPoints.push(point);
            }
        }

        return validPoints;
    }

    /**
     * Find points along a line that aren't blocked by the given color's own pieces
     * Used for evaluating legal moves (bishop, rook, queen)
     */
    findUnblockedPointsOnLine(lines, color) {
        let validPoints = [];
        let pieceOnSquare;
        let blockedLine = false;
        let p;

        // Traverse each point along each line, looking for pieces that block us
        for (let i=0; i < lines.length; i++) {

            blockedLine = false;

            for (let k=0; k < lines[i].length && !blockedLine; k++) {

                p = lines[i][k];

                pieceOnSquare = this.getPieceAtSquare(p.toAlgebraic());

                // Empty square? Valid pseudomove
                if (!pieceOnSquare) {
                    validPoints.push(p);
                } else if (pieceOnSquare && pieceOnSquare.color === color) {
                    // Our own color in the way; end of the line
                    blockedLine = true;
                } else if (pieceOnSquare && pieceOnSquare.color !== color && pieceOnSquare.type !== Piece.types.KING) {
                    //Captures are valid moves. However, they're the last valid move in the line
                    validPoints.push(p);
                    blockedLine = true;
                }
            }
        }

        return validPoints;
    }

    /**
     * Assumes well-formed FEN
     */
    setPositionFromFEN(fenString) {

        // black is lower-case, white is upper-case
        // TODO: Full FEN parsing? All we care about right now is board layout
        let parts = fenString.split(" ");
        let boardString = parts[0];
        let rows = boardString.split("/");

        let rank, file;
        let char, str, index;
        let color;
        let point, square;

        for (let i = 0; i < 8; i++) {

            rank = i;
            file = 0;
            str = rows[i];
            index = 0;

            // Each row is a variable-length string that must be evaluated one character at a time
            while (file <= 8 && index < str.length) {

                // Look at current character in FEN row and make decision
                char = str[index];
                index++;

                // First look for numbers indicating squares to skip
                if (char.match(/\d/)) {
                    file += parseInt(char);
                } else {

                    // If not a number, then it's a piece. Lowercase is black
                    color = char.match(/[rnbkqp]/) ? Piece.colors.BLACK : Piece.colors.WHITE;
                    char = char.toUpperCase();
                    point = new Point(file, rank);
                    square = point.toAlgebraic();

                    // Place the selected piece
                    switch (char) {
                        case "P":
                            this.addPiece(Piece.types.PAWN, color, square);
                            break;
                        case "B":
                            this.addPiece(Piece.types.BISHOP, color, square);
                            break;
                        case "N":
                            this.addPiece(Piece.types.KNIGHT, color, square);
                            break;
                        case "R":
                            this.addPiece(Piece.types.ROOK, color, square);
                            break;
                        case "K":
                            this.addPiece(Piece.types.KING, color, square);
                            break;
                        case "Q":
                            this.addPiece(Piece.types.QUEEN, color, square);
                            break;
                    }

                    file++;
                }

            }
        }
    }
}

module.exports = Board;