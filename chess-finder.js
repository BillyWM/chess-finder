class Point {
    constructor(file, rank) {
        this.rank = rank;
        this.file = file;
    }

    /**
     * Point is conventional (x, y) notation where upper left is (0, 0) so:
     * a8 = (0, 0)
     * h1 = (7, 7)
     */
    toAlgebraic() {
        let letter = "abcdefgh"[this.file];
        let number = this.rank + 1;

        return letter + number;
    }

    setSquare(square) {

        if (!square || !square.match(/^[a-h][1-8]$/)) {
            throw new Error("Invalid square");
        }

        let letter = square[0];
        let number = square[1];
        let newFile = "abcdefgh".indexOf(letter);
        let newRank = 8 - number;

        this.file = newFile;
        this.rank = newRank;
    }

    /**
     * @returns {Point[]} Array of immediately adjacent points
     */
    getAdjacent() {
        let points = [];

        for (let r = this.rank - 1; r <= this.rank + 1; r++) {
            for (let f = this.file - 1; f <= this.file + 1; f++) {
                
                // Skip own square
                if (f === this.file && r === this.rank) continue;

                // Validate nearby square as in-bounds
                if (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
                    points.push(new Point(f, r));
                }
            }
        }

        return points;
    }

    /**
     * Get all in-bounds squares in a diagonal starting from this point.
     * @returns {Array} Array-of-arrays with each of 4 lines
     */
    getDiagonals() {

        let points = [];

        points.push(this.getLine(1, -1));
        points.push(this.getLine(1, 1));
        points.push(this.getLine(-1, -1));
        points.push(this.getLine(-1, 1));

        return points;
    }

    /**
     * Get all in-bounds squares in a straight line starting from this point.
     */
    getStraightLines() {

        let points = [];

        points.push(this.getLine(-1, 0));
        points.push(this.getLine(1, 0));
        points.push(this.getLine(0, -1));
        points.push(this.getLine(0, 1));

        return points;

    }

    /**
     * Get all straight and diagonal lines from this point
     * @returns {Array} Array-of-arrays, each sub-array representing one straight or diagonal line
     */
    getAllLines() {

        let points = [];

        let straight = this.getStraightLines();
        let diag = this.getDiagonals();

        points = points.concat(straight, diag);

        return points;
    }

    /**
     * Get in-bounds squares in one straight or diagonal line
     */
    getLine(dx = 0, dy = 0) {

        if (!dx && !dy) {
            throw new Error("Both deltas can't be zero or unspecified");
        }

        let points = [];
        let r = this.rank;
        let f = this.file;

        // Loop while moves are in-bounds
        while (r >= 0 && r <= 7 && f >= 0 && f <= 7) {

            if (!(r === this.rank && f === this.file)) {
                points.push(new Point(f, r));
            }

            r += dy;
            f += dx;

        }

        return points;
    }

    // Point denotes an invalid location
    get isOutOfBounds() {
        if (this.rank < 0 || this.rank > 7 || this.file < 0 || this.file > 7) {
            return true;
        } else {
            return false;
        }
    }
}

class Piece {

    constructor(color) {
        this.type = null;
        this.point = null;
        this.color = color;
        this.isPinned = false;

        // Array of enemy pieces attacking/defending this one
        this.defendedBy = [];
        this.attackedBy = [];

        // Array of pieces this one is attacking or defending
        this.attacking = [];
        this.defending = [];
    }

    getDiagonals() {
        return this.point.getDiagonals();
    }

    getStraightLines() {
        return this.point.getStraightLines();
    }

    getAllLines() {
        return this.point.getAllLines();
    }

    /**
     * @returns {String|null} 
     */
    get square() {
        return this.point ? this.point.toAlgebraic() : null;
    }

    get timesDefended() {
        return this.defendedBy.length;
    }

    get timesAttacked() {
        return this.attackedBy.length;
    }

    get isAttacked() {
        return this.timesAttacked > 0;
    }

    get isDefended() {
        return this.timesDefended > 0;
    }

    get isForking() {
        return this.attacking.length > 1;
    }

    // Definition: Piece has no legal moves
    get isBlocked() {

    }

    // Definition: Piece has legal moves, but all legal squares are attacked by enemy
    get isTrapped() {

    }

    // Definition: Attacked more times than it's defended
    get isVulnerable() {
        return this.timesAttacked > this.timesDefended;
    }

    get isOverworked() {
        //TODO: Must consider other defensive duties such as preventing mate, not just number of pieces this one is defending
    }

    get isEnPrise() {
        //TODO: Need to consider multiple scenarios such as attacked by less valuable piece, attacked more times than it's defended, etc
        throw new Error("Not Implemented");
    }

    // Constants for convenience. Auto-completable, avoids spelling errors.
    static get types() {
        return {
            PAWN: "pawn",
            BISHOP: "bishop",
            KNIGHT: "knight",
            ROOK: "rook",
            KING: "king",
            QUEEN: "queen"
        }
    }

    static get colors() {
        return {
            BLACK: "black",
            WHITE: "white"
        }
    }
}

class Pawn extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.PAWN;

        //TODO: Must be set from outside (in board logic)
        this.isDoubled = false;
    }

    get isIsolated() {
        //TODO: Look at defenders array, return true if any are other pawns
    }

}

class Bishop extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.BISHOP;
    }

}

class Knight extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.KNIGHT;
    }
}

class Rook extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.ROOK;
    }
}

class King extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.KING;
    }
}

class Queen extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.QUEEN;
    }
}

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
     *      Piece can move to target square
     *          AND target square is not occupied by own color piece
     *          AND target square is not occupied by enemy king
     * 
     *          SPECIAL CASE : En passant
     *              AND target square is en passant square
     *  
     * Definition of legal
     *      Move is at least pseudo-legal
     *          AND move does not put king in check
     * 
     *          SPECIAL CASE : Castling
     *              AND no squares that the king will pass during castling are attacked by enemy
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

        switch (piece.type) {
            case Piece.types.BISHOP:
                lineList = piece.getDiagonals();
                pseudoMoves = this.findUnblockedPoints(lineList, piece.color);
                
                console.log(`The pseudomoves for the ${piece.color} Bishop on ${piece.square} are:`);
                pseudoMoves.forEach( x => console.log(x.toAlgebraic()));

                break;
            case Piece.types.ROOK:
                lineList = piece.getStraightLines();
                pseudoMoves = this.findUnblockedPoints(lineList, piece.color);

                console.log(`The pseudomoves for the ${piece.color} Rook on ${piece.square} are:`);
                pseudoMoves.forEach( x => console.log(x.toAlgebraic()));
                break;

            case Piece.types.QUEEN:
                lineList = piece.getAllLines();
                pseudoMoves = this.findUnblockedPoints(lineList, piece.color);

                console.log(`The pseudomoves for the ${piece.color} Queen on ${piece.square} are:`);
                pseudoMoves.forEach( x => console.log(x.toAlgebraic()));
                break;

                
        }
    }

    findUnblockedPoints(lines, color) {
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

let board = new Board();
//board.setInitialPosition();
board.setNoPawnsPosition();
board.getpseudoLegalMoves();
var x = board.pieces;

var stopHere = 12;
