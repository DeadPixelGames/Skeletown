import Player from "./player.js";
console.log("Hello World");
var player :Player;
var ctx :CanvasRenderingContext2D;

window.onload = function(){

    var canvas  :HTMLCanvasElement =  document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    //ctx.fillStyle = "#00FF88"
    //ctx.fillRect(20, 20, 32, 32);
    
    
    player = new Player(canvas, ctx, 32, 32);
    //player.render();
    setInterval(()=>{
        if(ctx){}
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(player) {
            player.update();
            player.render(); 
        }
    },100)
};


