import Player from "./player.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AreaMap from "./graphics/areamap.js";
import FileLoader from "./fileloader.js";
import GameLoop from "./gameloop.js";
import { BoxCollider, CircleCollider } from "./collider.js";
import { UILayout, UIEntity } from "./ui/uiEntity.js";
import Interface from "./ui/interface.js";

var player :Player;
var ctx :CanvasRenderingContext2D;

var uiLayout :UILayout;
var uiElement :UIEntity;
var uiElement2 :UIEntity;
var interf :Interface;

window.onload = function(){

    // TODO Adecentar todo esto cuando esté hecho el Game loop

    var canvas  :HTMLCanvasElement =  document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    GameLoop.initInstance();

    GraphicsRenderer.initInstance(ctx);

    player = new Player();

    player.x = 3328;
    player.y = 2304;

    uiElement2 = new UIEntity(128, 0, 128, 128, false);
    uiElement = new UIEntity(0, 0, 128, 128, true, (x :number, y :number)=>{
        
        uiElement2.getImage().visible = !uiElement2.getImage().visible;
    });
    interf = new Interface(canvas.width, canvas.height);
    interf.addCollider(uiElement.getCollider() as BoxCollider);
    interf.addCollider(uiElement2.getCollider() as BoxCollider);
    
    uiLayout = new UILayout(0, 0, 256, 128);
    
    uiLayout.addUIEntity(uiElement);
    uiLayout.addUIEntity(uiElement2);

    (async function() {

        uiElement.setImage(100, await FileLoader.loadImage("resources/sprites/interface/uiPlaceHolder.png"));
        uiElement2.setImage(100, await FileLoader.loadImage("resources/sprites/interface/uiPlaceHolder2.png"));
        uiLayout.addEntitiesToRenderer();
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

