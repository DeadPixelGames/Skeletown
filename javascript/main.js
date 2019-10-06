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
import { CircleCollider } from "./collider.js";
var player;
var ctx;
window.onload = function () {
    // TODO Adecentar todo esto cuando esté hecho el Game loop
    var canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    GraphicsRenderer.initInstance(ctx);
    player = new Player(canvas, ctx);
    player.x = 3328;
    player.y = 2304;
    (function () {
        return __awaiter(this, void 0, void 0, function* () {
            player.setImage(0.5, yield FileLoader.loadImage("resources/sprites/front_sprite.png"));
            GraphicsRenderer.instance.addExistingEntity(player.getImage());
            var image = player.getImage();
            player.setCollider(new CircleCollider(0, 0, image.getWidth() * 0.8, true), {
                x: image.getWidth() * 0.5,
                y: image.getHeight() * 0.6
            });
            var area = AreaMap.load("farmland.json", () => {
                area.getColliders().add(player.getCollider());
                mainGameLoop(area, canvas);
            });
        });
    })();
};
/**
 * Main game loop
 */
function mainGameLoop(area, canvas) {
    setInterval(() => {
        //Actualización y renderización del jugador
        if (player) {
            player.update();
            GraphicsRenderer.instance.scrollX = player.x - canvas.width * 0.5;
            GraphicsRenderer.instance.scrollY = player.y - canvas.width * 0.5;
            GraphicsRenderer.instance.render();
            area.getColliders().checkCollisions();
            // area.getColliders().render(ctx, GraphicsRenderer.instance.scrollX, GraphicsRenderer.instance.scrollY);
        }
    }, 50);
}
//# sourceMappingURL=main.js.map