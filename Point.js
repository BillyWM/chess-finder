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

    getSurroundingPoints() {

        let nearPoints = [];

        for (let dy = -1; dy <= 1; dy++) {

            for (let dx = -1; dx <= 1; dx++) {

                // Don't check dx, dy both zero (i.e. don't check self)
                if (dx === 0 && dy === 0) continue;

                if (this._isInBounds(this.file + dx, this.rank + dy)) {
                    nearPoints.push(new Point(this.file + dx, this.rank + dy));
                }
            }
        }

        return nearPoints;
    }

    getKnightPoints() {
        // file, rank delta pairs. Knight has up to 8 valid jumps.
        let deltas = [
            [2, -1], [2, 1], [-2, -1], [-2, 1],
            [1, -2], [1, 2], [-1, -2], [-1, 2]
        ]
        let d;
        let validPoints = [];

        for (let i = 0; i < deltas.length; i++) {
            d = deltas[i];
            if (this._isInBounds(this.file + d[0], this.rank + d[1])) {
                validPoints.push(new Point(this.file + d[0], this.rank + d[1]));
            }
        }

        return validPoints;
    }

    /**
     * Helper for internal functions
     */
    _isInBounds(f, r) {
        return !!(f >=0 && f <= 7 && r >=0 && r <= 7)
    }

    /**
     * Checks -this- point for being in bounds
     * @property {Boolean}
     */
    get isValid() {
        return this._isInBounds(this.file, this.rank);
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
     * @return {Point[]}
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

}

module.exports = Point;