import { Point } from "./Point.js";

export class Sphere {
    constructor(ctx, radius, canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.boundry = new Array();
        this.radius = radius;
        this.numberOfVertices = 0;
        this.constant = (2 * Math.PI) / 40;
        this.rings = [];
        this.ctx = ctx;

        // Establish x and z position of points
        for (let i = 0; i <= 2 * Math.PI; i += this.constant) {
            this.boundry[this.numberOfVertices] = new Point(Math.cos(i) * this.radius, 0, Math.sin(i) * this.radius);
            this.numberOfVertices++;
        }

        // Create Vertical points in line with center ring
        for (let direction = 1; direction >= -1; direction -= 2) {
            for (let j = this.constant; j < Math.PI / 2; j += this.constant) {
                let radius = Math.cos(j) * this.radius;
                let fixedY = Math.sin(j) * this.radius * direction;

                // Establish all x and z positions on ring
                for (let i = 0; i < 6.28; i += this.constant) {
                    this.boundry[this.numberOfVertices] = new Point(Math.cos(i) * radius, fixedY, Math.sin(i) * radius);
                    this.numberOfVertices++;
                }
            }
        }


        // Next section of code puts all points into 2D array by what ring they're in
        // This will make it much easier to sort for when they get affected by wavelengths
        let currentYRow = this.boundry[0].trueY;
        let firstPoint = this.boundry[0];
        let currentRing = 0;
        let pointNum = 0;

        // Central Ring
        this.rings[0] = new Array();


        for (let i = 0; i < this.numberOfVertices; i++) {
            if (this.boundry[i].trueY != currentYRow) {
                // Move on to next line
                currentYRow = this.boundry[i].trueY;
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
                if (this.rings[j][0].trueY > this.rings[j + 1][0].trueY) {

                    // If the condition is true then swap them
                    let temp = this.rings[j];
                    this.rings[j] = this.rings[j + 1];
                    this.rings[j + 1] = temp;
                }
            }
        }
    }

    drawSphere(audioData, pulse) {
        let ctx = this.ctx;
        let currentRing = this.rings[0];
        let canvasWidth = this.canvasWidth;
        let canvasHeight = this.canvasHeight;
        let scaling = new Array(this.rings.length);


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
                scaling[i] = (scale / 255) / 2 + 1;
            }
            else {
                // All rings remain default size
                scaling[i] = 1;
            }
        }

        ctx.lineWidth = 3;

        // Color The back af all rings
        for (let i = 0; i < this.rings.length; i++, currentRing = this.rings[i]) {

            ctx.beginPath();

            for (let pointNum = 0; pointNum < currentRing.length; pointNum++) {
                ctx.lineTo(canvasWidth / 2 + (currentRing[pointNum].x * scaling[i]), canvasHeight / 2 - (currentRing[pointNum].y * scaling[i]));
            }

            ctx.strokeStyle = `rgb(${Math.floor(54.3 + 16.7 * (scaling[i] ** 6))}, ${Math.floor(2 * (scaling[i] ** 11.96))}, ${Math.floor(255)})`;
            ctx.closePath();
            ctx.stroke();
        }


        // Color the front side of all rings
        currentRing = this.rings[0];
        for (let i = 0; i < this.rings.length; i++, currentRing = this.rings[i]) {
            let startNum = -1;
            let allSame = false;
            ctx.strokeStyle = `rgb(${Math.floor(220 + 10 * (scaling[i] ** 3.1))}, ${Math.floor(5 + 5 * (scaling[i] ** 9.65))}, ${Math.floor(5 + 5 * (scaling[i] ** 9.65))})`;

            if (currentRing[0].z >= 0 && currentRing[currentRing.length - 1].z < 0) {
                startNum = currentRing.length - 1;
            }
            else {
                for (let j = 1; j < currentRing.length; j++) {
                    if (currentRing[j].z >= 0 && currentRing[j - 1].z < 0) {
                        startNum = j - 1;
                        break;
                    }
                }

                // All of it is Positive or negative
                if (startNum == -1) {
                    startNum = currentRing.length - 1;
                    allSame = true;
                }
            }

            // This will smooth out borders on one side of the sphere
            let beginning;
            if (startNum == 0) {
                beginning = this.slerp(currentRing[0], currentRing[currentRing.length - 1]);
            }
            else {
                beginning = this.slerp(currentRing[startNum], currentRing[startNum - 1]);
            }

            ctx.beginPath();

            ctx.lineTo(canvasWidth / 2 + (currentRing[startNum].x * scaling[i]), canvasHeight / 2 - (currentRing[startNum].y * scaling[i]))

            for (let pointNum = startNum + 1; pointNum != startNum; pointNum++) {
                // Early escape, it isn't necessary to color this ring
                if (allSame && currentRing[0].z < 0) {
                    break;
                }

                // Go to beginning of ring
                if (pointNum >= currentRing.length) {
                    pointNum = 0;

                    // Another edge case, spheres are complicated
                    if (currentRing[currentRing.length - 1].z >= 0 && currentRing[0].z < 0) {
                        let ending = this.slerp(currentRing[0], currentRing[currentRing.length - 1])
                        ctx.lineTo(canvasWidth / 2 + (ending.x * scaling[i]), canvasHeight / 2 - (ending.y * scaling[i]));


                        ctx.stroke();
                        break;
                    }
                }

                // This was an annoying edge case
                if (startNum == 0 && pointNum == 0) {
                    break;
                }

                if (allSame) {
                    ctx.lineTo(canvasWidth / 2 + (currentRing[pointNum].x * scaling[i]), canvasHeight / 2 - (currentRing[pointNum].y * scaling[i]));
                }
                else {
                    if (currentRing[pointNum].z < 0 && pointNum - 1 != -1 && currentRing[pointNum - 1].z >= 0) {
                        ctx.lineTo(canvasWidth / 2 + (currentRing[pointNum].x * scaling[i]), canvasHeight / 2 - (currentRing[pointNum].y * scaling[i]));

                        if (pointNum + 1 == currentRing.length) {
                            let ending = this.slerp(currentRing[pointNum], currentRing[currentRing.length - 1])
                            ctx.lineTo(canvasWidth / 2 + (ending.x * scaling[i]), canvasHeight / 2 - (ending.y * scaling[i]));
                        }
                        else {
                            let ending = this.slerp(currentRing[pointNum - 1], currentRing[pointNum])
                            ctx.lineTo(canvasWidth / 2 + (ending.x * scaling[i]), canvasHeight / 2 - (ending.y * scaling[i]));
                        }

                        ctx.stroke()
                        break;
                    }
                    // Another annoying edge case
                    else if (pointNum == 0 && currentRing[pointNum].z < 0 && currentRing[currentRing.length - 1] >= 0) {
                        let ending = this.slerp(currentRing[pointNum], currentRing[pointNum - 1])
                        ctx.lineTo(canvasWidth / 2 + (ending.x * scaling[i]), canvasHeight / 2 - (ending.y * scaling[i]));

                        ctx.stroke();
                    }
                    else {
                        ctx.lineTo(canvasWidth / 2 + (currentRing[pointNum].x * scaling[i]), canvasHeight / 2 - (currentRing[pointNum].y * scaling[i]));

                        // Edge case where only one point is negative : This should be the final one
                        if (pointNum + 1 == startNum) {
                            let ending = this.slerp(currentRing[pointNum], currentRing[startNum])
                            ctx.lineTo(canvasWidth / 2 + (ending.x * scaling[i]), canvasHeight / 2 - (ending.y * scaling[i]));

                            ctx.stroke();
                        }
                        else if (pointNum + 1 >= currentRing.length && startNum == 0) {
                            let ending = this.slerp(currentRing[pointNum], currentRing[0])
                            ctx.lineTo(canvasWidth / 2 + (ending.x * scaling[i]), canvasHeight / 2 - (ending.y * scaling[i]));

                            ctx.stroke();
                        }
                    }
                }
            }

            if (allSame) {

                if (currentRing[startNum].z >= 0) {

                    // Path can be closed because full loop
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }
    }

    rotateX(degrees) {
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

        // Calculate the value of t that represents the position of the point along the great circle connecting P1 and P2
        const t = -P1[2] / (P2[2] - P1[2]);

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
}