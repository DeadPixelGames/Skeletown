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



import AnimatedGraphicEntity from "./graphics/animatedgraphicentity.js";

//#region Declaración de variables
var player :Player;
var enemy :Enemy | null;
var area :AreaMap;
var ctx :CanvasRenderingContext2D;

export var hud_InGame :UILayout;
var lifeBar :ProgressBar;
var moneyCounter :UIEntity;
var time :UIEntity;
var inventory :UIEntity;
//#endregion


var resize = function() {
    ctx.canvas.width = document.documentElement.clientWidth * 0.95;
    ctx.canvas.height = document.documentElement.clientHeight * 0.95;
    hud_InGame.resize(ctx.canvas.width, ctx.canvas.height);
    Inventory.instance.resize(ctx.canvas.width, ctx.canvas.height);
}

window.addEventListener("resize", resize);

window.onload = async function() {

    

  //TODO Adecentar esto
    var canvas :HTMLCanvasElement = document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    GameLoop.initInstance();

    GraphicsRenderer.initInstance(ctx);

    Inventory.initInstance();

    InterfaceInWorld.initInstance();

    //#region Animación de prueba del esqueleto
    //// var anim = await AnimatedGraphicEntity.load("skeleton.json");
    //// 
    //// anim.renderLayer = 2.5;
    //// anim.x = 1200;
    //// anim.y = 1280;
    //// anim.play("walkright");
    //// 
    //// (window as any)["anim"] = anim;
    //// 
    //// GraphicsRenderer.instance.addExistingEntity(anim);
    //#endregion


    //#region Interfaz
    moneyCounter = new UIEntity(true)
    moneyCounter.setCollider(true, 0.12, 0.03, 320, 91, (x :number, y :number)=>{

    });
    lifeBar = new ProgressBar(0.5, 0.03, 703, 128, true, (x :number, y :number)=>{
        lifeBar.setProgress(lifeBar.getProgress()-10);
    });
    time = new UIEntity(false);
    time.setCollider(true, 0.95, 0.03, 362, 128);
    inventory = new UIEntity(true);
    inventory.setCollider(false, 0.87, 0.7, 245, 245,(x :number, y :number)=>{
        enteringInventory();
        lifeBar.setProgress(lifeBar.getProgress()+10);
    })
    
    Interface.instance.addCollider(lifeBar.getCollider() as BoxCollider);
    Interface.instance.addCollider(moneyCounter.getCollider() as BoxCollider);
    Interface.instance.addCollider(time.getCollider() as BoxCollider);
    Interface.instance.addCollider(inventory.getCollider() as CircleCollider);
    
    hud_InGame = new UILayout(0, 0, canvas.width, canvas.height);
    
    hud_InGame.addUIEntity(lifeBar);
    hud_InGame.addUIEntity(moneyCounter);
    hud_InGame.addUIEntity(time);
    hud_InGame.addUIEntity(inventory);



    lifeBar.setImage(true, 99, await FileLoader.loadImage("resources/interface/HUD_life3.png"), 0, 0, 768, 91, 768, 91);
    lifeBar.setIcon(true, 100, await FileLoader.loadImage("resources/interface/HUD_life1.png"), 0, 0, 768, 91, 768, 91);
    lifeBar.setProgressBar(true, 100, await FileLoader.loadImage("resources/interface/HUD_life2.png"), 0, 0, 768, 91, 768, 91);
    moneyCounter.setImage(true, 100, await FileLoader.loadImage("resources/interface/HUD_money.png"));
    time.setImage(true, 100, await FileLoader.loadImage("resources/interface/HUD_time.png"));
    inventory.setImage(true, 100, await FileLoader.loadImage("resources/interface/HUD_inventory.png"));
    inventory.image.getSource().width = 300;
    hud_InGame.addEntitiesToRenderer();    
    moneyCounter.setText("1283902", {x: 250, y: 65}, "45px");
    time.setText("10:21", {x: 145, y: 80}, "45px");
    //#endregion
 
    //#region Jugador
    player = new Player();   

    player.x = 1200;
    player.y = 1280; 
    
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

    player.suscribe(lifeBar, (health :number, maxHealth :number) => {
        lifeBar.setProgress(health * 100 / maxHealth);
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
};

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
        area.getColliders().sendUserClick(coordX + GraphicsRenderer.instance.scrollX, coordY + GraphicsRenderer.instance.scrollY);
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
    ctx.lineWidth = 1;
    area.getColliders().render(ctx, scrollX, scrollY);
    player.renderDebug(ctx, scrollX, scrollY);
    if(enemy) {
        enemy.renderDebug(ctx, scrollX, scrollY);
    }
    Interface.instance.getColliders().render(ctx);
    InterfaceInWorld.instance.getColliders().render(ctx, scrollX, scrollY);
}
//#endregion


export function enteringInventory(){
    Inventory.instance.activate();
    Inventory.instance.show();
    hud_InGame.deactivate();
    FarmlandManager.instance.deactivate();
}

export function exitingInventory(){
    Inventory.instance.deactivate();
    Inventory.instance.hide();
    hud_InGame.activate();
    FarmlandManager.instance.activate();
}

export function enteringInventoryFromCrops(tile :TileEntity){
    Inventory.instance.togglePlanting(tile);
    Inventory.instance.show();
    hud_InGame.deactivate();
    FarmlandManager.instance.deactivate();
}