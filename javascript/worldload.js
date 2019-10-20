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
import Enemy from "./enemy.js";
import AreaMap from "./graphics/areamap.js";
import GameLoop from "./gameloop.js";
import { Inventory } from "./inventory.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import { BoxCollider } from "./collider.js";
import { Hud } from "./ui/hud.js";
import Interface, { InterfaceInWorld } from "./ui/interface.js";
import { distance } from "./util.js";
import AudioManager from "./audiomanager.js";
const BLINK_PROPERTIES = {
    blink: 2,
    time: 0.1
};
var player;
var enemy;
var area;
var ctx;
export default function loadWorld() {
    return __awaiter(this, void 0, void 0, function* () {
        ctx = GraphicsRenderer.instance.getCanvasContext();
        //#region Jugador
        player = new Player();
        player.x = 14592;
        player.y = 4352;
        //// player.setImage(4, await FileLoader.loadImage("resources/sprites/front_sprite.png"), 0, 0, 128, 256, 64, 128);
        yield player.setAnimation(3.5, "skeleton.json");
        var image = player.getImage();
        if (image) {
            GraphicsRenderer.instance.addExistingEntity(image);
            player.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.5, image.getWidth() * 0.5, true), {
                x: 0,
                y: image.getHeight() * 0.3
            });
        }
        GraphicsRenderer.instance.follow(player.getImage());
        player.suscribe(Hud.instance.lifeBar, (health, maxHealth) => {
            Hud.instance.lifeBar.setProgress(health * 100 / maxHealth);
        }, () => console.log("Game Over :("));
        //#endregion
        //#region Inventario
        Inventory.instance.addItem({
            id: 0,
            name: "Skullpkin",
            description: "Skulled Pumpkin",
            type: "crop"
        }, 3);
        Inventory.instance.addItem({
            id: 1,
            name: "Ghost Pepper",
            description: "Peppers' immortal souls",
            type: "crop"
        }, 4);
        Inventory.instance.addItem({
            id: 2,
            name: "SoulCorn",
            description: "Corn Cub with souls",
            type: "crop"
        }, 2);
        Inventory.instance.addItem({
            id: 3,
            name: "Zombihorias",
            description: "The undead tubercule",
            type: "crop"
        }, 5);
        Inventory.instance.addItem({
            id: 4,
            name: "Demonions",
            description: "So evil, they will make you cry",
            type: "crop"
        }, 5);
        Inventory.instance.addItem({
            id: 0,
            name: "Speeder",
            description: "Grow in a blink",
            type: "fertilizer"
        }, 6, 2);
        Inventory.instance.addItem({
            id: 1,
            name: "Quantity",
            description: "Quantity over quality",
            type: "fertilizer"
        }, 6, 2);
        //#endregion
        yield loadArea();
        enemy = yield generateEnemy(() => {
            if (enemy) {
                enemy.dispose();
                console.log("Enemy: :(");
            }
            enemy = null;
        });
        GameLoop.instance.suscribe(null, null, renderDebug, null, null);
    });
}
function loadArea() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            area = AreaMap.load("farmland.json", () => {
                if (enemy) {
                    var collider = player.getCollider();
                    if (collider) {
                        area.getColliders().add(collider);
                    }
                }
                resolve();
            });
        });
    });
}
//#region Crear enemigo
function generateEnemy(onDead) {
    return __awaiter(this, void 0, void 0, function* () {
        var enemy = new Enemy();
        enemy.x = 2176;
        enemy.y = 1280;
        //// enemy.setImage(2.5, await FileLoader.loadImage("resources/sprites/pharaoh.png"), 0, 0, 100, 150, 50, 75);
        yield enemy.setAnimation(2.5, "enemy_1.json");
        var image = enemy.getImage();
        if (image) {
            GraphicsRenderer.instance.addExistingEntity(image);
            enemy.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.6, image.getWidth() * 0.6, true), {
                x: 0,
                y: image.getHeight() * 0.3
            });
        }
        enemy.setAttack(target => {
            enemy.setAttacking(true);
            target.blink(BLINK_PROPERTIES.blink, BLINK_PROPERTIES.time);
            target.setHealth(target.getHealth() - 10);
            console.log(target.constructor.name + ": \"ouch\"");
        });
        enemy.suscribe(enemy, null, onDead);
        var collider = enemy.getCollider();
        if (collider) {
            collider.addUserInteraction(null, attackEnemy, null, null);
            area.getColliders().add(collider);
        }
        enemy.setColliderLayer(area.getColliders());
        return enemy;
    });
}
//#endregion
//#region Atacar enemigo
document.addEventListener("mousedown", dispatchClickEventToColliders);
document.addEventListener("touchstart", dispatchClickEventToColliders);
function dispatchClickEventToColliders(event) {
    var coordX;
    var coordY;
    if (window.TouchEvent && event instanceof TouchEvent && event.touches[0]) {
        coordX = event.touches[0].clientX;
        coordY = event.touches[0].clientY;
    }
    else {
        coordX = event.clientX;
        coordY = event.clientY;
    }
    if (area) {
        area.getColliders().sendUserClick(coordX / GraphicsRenderer.instance.scaleX + GraphicsRenderer.instance.scrollX, coordY / GraphicsRenderer.instance.scaleY + GraphicsRenderer.instance.scrollY);
    }
}
function attackEnemy() {
    const ATTACK_RADIUS = 200;
    if (enemy)
        if (distance(player.x, player.y, enemy.x, enemy.y) < ATTACK_RADIUS) {
            player.setAttacking(true);
            enemy.blink(BLINK_PROPERTIES.blink, BLINK_PROPERTIES.time);
            enemy.setHealth(enemy.getHealth() - 10);
            console.log("Enemy: ouch");
        }
}
//#endregion
//#region Render Debug
var enableRenderDebug = false;
document.addEventListener("keydown", (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.key == "F2") {
        enableRenderDebug = !enableRenderDebug;
    }
    else if (event.key == "e") {
        if (!enemy) {
            enemy = yield generateEnemy(() => {
                if (enemy) {
                    enemy.dispose();
                    console.log("Enemy: :(");
                }
                enemy = null;
            });
        }
    }
    else if (event.key == "h") {
        player.setHealth(100);
    }
}));
function renderDebug() {
    if (!enableRenderDebug) {
        return;
    }
    var scrollX = GraphicsRenderer.instance.scrollX;
    var scrollY = GraphicsRenderer.instance.scrollY;
    var scaleX = GraphicsRenderer.instance.scaleX;
    var scaleY = GraphicsRenderer.instance.scaleY;
    ctx.lineWidth = 1;
    area.getColliders().render(ctx, scrollX, scrollY);
    player.renderDebug(ctx, scrollX, scrollY);
    if (enemy) {
        enemy.renderDebug(ctx, scrollX, scrollY);
    }
    Interface.instance.getColliders().render(ctx);
    InterfaceInWorld.instance.getColliders().render(ctx, scrollX, scrollY);
}
//#endregion
//#region Generar AudioContext
function generateAudioContext() {
    if (!AudioManager.instance) {
        AudioManager.initInstance();
    }
    AudioManager.instance.activateContext();
    window.audiomanager = AudioManager.instance;
}
window.addEventListener("mouseover", generateAudioContext);
window.addEventListener("touchstart", generateAudioContext);
//#endregion
//# sourceMappingURL=worldload.js.map