import Entity from "../entity.js";
import { BoxCollider, CircleCollider } from "../collider.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import GraphicEntity from "../graphics/graphicentity.js";
/**
 * Unidad mínima de interfaz de usuario Cuadrada
 */
export class UIEntity extends Entity {
    constructor(clickable) {
        super();
        this.clickable = clickable;
        GraphicsRenderer.instance.suscribe(this, null, this.drawText);
    }
    //#region GETTERS Y SETTERS
    getRelativePos() { return this.relativePos; }
    getText() { return this.text; }
    setRealtivePos(relativePos) {
        this.relativePos = relativePos;
    }
    setText(text, textPos) { this.text = text; this.textPos = textPos; }
    //#endregion
    /**Sobreescribir el setImage de Entity para usar UIGraphicEtity y no una GraphicEntity */
    setImage(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        this.image = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
    }
    addToGraphicRenderer() {
        var img = this.getImage();
        if (img)
            GraphicsRenderer.instance.addExistingEntity(img);
    }
    drawText() {
        if (this.text && this.textPos) {
            this.ctx.font = "45px Arco Black";
            this.ctx.fillStyle = "#000000";
            this.ctx.fillText(this.text, this.x + this.textPos.x, this.y + this.textPos.y);
        }
    }
}
export class UISquareEntity extends UIEntity {
    constructor(left, top, w, h, clickable, onClick) {
        super(clickable);
        this.relativePos = { x: left, y: top };
        this.dimension = { w: w, h: h };
        this.setCollider(new BoxCollider(left, top, w, h, false));
        var collider = this.getCollider();
        /**Añadir al collider de la entidad la función que se activará con el evento onClick */
        if (collider && this.clickable && onClick) {
            collider.addUserInteraction(this, onClick, null, null);
        }
    }
}
export class UICircleEntity extends UIEntity {
    constructor(centerX, centerY, radius, clickable, onClick) {
        super(clickable);
        this.relativePos = { x: centerX, y: centerY };
        this.setCollider(new CircleCollider(centerX, centerY, radius, false));
        var collider = this.getCollider();
        if (collider && this.clickable && onClick) {
            collider.addUserInteraction(this, onClick, null, null);
        }
        this.dimension = { w: radius, h: radius };
    }
}
export class ProgressBar extends UISquareEntity {
    constructor(left, top, w, h, clickable, onClick) {
        super(left, top, w, h, clickable, onClick);
        this.progress = 100;
    }
    //#region GETTERS Y SETTERS
    getProgressBar() { return this.progressBar; }
    getIcon() { return this.icon; }
    getProgress() { return this.progress; }
    setProgressBar(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        this.progressBar = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
    }
    setIcon(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        this.icon = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
    }
    setProgress(progress) {
        this.progress = progress;
        this.progressBar.setSection(this.relativePos.x, this.relativePos.y, Math.max(1, (progress * this.dimension.w) * 0.01), this.dimension.h);
    }
    //#endregion
    addToGraphicRenderer() {
        var img = this.getImage();
        if (img)
            GraphicsRenderer.instance.addExistingEntity(img);
        GraphicsRenderer.instance.addExistingEntity(this.getProgressBar());
        GraphicsRenderer.instance.addExistingEntity(this.getIcon());
    }
    syncImage() {
        if (this.image) {
            this.image.x = this.x;
            this.image.y = this.y;
        }
        this.progressBar.x = this.x;
        this.progressBar.y = this.y;
        this.icon.x = this.x;
        this.icon.y = this.y;
    }
}
/**Contenedor de entidades de layout */
export class UILayout {
    constructor(x, y, w, h) {
        this.uiEntities = [];
        this.position = { x: x, y: y };
        this.dimension = { w: w, h: h };
    }
    /**Añade una entidad de interfaz al layout
     * Cambia las coordenadas de la entidad según las coordenadas del layout
     */
    addUIEntity(uiEntity) {
        uiEntity.x = this.position.x + uiEntity.getRelativePos().x * this.dimension.w - uiEntity.dimension.w * 0.5;
        uiEntity.y = this.position.y + uiEntity.getRelativePos().y * this.dimension.h;
        this.uiEntities.push(uiEntity);
    }
    /**Añade al GraphicsRenderer todas las imágenes de las entidades de interfaz */
    addEntitiesToRenderer() {
        for (let ent of this.uiEntities) {
            ent.addToGraphicRenderer();
        }
    }
    resize(w, h) {
        this.dimension = { w: w, h: h };
        for (let ent of this.uiEntities) {
            ent.x = this.position.x + ent.getRelativePos().x * this.dimension.w - ent.dimension.w * 0.5;
            ent.y = this.position.y + ent.getRelativePos().y * this.dimension.h;
        }
    }
}
/**Hereda de GraphicEntity cambia el método render */
class UIGraphicEntity extends GraphicEntity {
    constructor(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        super(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
    }
    /**Deja las coordenadas de la cámara (no tiene en cuenta el scroll) */
    render(context) {
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h, this.x, this.y, this.section.w, this.section.h);
    }
}
//# sourceMappingURL=uiEntity.js.map