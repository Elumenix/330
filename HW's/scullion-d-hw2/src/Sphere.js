import { Point } from "./Point.js";

export class Sphere {
    constructor(ctx, radius, canvasWidth, canvasHeight, numRings, numPoints, frontColor1, frontColor2, backColor1, backColor2) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.boundry = new Array();
        this.radius = radius;
        this.numberOfVertices = 0;
        this.numberOfRings = numRings;
        this.constant = (2 * Math.PI) / numPoints;
        this.rings = [];
        this.ctx = ctx;
        this.totalX = 0;
        this.totalY = 0;
        this.totalZ = 0;
        this.frontColor1 = frontColor1;
        this.frontColor2 = frontColor2;
        this.backColor1 = backColor1;
        this.backColor2 = backColor2;
        this.scaleLocation;

        // Establish x and z position of points
        for (let i = 0; i <= 2 * Math.PI; i += this.constant) {
            this.boundry[this.numberOfVertices] = new Point(Math.cos(i) * this.radius, 0, Math.sin(i) * this.radius);
            this.numberOfVertices++;
        }

        // Create Vertical points in line with center ring
        for (let direction = 1; direction >= -1; direction -= 2) {
            for (let j = 0; j < this.numberOfRings; j++) {
                let angle = (j / this.numberOfRings) * (Math.PI / 2);
                let radius = Math.cos(angle) * this.radius;
                let fixedY = Math.sin(angle) * this.radius * direction;

                // too many edge cases with a central line + it uses twice as many points for some reason
                if (fixedY == 0) {
                    continue;
                }

                // Establish all x and z positions on ring
                for (let i = 0; i < 6.28; i += this.constant) {
                    this.boundry[this.numberOfVertices] = new Point(Math.cos(i) * radius, fixedY, Math.sin(i) * radius);
                    this.numberOfVertices++;
                }
            }
        }


        // Next section of code puts all points into 2D array by what ring they're in
        // This will make it much easier to sort for when they get affected by wavelengths
        let currentYRow = this.boundry[0].sy;
        let firstPoint = this.boundry[0];
        let currentRing = 0;
        let pointNum = 0;

        // Central Ring
        this.rings[0] = new Array();


        for (let i = 0; i < this.numberOfVertices; i++) {
            if (this.boundry[i].sy != currentYRow) {
                // Move on to next line
                currentYRow = this.boundry[i].sy;
                firstPoint = this.boundry[i];
                currentRing++;
                pointNum = 0;

                // New ring is established
                this.rings[currentRing] = new Array();

                this.rings[currentRing][pointNum] = firstPoint;
                pointNum++;
            }
            else {
                this.rings[currentRing][pointNum] = this.boundry[i];
                pointNum++;
            }
        }

        // Bubble Sort the rings: They are currently count from center outwards
        for (let i = 0; i < this.rings.length; i++) {

            // Last i elements are already in place 
            for (let j = 0; j < (this.rings.length - i - 1); j++) {

                // Checking if the item at present iteration
                // is greater than the next iteration
                if (this.rings[j][0].sy > this.rings[j + 1][0].sy) {

                    // If the condition is true then swap them
                    let temp = this.rings[j];
                    this.rings[j] = this.rings[j + 1];
                    this.rings[j + 1] = temp;
                }
            }
        }

        this.scaleLocation = new Array(this.rings.length);

        for (let i = 0; i < this.scaleLocation.length; i++) {
            this.scaleLocation[i] = i;
        }
    }

    drawSphere(audioData, pulse) {
        let ctx = this.ctx;
        let currentRing;
        let canvasWidth = this.canvasWidth;
        let canvasHeight = this.canvasHeight;
        let scaling = new Array(this.rings.length);



        currentRing = this.rings[0]



        this.finalRotation();



        const soundDistribution = 128 / this.rings.length
        // Figure out scaling audio Data
        for (let i = 0; i < this.rings.length; i++) {
            if (pulse) {
                let scale = 0;

                for (let j = Math.round(soundDistribution * i); j < Math.round(soundDistribution * (i + 1)); j++) {
                    scale += audioData[j];
                }

                scale /= (Math.round(soundDistribution * (i + 1)) - Math.round(soundDistribution * i));

                // Final numbers should be between 1 and 1.5
                scaling[this.scaleLocation[i]] = (scale / 255) / 2 + 1;
            }
            else {
                // All rings remain default size
                scaling[this.scaleLocation[i]] = 1;
            }
        }

        ctx.lineWidth = 3;



        let firstSlerp = new Array(this.rings.length);
        let lastSlerp = new Array(this.rings.length);

        // Color The back af all rings
        let i;
        for (i = 0; i < this.rings.length; i++, currentRing = this.rings[i]) {
            ctx.beginPath();

            let startNum = -1;
            if (currentRing[0].z <= 0 && currentRing[currentRing.length - 1].z >= 0) {
                startNum = 0;

                let edge = this.slerp(currentRing[0], currentRing[currentRing.length - 1]);
                firstSlerp[i] = edge; // save for later
                ctx.moveTo((canvasWidth / 2) + (edge.x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (edge.y * scaling[this.scaleLocation[i]]));
            }
            else {
                for (let pointNum = 1; pointNum < currentRing.length; pointNum++) {
                    if (currentRing[pointNum].z <= 0 && currentRing[pointNum - 1].z >= 0) {
                        startNum = pointNum;

                        let edge = this.slerp(currentRing[pointNum], currentRing[pointNum - 1]);
                        firstSlerp[i] = edge;
                        ctx.moveTo((canvasWidth / 2) + (edge.x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (edge.y * scaling[this.scaleLocation[i]]));
                        break;
                    }
                }

                if (startNum == -1) {
                    // Only front; draw nothing; else only back draw everything
                    if (currentRing[0].z > 0) {
                        ctx.stroke();
                        continue;
                    }

                    for (let pointNum = 0; pointNum < currentRing.length - 1; pointNum++) {
                        ctx.lineTo((canvasWidth / 2) + (currentRing[pointNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[pointNum].y * scaling[this.scaleLocation[i]]));
                    }

                    let currentColor = this.blendColors(this.backColor1, this.backColor2, scaling[this.scaleLocation[i]])
                    ctx.strokeStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;

                    ctx.closePath();
                    ctx.stroke();
                    continue;
                }
            }

            // Prevents edge case where startnum falls on 0, which happens always with the center line when y rotation = 0;
            ctx.moveTo((canvasWidth / 2) + (currentRing[startNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[startNum].y * scaling[this.scaleLocation[i]]));

            for (let pointNum = startNum + 1; pointNum != -1; pointNum++) {
                // back to beginning
                if (pointNum == currentRing.length) {
                    pointNum = 0;
                }

                // Escape
                if (currentRing[pointNum].z >= 0) {
                    if (pointNum == 0 && startNum != 0) {
                        let edge = this.slerp(currentRing[0], currentRing[currentRing.length - 1]);
                        lastSlerp[i] = edge;
                        ctx.lineTo((canvasWidth / 2) + (edge.x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (edge.y * scaling[this.scaleLocation[i]]));
                    }
                    else {
                        let edge = this.slerp(currentRing[pointNum], currentRing[pointNum - 1]);
                        lastSlerp[i] = edge;
                        ctx.lineTo((canvasWidth / 2) + (edge.x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (edge.y * scaling[this.scaleLocation[i]]));
                    }

                    let currentColor = this.blendColors(this.backColor1, this.backColor2, scaling[this.scaleLocation[i]])
                    ctx.strokeStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;

                    ctx.stroke();
                    break;
                }

                // Business as usual
                ctx.lineTo((canvasWidth / 2) + (currentRing[pointNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[pointNum].y * scaling[this.scaleLocation[i]]));
            }
        }


        // Color the front side of all rings
        currentRing = this.rings[this.rings.length - 1];
        for (i = this.rings.length - 1; i >= this.rings.length - Math.floor(this.rings.length / 4); i--, currentRing = this.rings[i]) {
            // Simply color the whole ring or none
            if (lastSlerp[i] == undefined) {
                if (currentRing[0].z < 0) {
                    continue;
                }

                ctx.beginPath();

                ctx.moveTo((canvasWidth / 2) + (currentRing[0].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[0].y * scaling[this.scaleLocation[i]]));

                for (let pointNum = 1; pointNum < currentRing.length; pointNum++) {
                    ctx.lineTo((canvasWidth / 2) + (currentRing[pointNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[pointNum].y * scaling[this.scaleLocation[i]]));
                }

                let currentColor = this.blendColors(this.frontColor1, this.frontColor2, scaling[this.scaleLocation[i]])
                ctx.strokeStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;

                ctx.closePath();
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                let startNum = -1;
                if (currentRing[0].z >= lastSlerp[i].z && currentRing[currentRing.length - 1].z <= lastSlerp[i].z) {
                    startNum = 0;
                    ctx.moveTo(canvasWidth / 2 + (lastSlerp[i].x * scaling[this.scaleLocation[i]]), canvasHeight / 2 - (lastSlerp[i].y * scaling[this.scaleLocation[i]]));
                }
                else {
                    for (let pointNum = 1; pointNum < currentRing.length; pointNum++) {
                        if (currentRing[pointNum].z >= lastSlerp[i].z && currentRing[pointNum - 1].z <= lastSlerp[i].z) {
                            startNum = pointNum;
                            ctx.moveTo(canvasWidth / 2 + (lastSlerp[i].x * scaling[this.scaleLocation[i]]), canvasHeight / 2 - (lastSlerp[i].y * scaling[this.scaleLocation[i]]));
                            break;
                        }
                    }
                }

                ctx.lineTo((canvasWidth / 2) + (currentRing[startNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[startNum].y * scaling[this.scaleLocation[i]]));

                for (let pointNum = startNum + 1; startNum != -1; pointNum++) {

                    if (pointNum == startNum) {
                        break;
                    }

                    // back to beginning
                    if (pointNum == currentRing.length) {
                        pointNum = 0;
                    }

                    // Escape
                    if (currentRing[pointNum].z <= firstSlerp[i].z) {
                        ctx.lineTo((canvasWidth / 2) + (firstSlerp[i].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (firstSlerp[i].y * scaling[this.scaleLocation[i]]));


                        let currentColor = this.blendColors(this.frontColor1, this.frontColor2, scaling[this.scaleLocation[i]])
                        ctx.strokeStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;

                        ctx.stroke();
                        break;
                    }

                    // Business as usual
                    ctx.lineTo((canvasWidth / 2) + (currentRing[pointNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[pointNum].y * scaling[this.scaleLocation[i]]));
                }
            }
        }

        currentRing = this.rings[Math.floor(this.rings.length / 4) + 1];
        for (i = Math.floor(this.rings.length / 4) + 1; i < this.rings.length - Math.floor(this.rings.length / 4); i++, currentRing = this.rings[i]) {
            // Simply color the whole ring or none
            if (lastSlerp[i] == undefined) {
                if (currentRing[0].z < 0) {
                    continue;
                }

                ctx.beginPath();

                ctx.moveTo((canvasWidth / 2) + (currentRing[0].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[0].y * scaling[this.scaleLocation[i]]));

                for (let pointNum = 1; pointNum < currentRing.length; pointNum++) {
                    ctx.lineTo((canvasWidth / 2) + (currentRing[pointNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[pointNum].y * scaling[this.scaleLocation[i]]));
                }

                let currentColor = this.blendColors(this.frontColor1, this.frontColor2, scaling[this.scaleLocation[i]])
                ctx.strokeStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;

                ctx.closePath();
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                let startNum = -1;
                if (currentRing[0].z >= lastSlerp[i].z && currentRing[currentRing.length - 1].z <= lastSlerp[i].z) {
                    startNum = 0;
                    ctx.moveTo(canvasWidth / 2 + (lastSlerp[i].x * scaling[this.scaleLocation[i]]), canvasHeight / 2 - (lastSlerp[i].y * scaling[this.scaleLocation[i]]));
                }
                else {
                    for (let pointNum = 1; pointNum < currentRing.length; pointNum++) {
                        if (currentRing[pointNum].z >= lastSlerp[i].z && currentRing[pointNum - 1].z <= lastSlerp[i].z) {
                            startNum = pointNum;
                            ctx.moveTo(canvasWidth / 2 + (lastSlerp[i].x * scaling[this.scaleLocation[i]]), canvasHeight / 2 - (lastSlerp[i].y * scaling[this.scaleLocation[i]]));
                            break;
                        }
                    }
                }

                ctx.lineTo((canvasWidth / 2) + (currentRing[startNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[startNum].y * scaling[this.scaleLocation[i]]));

                for (let pointNum = startNum + 1; startNum != -1; pointNum++) {

                    if (pointNum == startNum) {
                        break;
                    }

                    // back to beginning
                    if (pointNum == currentRing.length) {
                        pointNum = 0;
                    }

                    // Escape
                    if (currentRing[pointNum].z <= firstSlerp[i].z) {
                        ctx.lineTo((canvasWidth / 2) + (firstSlerp[i].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (firstSlerp[i].y * scaling[this.scaleLocation[i]]));


                        let currentColor = this.blendColors(this.frontColor1, this.frontColor2, scaling[this.scaleLocation[i]])
                        ctx.strokeStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;

                        ctx.stroke();
                        break;
                    }

                    // Business as usual
                    ctx.lineTo((canvasWidth / 2) + (currentRing[pointNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[pointNum].y * scaling[this.scaleLocation[i]]));
                }
            }
        }


        currentRing = this.rings[Math.floor(this.rings.length / 4)];
        for (i = Math.floor(this.rings.length / 4); i >= 0; i--, currentRing = this.rings[i]) {
            // Simply color the whole ring or none
            if (lastSlerp[i] == undefined) {
                if (currentRing[0].z < 0) {
                    continue;
                }

                ctx.beginPath();

                ctx.moveTo((canvasWidth / 2) + (currentRing[0].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[0].y * scaling[this.scaleLocation[i]]));

                for (let pointNum = 1; pointNum < currentRing.length; pointNum++) {
                    ctx.lineTo((canvasWidth / 2) + (currentRing[pointNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[pointNum].y * scaling[this.scaleLocation[i]]));
                }

                let currentColor = this.blendColors(this.frontColor1, this.frontColor2, scaling[this.scaleLocation[i]])
                ctx.strokeStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;

                ctx.closePath();
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                let startNum = -1;
                if (currentRing[0].z >= lastSlerp[i].z && currentRing[currentRing.length - 1].z <= lastSlerp[i].z) {
                    startNum = 0;
                    ctx.moveTo(canvasWidth / 2 + (lastSlerp[i].x * scaling[this.scaleLocation[i]]), canvasHeight / 2 - (lastSlerp[i].y * scaling[this.scaleLocation[i]]));
                }
                else {
                    for (let pointNum = 1; pointNum < currentRing.length; pointNum++) {
                        if (currentRing[pointNum].z >= lastSlerp[i].z && currentRing[pointNum - 1].z <= lastSlerp[i].z) {
                            startNum = pointNum;
                            ctx.moveTo(canvasWidth / 2 + (lastSlerp[i].x * scaling[this.scaleLocation[i]]), canvasHeight / 2 - (lastSlerp[i].y * scaling[this.scaleLocation[i]]));
                            break;
                        }
                    }
                }

                ctx.lineTo((canvasWidth / 2) + (currentRing[startNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[startNum].y * scaling[this.scaleLocation[i]]));

                for (let pointNum = startNum + 1; startNum != -1; pointNum++) {

                    if (pointNum == startNum) {
                        break;
                    }

                    // back to beginning
                    if (pointNum == currentRing.length) {
                        pointNum = 0;
                    }

                    // Escape
                    if (currentRing[pointNum].z <= firstSlerp[i].z) {
                        ctx.lineTo((canvasWidth / 2) + (firstSlerp[i].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (firstSlerp[i].y * scaling[this.scaleLocation[i]]));


                        let currentColor = this.blendColors(this.frontColor1, this.frontColor2, scaling[this.scaleLocation[i]])
                        ctx.strokeStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;

                        ctx.stroke();
                        break;
                    }

                    // Business as usual
                    ctx.lineTo((canvasWidth / 2) + (currentRing[pointNum].x * scaling[this.scaleLocation[i]]), (canvasHeight / 2) - (currentRing[pointNum].y * scaling[this.scaleLocation[i]]));
                }
            }
        }
    }

    // This is an amalgamation of the rotation functions below and keeping track of the starting points of the sphere so that I know the actual boundries of rotation
    finalRotation() {


        // Update current points based on starting points and total rotation
        for (const point of this.boundry) {
            let xFactor = this.rdt(this.totalX);
            let yFactor = this.rdt(this.totalY);
            let zFactor = this.rdt(this.totalZ);

            // Rotate around X axis
            let y = point.sy;
            let z = point.sz;
            let newY = (y * Math.cos(xFactor)) + (z * Math.sin(xFactor) * -1.0);
            let newZ = (y * Math.sin(xFactor)) + (z * Math.cos(xFactor));
            point.y = newY;
            point.z = newZ;

            // Rotate around Y axis
            let x = point.sx;
            z = point.z;
            let newX = (x * Math.cos(yFactor)) + (z * Math.sin(yFactor) * -1.0);
            newZ = (x * Math.sin(yFactor)) + (z * Math.cos(yFactor));
            point.x = newX;
            point.z = newZ;

            // Rotate around Z axis
            x = point.x;
            y = point.y;
            newX = (x * Math.cos(zFactor)) + (y * Math.sin(zFactor) * -1.0);
            newY = (x * Math.sin(zFactor)) + (y * Math.cos(zFactor));
            point.x = newX;
            point.y = newY;
        }

    }

    /*rotateX(degrees) {
        degrees = this.rdt(degrees);
 
        for (const point of this.boundry) {
            let y = point.y;
            point.y = (y * Math.cos(degrees)) + (point.z * Math.sin(degrees) * -1.0);
            point.z = (y * Math.sin(degrees)) + (point.z * Math.cos(degrees));
        }
    }
 
    rotateY(degrees) {
        degrees = this.rdt(degrees);
 
        for (const point of this.boundry) {
            let x = point.x;
            point.x = (x * Math.cos(degrees)) + (point.z * Math.sin(degrees) * -1.0);
            point.z = (x * Math.sin(degrees)) + (point.z * Math.cos(degrees));
        }
    }
 
    rotateZ(degrees) {
        degrees = this.rdt(degrees);
 
        for (const point of this.boundry) {
            let x = point.x;
            point.x = (x * Math.cos(degrees)) + (point.y * Math.sin(degrees) * -1.0);
            point.y = (x * Math.sin(degrees)) + (point.y * Math.cos(degrees));
        }
    }*/

    turnX(degrees) {
        this.totalX += degrees % 361
    }

    turnY(degrees) {
        this.totalY += degrees % 361
    }

    turnZ(degrees) {
        this.totalZ += degrees % 361
    }

    // Sets current rotation outright
    setRotation(degrees) {
        this.totalX = degrees.x;
        this.totalY = degrees.y;
        this.totalZ = degrees.z;
    }

    // Helper Functions
    rdt(radians) {
        return radians * (Math.PI / 180);
    }

    slerp(V1, V2) {
        // Normalize points
        const P1 = [V1.x / this.radius, V1.y / this.radius, V1.z / this.radius];
        const P2 = [V2.x / this.radius, V2.y / this.radius, V2.z / this.radius];

        // Calculate the distance between P1 and P2
        const d = Math.acos(P1[0] * P2[0] + P1[1] * P2[1] + P1[2] * P2[2]);

        // Handle edge case where d is very close to 0 or π
        if (Math.abs(d) < 1e-6 || Math.abs(d - Math.PI) < 1e-6) {
            return new Point(V1.x, V1.y, 0);
        }

        // Calculate the value of t that represents the position of the point along the great circle connecting P1 and P2
        let t;
        if (Math.abs(P2[2] - P1[2]) < 1e-6) {
            // Handle edge case where z-coordinates of both points are equal
            t = 0.5;
        } else {
            t = -P1[2] / (P2[2] - P1[2]);
        }

        // Calculate the point P on the surface of the sphere with a z-coordinate equal to zero
        const sin1 = Math.sin((1 - t) * d);
        const sin2 = Math.sin(t * d);
        const P = new Point(
            (sin1 / Math.sin(d) * P1[0] + sin2 / Math.sin(d) * P2[0]) * this.radius,
            (sin1 / Math.sin(d) * P1[1] + sin2 / Math.sin(d) * P2[1]) * this.radius,
            0
        );

        return P;
    }

    // Helps to interpolate between two colors
    blendColors(color1, color2, scale) {
        const red = color1[0] + (color2[0] - color1[0]) * (scale - 1) / 0.5;
        const green = color1[1] + (color2[1] - color1[1]) * (scale - 1) / 0.5;
        const blue = color1[2] + (color2[2] - color1[2]) * (scale - 1) / 0.5;
        return [red, green, blue];
    }

}