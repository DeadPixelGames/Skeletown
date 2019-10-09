import Player from "./player.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AreaMap from "./graphics/areamap.js";
import FileLoader from "./fileloader.js";
import GameLoop from "./gameloop.js";
import Enemy from "./enemy.js";
import { CircleCollider } from "./collider.js";

var player :Player;
var enemy :Enemy;
var area :AreaMap;
var ctx :CanvasRenderingContext2D;

window.onload = async function() {

    var canvas  :HTMLCanvasElement =  document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    GameLoop.initInstance();

    GraphicsRenderer.initInstance(ctx);

    player = new Player();
    enemy = new Enemy();

    player.x = 3328;
    player.y = 2304;

    enemy.x = 3528;
    enemy.y = 2304;

    player.setImage(0.5, await FileLoader.loadImage("resources/sprites/front_sprite.png"));
    GraphicsRenderer.instance.addExistingEntity(player.getImage());
    var image = player.getImage();
    player.setCollider(new CircleCollider(0, 0, image.getWidth() * 0.6, true),
    {
        x: image.getWidth() * 0.5,
        y: image.getHeight() * 0.6
    });
    GraphicsRenderer.instance.follow(player.getImage());

    enemy.setImage(0.5, await FileLoader.loadImage("resources/sprites/pharaoh.png"), 0, 0, 100, 150, 50, 75);
    GraphicsRenderer.instance.addExistingEntity(enemy.getImage());
    image = enemy.getImage();
    enemy.setCollider(new CircleCollider(0, 0, image.getWidth() * 0.6, true),
    {
        x: image.getWidth() * 0.5,
        y: image.getHeight() * 0.6
    });

    area = AreaMap.load("farmland.json", () => {
        area.getColliders().add(player.getCollider() as CircleCollider);
        area.getColliders().add(enemy.getCollider() as CircleCollider);
        enemy.setColliderLayer(area.getColliders());
        GameLoop.instance.start();
    });
    
    GameLoop.instance.suscribe(null, null, renderDebug, null, null);
};

function renderDebug() {
    var scrollX = GraphicsRenderer.instance.scrollX;
    var scrollY = GraphicsRenderer.instance.scrollY;
    
    area.getColliders().render(ctx, scrollX, scrollY);
    player.renderDebug(ctx, scrollX, scrollY);
    enemy.renderDebug(ctx, scrollX, scrollY);
}

