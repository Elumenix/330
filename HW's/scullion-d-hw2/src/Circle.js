// Inspiration for this class was taken from here: https://codepen.io/Mertl/pen/GexapP
export class Circle {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 3; // Between 0 and 4
        this.angle = Math.random() * 2 * Math.PI;
        this.velocity = (this.size ** 2) / 4;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
    update(soundData) {
        let sum = 0;
        for (let i = 0; i < soundData.length; i++) {
            sum += soundData[i];
        }

        // sum will be a number between 1 and 4
        sum = ((((sum / soundData.length) / 255)) * 2.5) + 1

        // move forward
        this.x += this.velocity * sum * Math.cos(this.angle);
        this.y += this.velocity * sum * Math.sin(this.angle);

        // modify angle slightly so it isn't just static movement; Happens within 10 degrees 
        this.angle += Math.random() * 20 * Math.PI / 180 - 10 * Math.PI / 180;

        // I always wan't the angle to go towards the top of the screen
        if (this.angle < 0) {
            this.angle += Math.PI / 12; // + 15 degrees
        }
        if (this.angle > Math.PI) {
            this.angle -= Math.PI / 12; // - 15 degrees
        }

        // Wrap around the side of the screen so that they aren't permanently lost
        if (this.x > this.canvasWidth + 15) {
            this.x = -5;
        }
        if (this.x < -15) {
            this.x = this.canvasWidth + 5;
        }
        if (this.y > this.canvasHeight + 15) {
            this.y = -5;
        }
    }
    draw(ctx, soundData) {
        let sum = 0;
        for (let i = 0; i < soundData.length; i++) {
            sum += soundData[i];
        }

        // sum will be a number between 1 and 1.25
        sum = (((sum / soundData.length) / 255) * 1.25) + 1;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * sum, 0, 2 * Math.PI);
        ctx.fillStyle = "#fddba3";
        ctx.fill();
    }
}
