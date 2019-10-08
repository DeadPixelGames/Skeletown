import Player from "./player.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AreaMap from "./graphics/areamap.js";
import FileLoader from "./fileloader.js";
import GameLoop from "./gameloop.js";
import { BoxCollider, CircleCollider } from "./collider.js";

var player :Player;
var ctx :CanvasRenderingContext2D;

window.onload = function() {

    var canvas  :HTMLCanvasElement =  document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    GameLoop.initInstance();

    GraphicsRenderer.initInstance(ctx);

    player = new Player();

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
        GraphicsRenderer.instance.follow(player.getImage());

        var area = AreaMap.load("farmland.json", () => {
            area.getColliders().add(player.getCollider() as BoxCollider);
            GameLoop.instance.start();
        })
    })();
    
};

