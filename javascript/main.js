import Player from "./player.js";
console.log("Hello World");
var player;
var ctx;
window.onload = function () {
    var canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    //ctx.fillStyle = "#00FF88"
    //ctx.fillRect(20, 20, 32, 32);
    player = new Player(canvas, ctx, 32, 32);
    //player.render();
    setInterval(() => {
        if (ctx) { }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (player) {
            player.update();
            player.render();
        }
    }, 100);
};
//# sourceMappingURL=main.js.map