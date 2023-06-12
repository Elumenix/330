export class Point {
    constructor(xPos, yPos, zPos) {
        this.x = xPos;
        this.y = yPos;
        this.z = zPos;
        this.trueY = yPos;

        // StartingPositions
        this.sx = xPos;
        this.sy = yPos;
        this.sz = zPos
    }
}