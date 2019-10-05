import Player from "./player.js";
console.log("Hello World");
var player;
var ctx;
window.onload = function () {
    var canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    player = new Player(canvas, ctx, 32, 32);
    /**
     * Main game loop
     */
    setInterval(() => {
        //Vacío del canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //Actualización y renderización del jugador
        if (player) {
            player.update();
            player.render();
        }
    }, 50);
};
//# sourceMappingURL=main.js.map