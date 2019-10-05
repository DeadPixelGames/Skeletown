import Entity from "./entity.js";
export default class Player extends Entity {
    //private walkRight :Animation;
    //private idle :Animation;
    constructor(canvas, ctx, width, height) {
        super(canvas, ctx);
        this.mouse = false;
        this.width = width;
        this.height = height;
        var that = this;
        canvas.addEventListener('mousedown', function (e) {
            that.mouse = true;
            that.mouseEvent = e;
            that.move();
        });
        canvas.addEventListener('touchstart', (e) => {
            that.mouse = true;
            that.mouseEvent = e;
            that.move();
        });
        canvas.addEventListener('mouseup', function (e) {
            that.mouse = false;
            that.mouseEvent = e;
            that.dest = { "x": that.x, "y": that.y };
        });
        canvas.addEventListener('touchend', function (e) {
            that.mouse = false;
            that.mouseEvent = e;
            that.dest = { "x": that.x, "y": that.y };
        });
        canvas.addEventListener('mousemove', function (e) {
            that.mouseEvent = e;
        });
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    setWidth(width) {
        this.width = width;
    }
    setHeight(height) {
        this.height = height;
    }
    getCursorPosition(canvas) {
        const rect = canvas.getBoundingClientRect();
        var x;
        var y;
        x = this.mouseEvent.clientX - rect.left;
        y = this.mouseEvent.clientY - rect.top;
        console.log("x: " + x + " y: " + y);
        return { "x": x, "y": y };
    }
    /*
        private getCursorPosition(canvas :HTMLCanvasElement, event :TouchEvent){
            const rect = canvas.getBoundingClientRect()
            var x :number;
            var y :number;
            event.scree
            var touch = event.changedTouches[0];
                x = touch.clientX - rect.left
                y = touch.clientY - rect.top
                console.log("x: " + x + " y: " + y)
                return {"x" : x, "y" : y}
        }
    
    */
    render() {
        console.log("render");
        this.ctx.fillStyle = "#00FF88";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    update() {
        var length = Math.sqrt(Math.pow(this.dest.x - this.x, 2) + Math.pow(this.dest.y - this.y, 2));
        if (length > this.speed) {
            this.x += (this.dest.x - this.x) / length * this.speed;
            this.y += (this.dest.y - this.y) / length * this.speed;
        }
        //Mover a la velocidad hasta el sitio concreto
    }
    move() {
        if (this.mouse) {
            this.dest = this.getCursorPosition(this.canvas);
            setTimeout(() => this.move(), 10);
        }
        else {
            return;
        }
    }
}
//# sourceMappingURL=player.js.map