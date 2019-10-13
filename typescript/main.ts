import Player from "./player.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AreaMap from "./graphics/areamap.js";
import FileLoader from "./fileloader.js";
import GameLoop from "./gameloop.js";
import Enemy from "./enemy.js";
import { BoxCollider } from "./collider.js";
import { distance } from "./util.js";

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
    player.y = 2104;

    enemy.x = 3628;
    enemy.y = 2304;

    player.setImage(0.5, await FileLoader.loadImage("resources/sprites/front_sprite.png"), 0, 0, 128, 256, 64, 128);
    GraphicsRenderer.instance.addExistingEntity(player.getImage());
    var image = player.getImage();
    player.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.9, image.getWidth() * 0.9, true),
    {
        x: 0,
        y: image.getHeight() * 0.3
    });
    GraphicsRenderer.instance.follow(player.getImage());

    enemy.setImage(0.5, await FileLoader.loadImage("resources/sprites/pharaoh.png"), 0, 0, 100, 150, 50, 75);
    GraphicsRenderer.instance.addExistingEntity(enemy.getImage());
    image = enemy.getImage();
    enemy.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.6, image.getWidth() * 0.6, true),
    {
        x: 0,
        y: image.getHeight() * 0.3
    });
    enemy.setAttack(target => console.log(target.constructor.name + ": \"ouch\""));
    (enemy.getCollider() as BoxCollider).addUserInteraction(null, attackEnemy, null, null);

    area = AreaMap.load("farmland.json", () => {
        area.getColliders().add(player.getCollider() as BoxCollider);
        area.getColliders().add(enemy.getCollider() as BoxCollider);
        enemy.setColliderLayer(area.getColliders());
        GameLoop.instance.start();
    });
    
    GameLoop.instance.suscribe(null, null, renderDebug, null, null);
};

//#region Atacar enemigo
document.addEventListener("mousedown", dispatchClickEventToColliders);
document.addEventListener("touchstart", dispatchClickEventToColliders);

function dispatchClickEventToColliders(event :MouseEvent | TouchEvent) {
    var coordX :number;
    var coordY :number;

    if(event instanceof TouchEvent && event.touches[0]) {
        coordX = event.touches[0].clientX;
        coordY = event.touches[0].clientY;
    } else {
        coordX = (event as MouseEvent).clientX;
        coordY = (event as MouseEvent).clientY;
    }

    if(area) {
        area.getColliders().sendUserClick(coordX + GraphicsRenderer.instance.scrollX, coordY + GraphicsRenderer.instance.scrollY);
    }
}

function attackEnemy() {
    
    const ATTACK_RADIUS = 200;

    if(distance(player.x, player.y, enemy.x, enemy.y) < ATTACK_RADIUS) {
        console.log("Enemy: ouch");
    }

}
//#endregion

//#region Render Debug
var enableRenderDebug = false;

document.addEventListener("keydown", (event) => {
    if(event.key == "F2") {
        enableRenderDebug = !enableRenderDebug;
    }
});

function renderDebug() {
    if(!enableRenderDebug) {
        return;
    }

    var scrollX = GraphicsRenderer.instance.scrollX;
    var scrollY = GraphicsRenderer.instance.scrollY;
    
    area.getColliders().render(ctx, scrollX, scrollY);
    player.renderDebug(ctx, scrollX, scrollY);
    enemy.renderDebug(ctx, scrollX, scrollY);
}
//#endregion

