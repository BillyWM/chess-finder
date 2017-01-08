let Point = require("./Point.js");

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

        this.startingSquares = {
            "black": [],
            "white": []
        }
    }

    /**
     * Whether the piece is on a square that could potentially be its starting square
     * (has no knowledge of whether it has moved)
     * 
     * @returns {Boolean}
     */
    isOnStartingSquare() {
        return this.startingSquares[this.color].contains(this.square);
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

    getSurroundingPoints() {
        return this.point.getSurroundingPoints();
    }

    /**
     * Points that a pawn can potentially move to
     * @returns {Point|null}
     */
    getPointAhead() {

        let rankAhead = this.color === "black" ? this.point.rank + 1 : this.point.rank - 1;
        let pointAhead = new Point(this.point.file, rankAhead);

        return pointAhead.isValid ? pointAhead : null;
    }

    /**
     * Points that a pawn can potentially move to
     * @returns {Point|null}
     */
    getPointTwoAhead() {
        let rankTwoAhead = this.color === "black" ? this.point.rank + 2 : this.point.rank - 2;
        let pointAhead = new Point(this.point.file, rankTwoAhead);

        return pointAhead.isValid ? pointAhead : null;
    }

    /**
     * @return {Point[]}
     */
    getPawnAttackPoints() {

        // Attack down the board or up?
        let dy = this.color === "black" ? 1 : -1;
        let attackPoints = [];
        let attack1, attack2;

        attack1 = new Point(this.point.file - 1, this.point.rank + dy);
        attack2 = new Point(this.point.file + 1, this.point.rank + dy);

        if (attack1.isValid) attackPoints.push(attack1);
        if (attack2.isValid) attackPoints.push(attack2);

        return attackPoints;

    }

    /**
     * Get the points that a knight could hypothetically jump to
     * 
     * @returns {Point[]}
     */
    getKnightPoints() {
        return this.point.getKnightPoints();
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

    /** @type boolean */
    get isKing() {
        return this.type === Piece.types.KING;
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

    isOnStartingSquare() {

        // Only check rank for pawns; a pawn can't possibly reach a different file of its starting rank
        if (this.color === "black" && this.point.rank === 1) return true;
        if (this.color === "white" && this.point.rank === 6) return true;

        return false;
    }

}

class Bishop extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.BISHOP;
        this.startingSquares = {
            black: ["c8", "f8"],
            white: ["c1", "f1"]
        }
    }

}

class Knight extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.KNIGHT;
        this.startingSquares = {
            black: ["b8", "g8"],
            white: ["b1", "g1"]
        }
    }

}

class Rook extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.ROOK;
        this.startingSquares = {
            black: ["a8", "h8"],
            white: ["a1", "h1"]
        }
    }
}

class King extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.KING;
        this.startingSquares = {
            black: ["e8"],
            white: ["e1"]
        }
    }
}

class Queen extends Piece {
    constructor(color) {
        super(color);

        this.type = Piece.types.QUEEN;
        this.startingSquares = {
            black: ["c8"],
            white: ["c1"]
        }
    }
}

exports.Piece = Piece;
exports.Pawn = Pawn;
exports.Bishop = Bishop;
exports.Knight = Knight;
exports.Rook = Rook;
exports.King = King;
exports.Queen = Queen;