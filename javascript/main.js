var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Player from "./player.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AreaMap from "./graphics/areamap.js";
import FileLoader from "./fileloader.js";
import GameLoop from "./gameloop.js";
import Enemy from "./enemy.js";
import { BoxCollider } from "./collider.js";
import { distance } from "./util.js";
var player;
var enemy;
var area;
var ctx;
window.onload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        var canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");
        GameLoop.initInstance();
        GraphicsRenderer.initInstance(ctx);
        player = new Player();
        enemy = new Enemy();
        player.x = 3328;
        player.y = 2104;
        enemy.x = 3628;
        enemy.y = 2304;
        player.setImage(0.5, yield FileLoader.loadImage("resources/sprites/front_sprite.png"), 0, 0, 128, 256, 64, 128);
        GraphicsRenderer.instance.addExistingEntity(player.getImage());
        var image = player.getImage();
        player.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.9, image.getWidth() * 0.9, true), {
            x: 0,
            y: image.getHeight() * 0.3
        });
        GraphicsRenderer.instance.follow(player.getImage());
        enemy.setImage(0.5, yield FileLoader.loadImage("resources/sprites/pharaoh.png"), 0, 0, 100, 150, 50, 75);
        GraphicsRenderer.instance.addExistingEntity(enemy.getImage());
        image = enemy.getImage();
        enemy.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.6, image.getWidth() * 0.6, true), {
            x: 0,
            y: image.getHeight() * 0.3
        });
        enemy.setAttack(target => console.log(target.constructor.name + ": \"ouch\""));
        enemy.getCollider().addUserInteraction(null, attackEnemy, null, null);
        area = AreaMap.load("farmland.json", () => {
            area.getColliders().add(player.getCollider());
            area.getColliders().add(enemy.getCollider());
            enemy.setColliderLayer(area.getColliders());
            GameLoop.instance.start();
        });
        GameLoop.instance.suscribe(null, null, renderDebug, null, null);
    });
};
//#region Atacar enemigo
document.addEventListener("mousedown", dispatchClickEventToColliders);
document.addEventListener("touchstart", dispatchClickEventToColliders);
function dispatchClickEventToColliders(event) {
    var coordX;
    var coordY;
    if (event instanceof TouchEvent && event.touches[0]) {
        coordX = event.touches[0].clientX;
        coordY = event.touches[0].clientY;
    }
    else {
        coordX = event.clientX;
        coordY = event.clientY;
    }
    if (area) {
        area.getColliders().sendUserClick(coordX + GraphicsRenderer.instance.scrollX, coordY + GraphicsRenderer.instance.scrollY);
    }
}
function attackEnemy() {
    const ATTACK_RADIUS = 200;
    if (distance(player.x, player.y, enemy.x, enemy.y) < ATTACK_RADIUS) {
        console.log("Enemy: ouch");
    }
}
//#endregion
//#region Render Debug
var enableRenderDebug = false;
document.addEventListener("keydown", (event) => {
    if (event.key == "F2") {
        enableRenderDebug = !enableRenderDebug;
    }
});
function renderDebug() {
    if (!enableRenderDebug) {
        return;
    }
    var scrollX = GraphicsRenderer.instance.scrollX;
    var scrollY = GraphicsRenderer.instance.scrollY;
    area.getColliders().render(ctx, scrollX, scrollY);
    player.renderDebug(ctx, scrollX, scrollY);
    enemy.renderDebug(ctx, scrollX, scrollY);
}
//#endregion
//# sourceMappingURL=main.js.map