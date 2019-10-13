import Player from "./player.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AreaMap from "./graphics/areamap.js";
import FileLoader from "./fileloader.js";
import GameLoop from "./gameloop.js";
import { BoxCollider, CircleCollider } from "./collider.js";
import { UILayout, UISquareEntity, UICircleEntity, ProgressBar } from "./ui/uiEntity.js";
import Interface from "./ui/interface.js";

var player :Player;
var ctx :CanvasRenderingContext2D;

var hud_InGame :UILayout;
var lifeBar :ProgressBar;
var moneyCounter :UISquareEntity;
var time :UISquareEntity;
var inventory :UICircleEntity;


var resize = function(){
    ctx.canvas.width = document.documentElement.clientWidth * 0.95;
    ctx.canvas.height = document.documentElement.clientHeight * 0.95;
}

window.addEventListener("resize", resize);


window.onload = function(){

    // TODO Adecentar todo esto 

    var canvas  :HTMLCanvasElement =  document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    GameLoop.initInstance();

    GraphicsRenderer.initInstance(ctx);

    player = new Player();

    player.x = 3328;
    player.y = 2304;

    moneyCounter = new UISquareEntity(0.09, 0.03, 320, 91, true, (x :number, y :number)=>{

    });
    lifeBar = new ProgressBar(0.5, 0.03, 703, 128, true, (x :number, y :number)=>{
        lifeBar.setProgress(lifeBar.getProgress()-10);
    });
    time = new UISquareEntity(0.95, 0.03, 362, 128, false);
    inventory = new UICircleEntity(0.9, 0.8, 122, true, (x :number, y :number)=>{
        lifeBar.setProgress(lifeBar.getProgress()+10);
    })
    var interf = new Interface(canvas.width, canvas.height);
    interf.addCollider(lifeBar.getCollider() as BoxCollider);
    interf.addCollider(moneyCounter.getCollider() as BoxCollider);
    interf.addCollider(time.getCollider() as BoxCollider);
    interf.addCollider(inventory.getCollider() as CircleCollider);
    
    hud_InGame = new UILayout(0, 0, canvas.width, canvas.height);
    
    hud_InGame.addUIEntity(lifeBar);
    hud_InGame.addUIEntity(moneyCounter);
    hud_InGame.addUIEntity(time);
    hud_InGame.addUIEntity(inventory);

    moneyCounter.setText("1283902", {x: 30, y: 65});
    time.setText("10:21", {x: 30, y: 65});


    (async function() {

        lifeBar.setImage(99, await FileLoader.loadImage("resources/interface/HUD_life3.png"));
        lifeBar.setIcon(100, await FileLoader.loadImage("resources/interface/HUD_life1.png"));
        lifeBar.setProgressBar(100, await FileLoader.loadImage("resources/interface/HUD_life2.png"));
        moneyCounter.setImage(100, await FileLoader.loadImage("resources/interface/HUD_money.png"));
        time.setImage(100, await FileLoader.loadImage("resources/interface/HUD_time.png"));
        inventory.setImage(100, await FileLoader.loadImage("resources/interface/HUD_inventory.png"));
        hud_InGame.addEntitiesToRenderer();
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

