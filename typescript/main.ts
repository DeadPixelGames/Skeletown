import Player from "./player.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AreaMap, { TileEntity } from "./graphics/areamap.js";
import FileLoader from "./fileloader.js";
import GameLoop from "./gameloop.js";

import { BoxCollider, CircleCollider } from "./collider.js";
import { UILayout, UIEntity, ProgressBar } from "./ui/uiEntity.js";
import Interface, { InterfaceInWorld } from "./ui/interface.js";

import Enemy from "./enemy.js";

import { distance } from "./util.js";

import { Inventory } from "./inventory.js";
import { FarmlandManager } from "./farmland.js";

import AudioManager from "./audiomanager.js";
import { Hud } from "./ui/hud.js";

export const STANDARD_SCREEN_SIZE_X = 1366;

export const STANDARD_SCREEN_SIZE_Y = 768;

//#region Declaración de variables
var player :Player;
var enemy :Enemy | null;
var area :AreaMap;
var ctx :CanvasRenderingContext2D;

//#endregion

var oldscaleX = 1;
var oldscaleY = 1;

var resize = function() {
    var ratio = STANDARD_SCREEN_SIZE_X / STANDARD_SCREEN_SIZE_Y;
    var currentRatio = document.documentElement.clientWidth / document.documentElement.clientHeight ;
    if(currentRatio > ratio){
        ctx.canvas.height = document.documentElement.clientHeight * 0.95;
        ctx.canvas.width = ctx.canvas.height * ratio;
    }else{
        ctx.canvas.width = document.documentElement.clientWidth * 0.95;
        ctx.canvas.height = ctx.canvas.width * STANDARD_SCREEN_SIZE_Y / STANDARD_SCREEN_SIZE_X;
    }
    if(GraphicsRenderer.instance) {
        GraphicsRenderer.instance.scaleX = ctx.canvas.width / STANDARD_SCREEN_SIZE_X;
        GraphicsRenderer.instance.scaleY = ctx.canvas.height / STANDARD_SCREEN_SIZE_Y;
    }
    ctx.scale(GraphicsRenderer.instance.scaleX, GraphicsRenderer.instance.scaleY);
    oldscaleX = GraphicsRenderer.instance.scaleX;
    oldscaleY = GraphicsRenderer.instance.scaleY;
    Hud.instance.resize(ctx.canvas.width, ctx.canvas.height);
    Inventory.instance.resize(ctx.canvas.width, ctx.canvas.height);
}

window.addEventListener("resize", resize);

window.onload = async function() {

  //TODO Adecentar esto
    var canvas :HTMLCanvasElement = document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    canvas.width = STANDARD_SCREEN_SIZE_X;
    canvas.height = STANDARD_SCREEN_SIZE_Y;

    GameLoop.initInstance();

    GraphicsRenderer.initInstance(ctx);

    Inventory.initInstance();

    InterfaceInWorld.initInstance();

    Hud.initInstance(ctx);

    (window as any).gr = GraphicsRenderer.instance;


    //#region Jugador
    player = new Player();   

    player.x = 1200;
    player.y = 1280; 
    
    (window as any).player = player;

    //// player.setImage(2.5, await FileLoader.loadImage("resources/sprites/front_sprite.png"), 0, 0, 128, 256, 64, 128);
    await player.setAnimation(2.5, "skeleton.json");
    var image = player.getImage();
    if(image){
        GraphicsRenderer.instance.addExistingEntity(image);
        player.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.9, image.getWidth() * 0.9, true),
        {
            x: 0,
            y: image.getHeight() * 0.3
        });
    }
    
    GraphicsRenderer.instance.follow(player.getImage());

    player.suscribe(Hud.instance.lifeBar, (health :number, maxHealth :number) => {
        Hud.instance.lifeBar.setProgress(health * 100 / maxHealth);
    }, () => console.log("Game Over :("));
    //#endregion


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


    //#region Área
    area = AreaMap.load("farmland2.json", () => {
        if(enemy){
            area.getColliders().add(player.getCollider() as BoxCollider);
            GameLoop.instance.start();
        }
        
    });
    //#endregion
    
    enemy = await generateEnemy(() => {
        if(enemy) {
            enemy.dispose();
            console.log("Enemy: :(");
        }
        enemy = null;
    });
    GameLoop.instance.suscribe(null, null, renderDebug, null, null);

    resize();
};

//#region Generar AudioContext
function generateAudioContext() {
    if(!AudioManager.instance) {
        AudioManager.initInstance();
    }
    AudioManager.instance.activateContext();
    (window as any).audiomanager = AudioManager.instance;
}

window.addEventListener("mouseover", generateAudioContext);
window.addEventListener("touchstart", generateAudioContext);
//#endregion

//#region Crear enemigo
async function generateEnemy(onDead :() => void) {
    var enemy = new Enemy();
    enemy.x = 2176;
    enemy.y = 1280;
    
    enemy.setImage(2.5, await FileLoader.loadImage("animation/Enemy_Placeholder/enemy0.png"), 0, 0, 133, 128, 66, 54);
    
    var image = enemy.getImage();
    if(image) {
        GraphicsRenderer.instance.addExistingEntity(image);
        
        enemy.setCollider(new BoxCollider(0, 0, image.getWidth() * 0.6, image.getWidth() * 0.6, true),
        {
            x: 0,
            y: image.getHeight() * 0.3
        });  
    }
    
    enemy.setAttack(target => {
        target.setHealth(target.getHealth()-10);
        console.log(target.constructor.name + ": \"ouch\"");
    });
    (enemy.getCollider() as BoxCollider).addUserInteraction(null, attackEnemy, null, null);

    enemy.suscribe(enemy, null, onDead);

    area.getColliders().add(enemy.getCollider() as BoxCollider);
    enemy.setColliderLayer(area.getColliders());
    return enemy;
}
//#endregion

//#region Atacar enemigo
document.addEventListener("mousedown", dispatchClickEventToColliders);
document.addEventListener("touchstart", dispatchClickEventToColliders);

function dispatchClickEventToColliders(event :MouseEvent | TouchEvent) {
    var coordX :number;
    var coordY :number;

    if(window.TouchEvent && event instanceof TouchEvent && event.touches[0]) {
        coordX = event.touches[0].clientX;
        coordY = event.touches[0].clientY;
    } else {
        coordX = (event as MouseEvent).clientX;
        coordY = (event as MouseEvent).clientY;
    }

    if(area) {
        area.getColliders().sendUserClick(coordX / GraphicsRenderer.instance.scaleX + GraphicsRenderer.instance.scrollX, coordY / GraphicsRenderer.instance.scaleY + GraphicsRenderer.instance.scrollY);
    }
}

function attackEnemy() {
    const ATTACK_RADIUS = 200;

    if(enemy)
    if(distance(player.x, player.y, enemy.x, enemy.y) < ATTACK_RADIUS) {
        enemy.setHealth(enemy.getHealth() - 10);
        console.log("Enemy: ouch");
    }

}
//#endregion

//#region Render Debug
var enableRenderDebug = false;

document.addEventListener("keydown", async (event) => {
    if(event.key == "F2") {
        enableRenderDebug = !enableRenderDebug;
    }else if(event.key == "e"){
        if(!enemy){
            enemy = await generateEnemy(() => {
                if(enemy) {
                    enemy.dispose();
                    console.log("Enemy: :(");
                }
                enemy = null;
            });
        }
            
    }else if(event.key == "h"){
        player.setHealth(100);
    }
});

function renderDebug() {
    if(!enableRenderDebug) {
        return;
    }

    var scrollX = GraphicsRenderer.instance.scrollX;
    var scrollY = GraphicsRenderer.instance.scrollY;
    var scaleX = GraphicsRenderer.instance.scaleX;
    var scaleY = GraphicsRenderer.instance.scaleY;

    ctx.lineWidth = 1;

    area.getColliders().render(ctx, scrollX, scrollY, scaleX, scaleY);

    ctx.scale(scaleX, scaleY);
    player.renderDebug(ctx, scrollX, scrollY);
    if(enemy) {
        enemy.renderDebug(ctx, scrollX, scrollY);
    }
        Interface.instance.getColliders().render(ctx);
        InterfaceInWorld.instance.getColliders().render(ctx, scrollX, scrollY, scaleX, scaleY);
    ctx.scale(1 / scaleX, 1 / scaleY);
}
//#endregion

//#region Inventario
export function enteringInventory(){
    Inventory.instance.activate();
    Inventory.instance.show();
    Hud.instance.deactivate();
    FarmlandManager.instance.deactivate();
}

export function exitingInventory(){
    Inventory.instance.deactivate();
    Inventory.instance.hide();
    Hud.instance.activate();
    FarmlandManager.instance.activate();
}

export function enteringInventoryFromCrops(tile :TileEntity){
    Inventory.instance.togglePlanting(tile);
    Inventory.instance.show();
    Hud.instance.deactivate();
    FarmlandManager.instance.deactivate();
}
//#endregion