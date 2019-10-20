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
import { distance, sleep } from "./util.js";
import AudioManager from "./audiomanager.js";
import { FarmlandManager } from "./farmland.js";
import { GameOver } from "./ui/gameover.js";
const BLINK_PROPERTIES = {
    blink: 2,
    time: 0.1
};
var player;
var enemies = [];
var area;
var ctx;
var enemiesSpawnpoints = [
    { x: 22272, y: 19712, source: "enemy_1.json" },
    { x: 24064, y: 19584, source: "enemy_1.json" },
    { x: 23936, y: 18944, source: "enemy_1.json" },
    { x: 23268, y: 18560, source: "enemy_1.json" },
    { x: 24192, y: 18176, source: "enemy_1.json" },
    { x: 24832, y: 17920, source: "enemy_1.json" },
    { x: 28160, y: 17920, source: "enemy_1.json" },
    { x: 29696, y: 19072, source: "enemy_1.json" },
    { x: 29184, y: 13952, source: "enemy_1.json" },
    { x: 30720, y: 14464, source: "enemy_1.json" },
    { x: 29440, y: 15616, source: "enemy_2.json" },
    { x: 29440, y: 14848, source: "enemy_2.json" },
    { x: 28416, y: 14080, source: "enemy_2.json" },
    { x: 29568, y: 14280, source: "enemy_2.json" },
    { x: 30464, y: 14080, source: "enemy_2.json" }
];
export default function loadWorld() {
    return __awaiter(this, void 0, void 0, function* () {
        ctx = GraphicsRenderer.instance.getCanvasContext();
        //#region Jugador
        player = new Player();
        player.x = 14500;
        player.y = 17152;
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
        }, () => GraphicsRenderer.instance.fadeOutAndIn(0.3, () => __awaiter(this, void 0, void 0, function* () {
            Inventory.instance.deactivate();
            Inventory.instance.hide();
            Hud.instance.deactivate();
            Hud.instance.hide();
            yield sleep(50);
            yield unloadGame();
            GameOver.instance.activate();
            GameOver.instance.show();
        })));
        //#endregion
        //#region Inventario
        Inventory.instance.addItem({
            id: 0,
            name: "Skullpkin",
            description: "Skulled Pumpkin",
            type: "crop",
            count: 3
        });
        Inventory.instance.addItem({
            id: 1,
            name: "Ghost Pepper",
            description: "Peppers' immortal souls",
            type: "crop",
            count: 4
        });
        Inventory.instance.addItem({
            id: 2,
            name: "SoulCorn",
            description: "Corn Cub with souls",
            type: "crop",
            count: 2
        });
        Inventory.instance.addItem({
            id: 3,
            name: "Zombihorias",
            description: "The undead tubercule",
            type: "crop",
            count: 5
        });
        Inventory.instance.addItem({
            id: 4,
            name: "Demonions",
            description: "So evil, they will make you cry",
            type: "crop",
            count: 5
        });
        Inventory.instance.addItem({
            id: 0,
            name: "Speeder",
            description: "Grow in a blink",
            type: "fertilizer",
            count: 6,
            strength: 2
        });
        Inventory.instance.addItem({
            id: 1,
            name: "Quantity",
            description: "Quantity over quality",
            type: "fertilizer",
            count: 6,
            strength: 2
        });
        //#endregion
        yield loadArea();
        for (let e of enemiesSpawnpoints) {
            yield (function (e) {
                return __awaiter(this, void 0, void 0, function* () {
                    var ret = yield generateEnemy(e.x, e.y, e.source, () => {
                        if (ret) {
                            ret.dispose();
                            console.log("Enemy: :(");
                            enemies.remove(ret);
                        }
                    });
                    enemies.push(ret);
                });
            })(e);
        }
        GameLoop.instance.suscribe(null, null, renderDebug, null, null);
    });
}
function loadArea() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            area = AreaMap.load("farmland.json", () => {
                if (player) {
                    var collider = player.getCollider();
                    if (collider && area) {
                        area.getColliders().add(collider);
                    }
                }
                resolve();
            });
        });
    });
}
export function unloadArea() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let entity of [player, ...enemies]) {
            if (entity) {
                entity.dispose();
            }
        }
        console.log("Entidades eliminadas");
        player = null;
        enemies = [];
        if (area) {
            area.unload();
            console.log("Área eliminada");
            area = null;
        }
    });
}
export function unloadGame() {
    return __awaiter(this, void 0, void 0, function* () {
        yield unloadArea();
        FarmlandManager.instance.farmlands = [];
        Inventory.instance.items = [];
    });
}
//#region Crear enemigo
function generateEnemy(x, y, source, onDead) {
    return __awaiter(this, void 0, void 0, function* () {
        var enemy = new Enemy();
        enemy.x = x;
        enemy.y = y;
        //// enemy.setImage(2.5, await FileLoader.loadImage("resources/sprites/pharaoh.png"), 0, 0, 100, 150, 50, 75);
        yield enemy.setAnimation(3.5, source);
        var image = enemy.getImage();
        if (image) {
            GraphicsRenderer.instance.addExistingEntity(image);
            enemy.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.6, image.getWidth() * 0.6, true), {
                x: 0,
                y: image.getHeight() * 0.3
            });
        }
        if (source == "enemy_1.json") {
            enemy.setMaxHealth(2);
        }
        else {
            enemy.setMaxHealth(4);
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
            (function (enemy) {
                collider.addUserInteraction(null, () => attackEnemy(enemy), null, null);
            })(enemy);
            if (area)
                area.getColliders().add(collider);
        }
        if (area)
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
function attackEnemy(enemy) {
    const ATTACK_RADIUS = 200;
    if (player && enemy)
        if (distance(player.x, player.y, enemy.x, enemy.y) < ATTACK_RADIUS) {
            player.setAttacking(true);
            enemy.blink(BLINK_PROPERTIES.blink, BLINK_PROPERTIES.time);
            enemy.setHealth(enemy.getHealth() - 1);
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
        var enemy = new Enemy();
        enemy = yield generateEnemy(23936, 18944, "enemy_1.json", () => {
            if (enemy) {
                enemy.dispose();
                console.log("Enemy: :(");
            }
            enemy = null;
        });
        enemies.push(enemy);
    }
    else if (event.key == "E") {
        var enemy = new Enemy();
        enemy = yield generateEnemy(29568, 14280, "enemy_2.json", () => {
            if (enemy) {
                enemy.dispose();
                console.log("Enemy: :(");
            }
            enemy = null;
        });
        enemies.push(enemy);
    }
    else if (event.key == "h" && player) {
        player.setHealth(100);
    }
}));
function renderDebug() {
    if (!enableRenderDebug) {
        return;
    }
    var scrollX = GraphicsRenderer.instance.scrollX;
    var scrollY = GraphicsRenderer.instance.scrollY;
    ctx.lineWidth = 1;
    if (area)
        area.getColliders().render(ctx, scrollX, scrollY);
    if (player)
        player.renderDebug(ctx, scrollX, scrollY);
    for (let enemy of enemies) {
        if (enemy) {
            enemy.renderDebug(ctx, scrollX, scrollY);
        }
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
export function saveWorldInfo() {
    if (!player) {
        console.warn("Es necesario que el jugador esté en el mundo para guardar los datos.");
        return;
    }
    var infoPlayer = {
        x: player.x,
        y: player.y,
        health: player.getHealth()
    };
    var infoEnemies = [];
    var items = [];
    var crops = [];
    var maxScores = [];
    for (let e of enemies) {
        infoEnemies.push({
            x: e.x,
            y: e.y,
            layer: e.getImage().renderLayer,
            health: e.getHealth(),
            type: e.getImage().getSource().src
        });
    }
    for (let i of Inventory.instance.items) {
        items.push(i.item);
    }
    for (let f of FarmlandManager.instance.farmlands) {
        crops.push({
            id: FarmlandManager.instance.farmlands.indexOf(f),
            planted: f.planted,
            crop: f.currentCrop,
            fertilizer: f.fertilizerType,
            fertilizerStrength: f.fertilizerStrength,
            growthState: f.growthState,
            timeOfPlanting: f.timeOfPlanting,
            lastMillis: Date.now()
        });
    }
    localStorage.setItem("player", JSON.stringify(infoPlayer));
    localStorage.setItem("enemies", JSON.stringify(infoEnemies));
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("crops", JSON.stringify(crops));
}
export function loadWorldInfo() {
    var infoPlayer = JSON.parse(localStorage.getItem("player"));
    var infoEnemies = JSON.parse(localStorage.getItem("enemies"));
    var crops = JSON.parse(localStorage.getItem("crops"));
    var items = JSON.parse(localStorage.getItem("items"));
    if (player) {
        player.x = infoPlayer.x;
        player.y = infoPlayer.y;
        player.setHealth(infoPlayer.health);
    }
    for (let e of infoEnemies) {
        let enemy = new Enemy();
        enemy.x = e.x;
        enemy.y = e.y;
        enemy.setHealth(e.health);
        var aux = e.type.split('/');
        var jsonSrc = aux[aux.length - 1];
        enemy.setAnimation(e.layer, jsonSrc);
    }
    for (let c of crops) {
        let crop = FarmlandManager.instance.farmlands[c.id];
        crop.plantCrop(c.crop);
        crop.timeOfPlanting = c.timeOfPlanting + ((Date.now() - c.lastMillis) * 0.001);
        crop.growthState = c.growthState;
        crop.fertilize(c.fertilizer, c.fertilizerStrength);
    }
    for (let i of items) {
        Inventory.instance.addItem(i);
    }
}
//# sourceMappingURL=worldload.js.map