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
import Enemy from "./enemy.js";
import { CircleCollider } from "./collider.js";
var player;
var enemy;
var area;
var ctx;
window.onload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        var canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");
        GameLoop.initInstance();
        GraphicsRenderer.initInstance(ctx);
        player = new Player();
        enemy = new Enemy();
        player.x = 3328;
        player.y = 2304;
        enemy.x = 3528;
        enemy.y = 2304;
        player.setImage(0.5, yield FileLoader.loadImage("resources/sprites/front_sprite.png"));
        GraphicsRenderer.instance.addExistingEntity(player.getImage());
        var image = player.getImage();
        player.setCollider(new CircleCollider(0, 0, image.getWidth() * 0.6, true), {
            x: image.getWidth() * 0.5,
            y: image.getHeight() * 0.6
        });
        GraphicsRenderer.instance.follow(player.getImage());
        enemy.setImage(0.5, yield FileLoader.loadImage("resources/sprites/pharaoh.png"), 0, 0, 100, 150, 50, 75);
        GraphicsRenderer.instance.addExistingEntity(enemy.getImage());
        image = enemy.getImage();
        enemy.setCollider(new CircleCollider(0, 0, image.getWidth() * 0.6, true), {
            x: image.getWidth() * 0.5,
            y: image.getHeight() * 0.6
        });
        area = AreaMap.load("farmland.json", () => {
            area.getColliders().add(player.getCollider());
            area.getColliders().add(enemy.getCollider());
            enemy.setColliderLayer(area.getColliders());
            GameLoop.instance.start();
        });
        GameLoop.instance.suscribe(null, null, renderDebug, null, null);
    });
};
function renderDebug() {
    var scrollX = GraphicsRenderer.instance.scrollX;
    var scrollY = GraphicsRenderer.instance.scrollY;
    area.getColliders().render(ctx, scrollX, scrollY);
    player.renderDebug(ctx, scrollX, scrollY);
    enemy.renderDebug(ctx, scrollX, scrollY);
}
//# sourceMappingURL=main.js.map