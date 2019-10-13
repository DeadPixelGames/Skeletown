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
import { UILayout, UISquareEntity } from "./ui/uiEntity.js";
import Interface from "./ui/interface.js";
var player;
var ctx;
var uiLayout;
var uiElement;
var uiElement2;
var interf;
window.onload = function () {
    // TODO Adecentar todo esto cuando esté hecho el Game loop
    var canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    GameLoop.initInstance();
    GraphicsRenderer.initInstance(ctx);
    player = new Player();
    player.x = 3328;
    player.y = 2304;
    uiElement2 = new UISquareEntity(128, 0, 128, 128, false);
    uiElement = new UISquareEntity(0, 0, 128, 128, true, (x, y) => {
        uiElement2.getImage().visible = !uiElement2.getImage().visible;
    });
    interf = new Interface(canvas.width, canvas.height);
    interf.addCollider(uiElement.getCollider());
    interf.addCollider(uiElement2.getCollider());
    uiLayout = new UILayout(0, 0, 256, 128);
    uiLayout.addUIEntity(uiElement);
    uiLayout.addUIEntity(uiElement2);
    (function () {
        return __awaiter(this, void 0, void 0, function* () {
            uiElement.setImage(100, yield FileLoader.loadImage("resources/sprites/interface/uiPlaceHolder.png"));
            uiElement2.setImage(100, yield FileLoader.loadImage("resources/sprites/interface/uiPlaceHolder2.png"));
            uiLayout.addEntitiesToRenderer();
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