import Player from "./player.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AreaMap from "./graphics/areamap.js";
import FileLoader from "./fileloader.js";
import { BoxCollider, CircleCollider } from "./collider.js";

var player :Player;
var ctx :CanvasRenderingContext2D;

window.onload = function(){

    // TODO Adecentar todo esto cuando esté hecho el Game loop

    var canvas  :HTMLCanvasElement =  document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    GraphicsRenderer.initInstance(ctx);

    player = new Player(canvas, ctx);

    player.x = 3328;
    player.y = 2304;

    (async function() {
        player.setImage(0.5, await FileLoader.loadImage("resources/sprites/front_sprite.png"));
        GraphicsRenderer.instance.addExistingEntity(player.getImage());
        var image = player.getImage();
        player.setCollider(new CircleCollider(0, 0, image.getWidth() * 0.8, true),
        {
            x: image.getWidth() * 0.5,
            y: image.getHeight() * 0.6
        });

        var area = AreaMap.load("farmland.json", () => {
            area.getColliders().add(player.getCollider() as BoxCollider);
            mainGameLoop(area, canvas);
        })
    })();
    
};

/**
 * Main game loop
 */
function mainGameLoop(area :AreaMap, canvas :HTMLCanvasElement) {
    setInterval(()=>{

        //Actualización y renderización del jugador
        if(player) {
            player.update();
            GraphicsRenderer.instance.scrollX = player.x - canvas.width * 0.5;
            GraphicsRenderer.instance.scrollY = player.y - canvas.width * 0.5;
            GraphicsRenderer.instance.render();
            area.getColliders().checkCollisions();
            // area.getColliders().render(ctx, GraphicsRenderer.instance.scrollX, GraphicsRenderer.instance.scrollY);
        }
    }, 50)
}

