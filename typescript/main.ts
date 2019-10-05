import Player from "./player.js";
console.log("Hello World");
var player :Player;
var ctx :CanvasRenderingContext2D;

window.onload = function(){

    var canvas  :HTMLCanvasElement =  document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    
    player = new Player(canvas, ctx, 32, 32);

    /**
     * Main game loop
     */
    setInterval(()=>{
        //Vacío del canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //Actualización y renderización del jugador
        if(player) {
            player.update();
            player.render(); 
        }
    },50)
};


