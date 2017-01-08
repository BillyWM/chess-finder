/**
 * Assists in analyzing moves by storing useful information wrapped in one object
 */

class Move {
    constructor(piece, from, to) {
        this.piece = piece;
        this.fromPoint = from;
        this.toPoint = to;
    }

    get fromSquare() {
        return this.fromPoint.toAlgebraic();
    }

    get toSquare() {
        return this.toPoint.toAlgebraic();        
    }
}

module.exports = Move;