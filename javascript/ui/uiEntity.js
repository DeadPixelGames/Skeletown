import Entity from "../entity.js";
import { BoxCollider } from "../collider.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import GraphicEntity from "../graphics/graphicentity.js";
/**
 * Unidad mínima de interfaz de usuario
 */
export class UIEntity extends Entity {
    constructor(left, top, w, h, clickable, onClick) {
        super();
        this.clickable = clickable;
        this.relativePos = { x: left, y: top };
        this.setCollider(new BoxCollider(left, top, w, h, false));
        var collider = this.getCollider();
        if (collider && this.clickable && onClick) {
            console.log("OwO");
            collider.addUserInteraction(this, onClick, null, null);
        }
    }
    //#region GETTERS Y SETTERS
    setRealtivePos(relativePos) {
        this.relativePos = relativePos;
    }
    getRelativePos() { return this.relativePos; }
    //#endregion
    setImage(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        this.image = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        this.syncImage();
    }
}
export class UILayout {
    constructor(x, y, w, h) {
        this.uiEntities = [];
        this.position = { x: x, y: y };
        this.dimension = { w: w, h: h };
    }
    addUIEntity(uiEntity) {
        uiEntity.x = this.position.x + uiEntity.getRelativePos().x;
        uiEntity.y = this.position.y + uiEntity.getRelativePos().y;
        this.uiEntities.push(uiEntity);
    }
    addEntitiesToRenderer() {
        for (let ent of this.uiEntities) {
            GraphicsRenderer.instance.addExistingEntity(ent.getImage());
        }
    }
}
class UIGraphicEntity extends GraphicEntity {
    constructor(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        super(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
    }
    render(context) {
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h, this.x, this.y, this.section.w, this.section.h);
    }
}
//# sourceMappingURL=uiEntity.js.map