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
import { BoxCollider } from "./collider.js";
import { UILayout, UISquareEntity, UICircleEntity, ProgressBar } from "./ui/uiEntity.js";
import Interface from "./ui/interface.js";
import Enemy from "./enemy.js";
import { distance } from "./util.js";
import AudioManager from "./audiomanager.js";
//#region Declaración de variables
var player;
var enemy;
var area;
var ctx;
var hud_InGame;
var lifeBar;
var moneyCounter;
var time;
var inventory;
var interf;
//#endregion
var resize = function () {
    ctx.canvas.width = document.documentElement.clientWidth * 0.95;
    ctx.canvas.height = document.documentElement.clientHeight * 0.95;
    hud_InGame.resize(ctx.canvas.width, ctx.canvas.height);
};
window.addEventListener("resize", resize);
window.onload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        //TODO Adecentar esto
        var canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");
        GameLoop.initInstance();
        GraphicsRenderer.initInstance(ctx);
        //#region Interfaz
        moneyCounter = new UISquareEntity(0.09, 0.03, 320, 91, true, (x, y) => {
        });
        lifeBar = new ProgressBar(0.5, 0.03, 703, 128, true, (x, y) => {
            lifeBar.setProgress(lifeBar.getProgress() - 10);
        });
        time = new UISquareEntity(0.95, 0.03, 362, 128, false);
        inventory = new UICircleEntity(0.9, 0.8, 122, true, (x, y) => {
            lifeBar.setProgress(lifeBar.getProgress() + 10);
        });
        interf = new Interface(canvas.width, canvas.height);
        interf.addCollider(lifeBar.getCollider());
        interf.addCollider(moneyCounter.getCollider());
        interf.addCollider(time.getCollider());
        interf.addCollider(inventory.getCollider());
        hud_InGame = new UILayout(0, 0, canvas.width, canvas.height);
        hud_InGame.addUIEntity(lifeBar);
        hud_InGame.addUIEntity(moneyCounter);
        hud_InGame.addUIEntity(time);
        hud_InGame.addUIEntity(inventory);
        moneyCounter.setText("1283902", { x: 30, y: 65 });
        time.setText("10:21", { x: 30, y: 65 });
        lifeBar.setImage(99, yield FileLoader.loadImage("resources/interface/HUD_life3.png"));
        lifeBar.setIcon(100, yield FileLoader.loadImage("resources/interface/HUD_life1.png"));
        lifeBar.setProgressBar(100, yield FileLoader.loadImage("resources/interface/HUD_life2.png"));
        moneyCounter.setImage(100, yield FileLoader.loadImage("resources/interface/HUD_money.png"));
        time.setImage(100, yield FileLoader.loadImage("resources/interface/HUD_time.png"));
        inventory.setImage(100, yield FileLoader.loadImage("resources/interface/HUD_inventory.png"));
        hud_InGame.addEntitiesToRenderer();
        //#endregion
        //#region Jugador
        player = new Player();
        player.x = 1200;
        player.y = 1280;
        //// player.setImage(2.5, await FileLoader.loadImage("resources/sprites/front_sprite.png"), 0, 0, 128, 256, 64, 128);
        yield player.setAnimation(2.5, "skeleton.json");
        var image = player.getImage();
        if (image) {
            GraphicsRenderer.instance.addExistingEntity(image);
            player.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.9, image.getWidth() * 0.9, true), {
                x: 0,
                y: image.getHeight() * 0.3
            });
        }
        GraphicsRenderer.instance.follow(player.getImage());
        player.suscribe(lifeBar, (health, maxHealth) => {
            lifeBar.setProgress(health * 100 / maxHealth);
            if (AudioManager.instance.contextIsActive()) {
                AudioManager.instance.playSound("sound");
            }
        }, () => console.log("Game Over :("));
        //#endregion
        //#region Área
        area = AreaMap.load("farmland2.json", () => {
            if (enemy) {
                area.getColliders().add(player.getCollider());
                GameLoop.instance.start();
            }
        });
        //#endregion
        enemy = yield generateEnemy(() => {
            if (enemy) {
                enemy.dispose();
                console.log("Enemy: :(");
            }
            enemy = null;
        });
        GameLoop.instance.suscribe(null, null, renderDebug, null, null);
    });
};
//#region Generar AudioContext
function generateAudioContext() {
    if (!AudioManager.instance) {
        AudioManager.initInstance();
    }
    AudioManager.instance.activateContext();
    AudioManager.instance.load("sound", "sound.ogg");
    window.audiomanager = AudioManager.instance;
}
window.addEventListener("mouseover", generateAudioContext);
window.addEventListener("touchstart", generateAudioContext);
//#endregion
//#region Crear enemigo
function generateEnemy(onDead) {
    return __awaiter(this, void 0, void 0, function* () {
        var enemy = new Enemy();
        enemy.x = 2176;
        enemy.y = 1280;
        enemy.setImage(2.5, yield FileLoader.loadImage("resources/sprites/pharaoh.png"), 0, 0, 100, 150, 50, 75);
        var image = enemy.getImage();
        if (image) {
            GraphicsRenderer.instance.addExistingEntity(image);
            enemy.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.6, image.getWidth() * 0.6, true), {
                x: 0,
                y: image.getHeight() * 0.3
            });
        }
        enemy.setAttack(target => {
            target.setHealth(target.getHealth() - 10);
            console.log(target.constructor.name + ": \"ouch\"");
        });
        enemy.getCollider().addUserInteraction(null, attackEnemy, null, null);
        enemy.suscribe(enemy, null, onDead);
        area.getColliders().add(enemy.getCollider());
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
        area.getColliders().sendUserClick(coordX + GraphicsRenderer.instance.scrollX, coordY + GraphicsRenderer.instance.scrollY);
    }
}
function attackEnemy() {
    const ATTACK_RADIUS = 200;
    if (enemy)
        if (distance(player.x, player.y, enemy.x, enemy.y) < ATTACK_RADIUS) {
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
    area.getColliders().render(ctx, scrollX, scrollY);
    player.renderDebug(ctx, scrollX, scrollY);
    if (enemy) {
        enemy.renderDebug(ctx, scrollX, scrollY);
    }
    interf.getColliders().render(ctx);
}
//#endregion
//# sourceMappingURL=main.js.map