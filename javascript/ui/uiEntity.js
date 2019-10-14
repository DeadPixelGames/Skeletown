import { BoxCollider, CircleCollider } from "../collider.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import GraphicEntity from "../graphics/graphicentity.js";
import GameLoop from "../gameloop.js";
/**
 * Unidad mínima de interfaz de usuario Cuadrada
 */
export class UIEntity {
    constructor(clickable) {
        this.clickable = clickable;
        this.ctx = GraphicsRenderer.instance.getCanvasContext();
        GraphicsRenderer.instance.suscribe(this, null, this.drawText);
        GameLoop.instance.suscribe(this, null, this.update, null, null);
        this.colliderOffset = { x: 0, y: 0 };
    }
    //#region GETTERS Y SETTERS
    getRelativePos() { return this.relativePos; }
    getText() { return this.text; }
    getCollider() { return this.collider; }
    setRealtivePos(relativePos) {
        this.relativePos = relativePos;
    }
    setText(text, textPos) { this.text = text; this.textPos = textPos; }
    setCollider(collider) {
        this.collider = collider;
    }
    //#endregion
    /**Sobreescribir el setImage de Entity para usar UIGraphicEtity y no una GraphicEntity */
    setImage(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        this.image = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
    }
    addToGraphicRenderer() {
        if (this.image)
            GraphicsRenderer.instance.addExistingEntity(this.image);
    }
    drawText() {
        if (this.text && this.textPos) {
            this.ctx.font = "45px Arco Black";
            this.ctx.fillStyle = "#000000";
            this.ctx.fillText(this.text, this.x + this.textPos.x, this.y + this.textPos.y);
        }
    }
    hide() {
        if (this.image)
            this.image.visible = false;
    }
    show() {
        if (this.image)
            this.image.visible = true;
    }
    syncCollider() {
        if (this.collider && this.colliderOffset) {
            this.collider.centerX = this.x + this.colliderOffset.x;
            this.collider.centerY = this.y + this.colliderOffset.y;
        }
    }
    syncImage() {
        if (this.image) {
            this.image.x = this.x;
            this.image.y = this.y;
        }
    }
    update(deltaTime) {
        this.syncCollider();
        this.syncImage();
    }
}
export class UISquareEntity extends UIEntity {
    constructor(left, top, w, h, clickable, onClick) {
        super(clickable);
        this.relativePos = { x: left, y: top };
        this.dimension = { w: w, h: h };
        this.setCollider(new BoxCollider(left, top, w, h, false));
        if (this.colliderOffset)
            this.colliderOffset = { x: w * 0.5, y: h * 0.5 };
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
        if (this.colliderOffset)
            this.colliderOffset = { x: radius, y: radius };
        var collider = this.getCollider();
        if (collider && this.clickable && onClick) {
            collider.addUserInteraction(this, onClick, null, null);
        }
        this.dimension = { w: radius * 2, h: radius * 2 };
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
        this.progressBar.setSection(this.relativePos.x, this.relativePos.y, (progress * this.dimension.w) * 0.01, this.dimension.h);
    }
    //#endregion
    addToGraphicRenderer() {
        if (this.image)
            GraphicsRenderer.instance.addExistingEntity(this.image);
        GraphicsRenderer.instance.addExistingEntity(this.getProgressBar());
        GraphicsRenderer.instance.addExistingEntity(this.getIcon());
    }
    syncImage() {
        this.image.x = this.x;
        this.image.y = this.y;
        this.progressBar.x = this.x;
        this.progressBar.y = this.y;
        this.icon.x = this.x;
        this.icon.y = this.y;
    }
    hide() {
        if (this.image)
            this.image.visible = false;
        this.progressBar.visible = false;
        this.icon.visible = false;
    }
    show() {
        if (this.image)
            this.image.visible = true;
        this.progressBar.visible = true;
        this.icon.visible = true;
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
    hide() {
        for (let ent of this.uiEntities) {
            ent.hide();
        }
    }
    show() {
        for (let ent of this.uiEntities) {
            ent.show();
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