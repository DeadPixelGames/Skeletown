import Player from "./player.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AreaMap, { TileEntity } from "./graphics/areamap.js";
import FileLoader from "./fileloader.js";
import GameLoop from "./gameloop.js";

import { BoxCollider, CircleCollider } from "./collider.js";
import Interface, { InterfaceInWorld } from "./ui/interface.js";

import Enemy from "./enemy.js";

import { distance, sleep } from "./util.js";

import { Inventory } from "./inventory.js";
import { FarmlandManager } from "./farmland.js";

import AudioManager from "./audiomanager.js";
import { Hud } from "./ui/hud.js";

import { MainMenu } from "./ui/mainmenu.js";
import { MaxScore } from "./ui/maxscores.js";
import { GameOver } from "./ui/gameover.js";


const STANDARD_SCREEN_SIZE_X = 1920;

const STANDARD_SCREEN_SIZE_Y = 1080;


//#region Declaración de variables
var ctx :CanvasRenderingContext2D;

//#endregion

//#region Rescalamiento
var originalWidth = document.documentElement.clientWidth;
var originalHeight = document.documentElement.clientHeight;
var originalRatio = originalWidth / originalHeight;
var ratio = STANDARD_SCREEN_SIZE_X / STANDARD_SCREEN_SIZE_Y;
//// console.log(originalWidth, originalHeight);

var resize = function() {
    
    var currentWidth = document.documentElement.clientWidth;
    var currentHeight = document.documentElement.clientHeight;
    var currentRatio = document.documentElement.clientWidth / document.documentElement.clientHeight;

    //// var myScale = (originalHeight * STANDARD_SCREEN_SIZE_X) / (originalWidth * STANDARD_SCREEN_SIZE_Y);
    ctx.canvas.style.transformOrigin = "top left";

    //// ctx.canvas.style.transform = "scale("+ Math.min(currentHeight  * STANDARD_SCREEN_SIZE_Y / originalHeight, currentWidth * STANDARD_SCREEN_SIZE_X / originalWidth) + ")";

    if(currentRatio > ratio){
        ctx.canvas.style.transform = "scale("+ currentHeight / STANDARD_SCREEN_SIZE_Y + ")";
        GraphicsRenderer.instance.scaleX = currentHeight / STANDARD_SCREEN_SIZE_Y;
        GraphicsRenderer.instance.scaleY = currentHeight / STANDARD_SCREEN_SIZE_Y;
    }else{
        ctx.canvas.style.transform = "scale("+ currentWidth / STANDARD_SCREEN_SIZE_X + ")";
        GraphicsRenderer.instance.scaleX = currentWidth / STANDARD_SCREEN_SIZE_X;
        GraphicsRenderer.instance.scaleY = currentWidth / STANDARD_SCREEN_SIZE_X;
    }
  
    Hud.instance.resize(ctx.canvas.width, ctx.canvas.height);
    Inventory.instance.resize(ctx.canvas.width, ctx.canvas.height);
    MainMenu.instance.resize(ctx.canvas.width, ctx.canvas.height);
    MaxScore.instance.resize(ctx.canvas.width, ctx.canvas.height);
    GameOver.instance.resize(ctx.canvas.width, ctx.canvas.height);
    /*if((currentWidth / currentHeight) > (originalWidth / originalHeight)) {
        ctx.canvas.style.transform = "scale(" + (currentHeight / originalHeight) + ")";
    } else {
        ctx.canvas.style.transform = "scale(" + (currentWidth / originalWidth)  + ")";
    }*/
    //// GraphicsRenderer.instance.scaleX = currentHeight / STANDARD_SCREEN_SIZE_Y;
    //// GraphicsRenderer.instance.scaleY = (currentHeight / originalHeight) * myScale;

    //// if(currentRatio > ratio){
    ////     ctx.canvas.height = document.documentElement.clientHeight * 0.95;
    ////     ctx.canvas.width = ctx.canvas.height * ratio;
    //// }else{
    ////     ctx.canvas.width = document.documentElement.clientWidth * 0.95;
    ////     ctx.canvas.height = ctx.canvas.width * STANDARD_SCREEN_SIZE_Y / STANDARD_SCREEN_SIZE_X;
    //// }
    //// if(GraphicsRenderer.instance) {
    ////     GraphicsRenderer.instance.scaleX = 1; /* ctx.canvas.width / STANDARD_SCREEN_SIZE_X */;
    ////     GraphicsRenderer.instance.scaleY = 1; /* ctx.canvas.height / STANDARD_SCREEN_SIZE_Y; */
    //// }
    //// ctx.scale(GraphicsRenderer.instance.scaleX, GraphicsRenderer.instance.scaleY);
    //// oldscaleX = GraphicsRenderer.instance.scaleX;
    //// oldscaleY = GraphicsRenderer.instance.scaleY;
    //// Hud.instance.resize(ctx.canvas.width, ctx.canvas.height);
    //// Inventory.instance.resize(ctx.canvas.width, ctx.canvas.height);
}

window.addEventListener("resize", resize);

window.onload = async function() {

    //#region Inicialización
    var canvas :HTMLCanvasElement = document.getElementById("gameCanvas") as HTMLCanvasElement;

    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    
    canvas.width = STANDARD_SCREEN_SIZE_X;
    canvas.height = STANDARD_SCREEN_SIZE_Y;

    GameLoop.initInstance();

    GraphicsRenderer.initInstance(ctx);

    Inventory.initInstance(STANDARD_SCREEN_SIZE_X, STANDARD_SCREEN_SIZE_Y);

    InterfaceInWorld.initInstance();

    MainMenu.initInstance(ctx, STANDARD_SCREEN_SIZE_X, STANDARD_SCREEN_SIZE_Y);

    MaxScore.initInstance(ctx, STANDARD_SCREEN_SIZE_X, STANDARD_SCREEN_SIZE_Y);

    GameOver.initInstance(ctx, STANDARD_SCREEN_SIZE_X, STANDARD_SCREEN_SIZE_Y);

    Hud.initInstance(ctx, STANDARD_SCREEN_SIZE_X, STANDARD_SCREEN_SIZE_Y);
    //#endregion
    
    GameLoop.instance.start();

    resize();

};

