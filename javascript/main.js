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
import { CircleCollider } from "./collider.js";
import { UILayout, UISquareEntity, UICircleEntity, ProgressBar } from "./ui/uiEntity.js";
import Interface from "./ui/interface.js";
var player;
var ctx;
var hud_InGame;
var lifeBar;
var moneyCounter;
var time;
var inventory;
var resize = function () {
    ctx.canvas.width = document.documentElement.clientWidth * 0.95;
    ctx.canvas.height = document.documentElement.clientHeight * 0.95;
};
window.addEventListener("resize", resize);
window.onload = function () {
    // TODO Adecentar todo esto 
    var canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    GameLoop.initInstance();
    GraphicsRenderer.initInstance(ctx);
    player = new Player();
    player.x = 3328;
    player.y = 2304;
    moneyCounter = new UISquareEntity(0.09, 0.03, 320, 91, true, (x, y) => {
    });
    lifeBar = new ProgressBar(0.5, 0.03, 703, 128, true, (x, y) => {
        lifeBar.setProgress(lifeBar.getProgress() - 10);
    });
    time = new UISquareEntity(0.95, 0.03, 362, 128, false);
    inventory = new UICircleEntity(0.9, 0.8, 122, true, (x, y) => {
        lifeBar.setProgress(lifeBar.getProgress() + 10);
    });
    var interf = new Interface(canvas.width, canvas.height);
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
    (function () {
        return __awaiter(this, void 0, void 0, function* () {
            lifeBar.setImage(99, yield FileLoader.loadImage("resources/interface/HUD_life3.png"));
            lifeBar.setIcon(100, yield FileLoader.loadImage("resources/interface/HUD_life1.png"));
            lifeBar.setProgressBar(100, yield FileLoader.loadImage("resources/interface/HUD_life2.png"));
            moneyCounter.setImage(100, yield FileLoader.loadImage("resources/interface/HUD_money.png"));
            time.setImage(100, yield FileLoader.loadImage("resources/interface/HUD_time.png"));
            inventory.setImage(100, yield FileLoader.loadImage("resources/interface/HUD_inventory.png"));
            hud_InGame.addEntitiesToRenderer();
            player.setImage(0.5, yield FileLoader.loadImage("resources/sprites/front_sprite.png"));
            GraphicsRenderer.instance.addExistingEntity(player.getImage());
            var image = player.getImage();
            player.setCollider(new CircleCollider(0, 0, image.getWidth() * 0.8, true), {
                x: image.getWidth() * 0.5,
                y: image.getHeight() * 0.6
            });
            GraphicsRenderer.instance.follow(player.getImage());
            var area = AreaMap.load("farmland.json", () => {
                area.getColliders().add(player.getCollider());
                GameLoop.instance.start();
            });
        });
    })();
};
//# sourceMappingURL=main.js.map