import Player from "./player.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AreaMap from "./graphics/areamap.js";
import FileLoader from "./fileloader.js";
import { BoxCollider } from "./collider.js";

var player :Player;
var ctx :CanvasRenderingContext2D;

window.onload = function(){

    // TODO Adecentar todo esto cuando esté hecho el Game loop

    var canvas  :HTMLCanvasElement =  document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    GraphicsRenderer.initInstance(ctx);

    player = new Player(canvas, ctx);

    player.x = 1700;
    player.y = 1000;

    (async function() {
        player.setImage(2, await FileLoader.loadImage("resources/sprites/pharaoh.png"), 0, 0, 100, 150, 50, 75);
        GraphicsRenderer.instance.addExistingEntity(player.getImage());
        var image = player.getImage();
        player.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.8, image.getWidth() * 0.8, true),
        {
            x: image.getWidth() * 0.5,
            y: image.getHeight() * 0.6
        });
    })();

    var area = AreaMap.load("test_tilemap.json", () => {
        area.getColliders().add(player.getCollider() as BoxCollider);
    });

    /**
     * Main game loop
     */
    setInterval(()=>{

        //Actualización y renderización del jugador
        if(player) {
            player.update();
            GraphicsRenderer.instance.scrollX = player.x - canvas.width * 0.5;
            GraphicsRenderer.instance.scrollY = player.y - canvas.width * 0.5;
            GraphicsRenderer.instance.render();
            area.getColliders().render(ctx, GraphicsRenderer.instance.scrollX, GraphicsRenderer.instance.scrollY);
        }
    }, 50)
};


