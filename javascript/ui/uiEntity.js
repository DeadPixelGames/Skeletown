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
        this.percentRelPos = true;
    }
    //#region GETTERS Y SETTERS
    getRelativePos() { return this.relativePos; }
    getText() { return this.text; }
    getCollider() { return this.collider; }
    getPercentRelPos() { return this.percentRelPos; }
    setRealtivePos(relativePos) {
        this.relativePos = relativePos;
    }
    setText(text, textPos) { this.text = text; this.textPos = textPos; }
    /**Sobreescribir el setImage de Entity para usar UIGraphicEtity y no una GraphicEntity */
    setImage(useCanvasCoords, layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        if (useCanvasCoords) {
            this.image = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }
        else {
            this.image = new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }
    }
    setPercentRelPos(percentRelPos) {
        this.percentRelPos = percentRelPos;
    }
    //#endregion
    addToGraphicRenderer() {
        if (this.image)
            GraphicsRenderer.instance.addExistingEntity(this.image);
    }
    drawText() {
        if (this.text && this.textPos) {
            this.ctx.font = "45px yumaro";
            this.ctx.textAlign = "end";
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 5;
            this.ctx.strokeText(this.text, this.x + this.textPos.x, this.y + this.textPos.y);
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
    setCollider(square, left, top, w, h, onClick) {
        this.relativePos = { x: left, y: top };
        this.dimension = { w: w, h: h };
        if (square) {
            this.collider = new BoxCollider(left, top, w, h, false);
        }
        else {
            this.collider = new CircleCollider(left, top, w * 0.5, false);
        }
        this.colliderOffset = { x: w * 0.5, y: h * 0.5 };
        if (this.clickable && onClick) {
            this.collider.addUserInteraction(this, onClick, null, null);
        }
    }
}
export class ProgressBar extends UIEntity {
    constructor(left, top, w, h, clickable, onClick) {
        super(clickable);
        this.setCollider(true, left, top, w, h, onClick);
        this.progress = 100;
    }
    //#region GETTERS Y SETTERS
    getProgressBar() { return this.progressBar; }
    getIcon() { return this.icon; }
    getProgress() { return this.progress; }
    setProgressBar(useCanvasCoords, layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        if (useCanvasCoords) {
            this.progressBar = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }
        else {
            this.progressBar = new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }
    }
    setIcon(useCanvasCoords, layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        if (useCanvasCoords) {
            this.icon = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }
        else {
            this.icon = new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }
    }
    setProgress(progress) {
        this.progress = progress;
        this.progressBar.setSection(this.relativePos.x, this.relativePos.y, Math.max(1, (progress * this.dimension.w) * 0.01), this.dimension.h);
    }
    //#endregion
    addToGraphicRenderer() {
        if (this.image)
            GraphicsRenderer.instance.addExistingEntity(this.image);
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
        this.visible = true;
    }
    /**Añade una entidad de interfaz al layout
     * Cambia las coordenadas de la entidad según las coordenadas del layout
     */
    addUIEntity(uiEntity) {
        if (uiEntity.getPercentRelPos()) {
            uiEntity.x = this.position.x + uiEntity.getRelativePos().x * this.dimension.w - uiEntity.dimension.w * 0.5;
            uiEntity.y = this.position.y + uiEntity.getRelativePos().y * this.dimension.h;
        }
        else {
            uiEntity.x = this.position.x + uiEntity.getRelativePos().x;
            uiEntity.y = this.position.y + uiEntity.getRelativePos().y;
        }
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
        this.position.x = GraphicsRenderer.instance.getCanvas().width * 0.5 - this.dimension.w * 0.5;
        this.position.y = GraphicsRenderer.instance.getCanvas().height * 0.5 - this.dimension.h * 0.5;
        for (let ent of this.uiEntities) {
            if (ent.getPercentRelPos()) {
                ent.x = this.position.x + ent.getRelativePos().x * this.dimension.w - ent.dimension.w * 0.5;
                ent.y = this.position.y + ent.getRelativePos().y * this.dimension.h;
            }
            else {
                ent.x = this.position.x + ent.getRelativePos().x;
                ent.y = this.position.y + ent.getRelativePos().y;
            }
        }
    }
    hide() {
        this.visible = false;
        for (let ent of this.uiEntities) {
            ent.hide();
        }
    }
    show() {
        this.visible = true;
        for (let ent of this.uiEntities) {
            ent.show();
        }
    }
    toggleActive() {
        for (let ent of this.uiEntities) {
            var coll = ent.getCollider();
            if (coll)
                coll.active = !coll.active;
        }
    }
    deactivate() {
        for (let ent of this.uiEntities) {
            var coll = ent.getCollider();
            if (coll)
                coll.active = false;
        }
    }
    activate() {
        for (let ent of this.uiEntities) {
            var coll = ent.getCollider();
            if (coll)
                coll.active = true;
        }
    }
}
/**Hereda de GraphicEntity cambia el método render */
export class UIGraphicEntity extends GraphicEntity {
    constructor(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        super(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
    }
    /**Deja las coordenadas de la cámara (no tiene en cuenta el scroll) */
    render(context) {
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h, this.x, this.y, this.section.w, this.section.h);
    }
}
//# sourceMappingURL=uiEntity.js.map