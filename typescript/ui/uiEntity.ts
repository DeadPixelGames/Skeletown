import Entity from "../entity.js"
import { BoxCollider, CircleCollider, Collider } from "../collider.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import GraphicEntity from "../graphics/graphicentity.js";
import { clamp } from "../util.js";
import GameLoop from "../gameloop.js";
/**
 * Unidad mínima de interfaz de usuario Cuadrada
 */
export class UIEntity{
    /**Si la entidad de interfaz llama a una función cuando se hace click sobre ella */
    protected clickable :boolean;
    /**Posición relativa al layout en el que se encuentra */
    protected relativePos :{x :number, y:number};

    public dimension :{w :number, h :number};

    public image :GraphicEntity;

    

    protected ctx :CanvasRenderingContext2D;

    public x :number;

    public y :number;

    private collider :Collider | null;

    protected colliderOffset? :{
        x :number,
        y :number,
    }

    private percentRelPos :boolean;

    constructor(clickable :boolean){
        this.clickable = clickable;
        this.ctx = GraphicsRenderer.instance.getCanvasContext();

        GameLoop.instance.suscribe(this, null, this.update, null, null);
        this.colliderOffset = {x: 0, y: 0};
        this.relativePos = {x: 0, y: 0};
        this.dimension = {w: 0, h: 0}
        this.percentRelPos = true;
    }

    
    //#region GETTERS Y SETTERS
    public getRelativePos() :{x :number, y:number}{ return this.relativePos;}
    public getText() {
        return  this.image.text;
    }
    public getCollider(){return this.collider;}
    public getPercentRelPos(){return this.percentRelPos;}

    public setRealtivePos(relativePos :{x :number, y:number}){
        this.relativePos = relativePos;
    }
    public setText(text :string, textPos :{x :number, y :number}, fontSize :string){
        this.image.text = text; 
        this.image.textPos = textPos;
        this.image.fontSize = fontSize;
        
    }
    /**Sobreescribir el setImage de Entity para usar UIGraphicEtity y no una GraphicEntity */
    public setImage(useCanvasCoords :boolean, layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number){
        if(useCanvasCoords){
            this.image = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }else{
            this.image = new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }
        
    }
    public setPercentRelPos(percentRelPos :boolean){
        this.percentRelPos = percentRelPos;
    }
    //#endregion
    
    
    public addToGraphicRenderer(){
        
        if(this.image)
        GraphicsRenderer.instance.addExistingEntity(this.image);
    }

    

    public hide(){
        if(this.image)
            this.image.visible = false;
    }
    public show(){
        if(this.image)
            this.image.visible = true;
    }

    public syncCollider() {
        if(this.collider && this.colliderOffset) {
            this.collider.centerX = this.x + this.colliderOffset.x;
            this.collider.centerY = this.y + this.colliderOffset.y;
        }
    }

    public syncImage() {
        if(this.image) {
            this.image.x = this.x;
            this.image.y = this.y;
        }
    }

    protected update(deltaTime :number){
        this.syncCollider();
        this.syncImage();
    }

    public setCollider(square :boolean, left :number, top :number, w :number, h :number, onClick ?:((x :number, y :number)=>void)){
        this.relativePos = {x: left, y: top};
        this.dimension = {w: w, h: h};
        if(square){
            this.collider = new BoxCollider(left, top, w, h, false);
        }else{
            this.collider = new CircleCollider(left, top, w * 0.5, false);
        }
        this.colliderOffset = {x: w * 0.5, y: h * 0.5};

        if(this.clickable && onClick){
            this.collider.addUserInteraction(this, onClick, null, null);
        }
    }
}




export class ProgressBar extends UIEntity{

    private progressBar :GraphicEntity;
    private icon :GraphicEntity;

    private progress :number;

    constructor(left :number, top :number, w :number, h :number, clickable :boolean, onClick ?:((x :number, y :number)=>void)){
        super(clickable);
        this.setCollider(true, left, top, w, h, onClick);
        this.progress = 100;
    }


    //#region GETTERS Y SETTERS
    public getProgressBar(){return this.progressBar;}
    public getIcon(){return this.icon;}
    public getProgress(){return this.progress;}

    public setProgressBar(useCanvasCoords :boolean, layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number){
        if(useCanvasCoords){
            this.progressBar = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }else{
            this.progressBar = new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }
        
    }
    public setIcon(useCanvasCoords :boolean, layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number){
        if(useCanvasCoords){
            this.icon = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }else{
            this.icon = new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        }
        
    }

    public setProgress(progress :number){
        this.progress = progress;
        this.progressBar.setSection(this.relativePos.x, this.relativePos.y, Math.max(1,(progress * this.dimension.w) * 0.01), this.dimension.h);
    }
    //#endregion

    public addToGraphicRenderer(){
        if(this.image)
        GraphicsRenderer.instance.addExistingEntity(this.image);
        GraphicsRenderer.instance.addExistingEntity(this.getProgressBar());
        GraphicsRenderer.instance.addExistingEntity(this.getIcon());
    }

    public syncImage(){
        if(this.image){
            this.image.x = this.x;
            this.image.y = this.y;
        }
        this.progressBar.x = this.x;
        this.progressBar.y = this.y;
        this.icon.x = this.x;
        this.icon.y = this.y;
    }
    

    public hide(){
        if(this.image)
        this.image.visible = false;

        this.progressBar.visible = false;

        this.icon.visible = false;
    }

    public show(){
        if(this.image)
        this.image.visible = true;

        this.progressBar.visible = true;

        this.icon.visible = true;
    }
}

/**Contenedor de entidades de layout */
export class UILayout {
    /**COnjunto de entidades de interfaz que coniene el layout */
    public uiEntities :UIEntity[];
    /**Posición del layout en la pantalla */
    public position :{x :number, y :number};
    /**Dimensión del layout */
    public dimension :{w :number, h :number};
    
    public visible :boolean;

    constructor(x :number, y :number, w :number, h :number){
        this.uiEntities = [];
        this.position = {x: x, y: y};
        this.dimension = {w: w, h: h};
        this.visible = true;
    }

    /**Añade una entidad de interfaz al layout
     * Cambia las coordenadas de la entidad según las coordenadas del layout
     */
    public addUIEntity(uiEntity :UIEntity){
        if(uiEntity.getPercentRelPos()){
            uiEntity.x = this.position.x + uiEntity.getRelativePos().x * this.dimension.w - uiEntity.dimension.w * 0.5;
            uiEntity.y = this.position.y + uiEntity.getRelativePos().y * this.dimension.h;
        }else{
            uiEntity.x = this.position.x + uiEntity.getRelativePos().x;
            uiEntity.y = this.position.y + uiEntity.getRelativePos().y;
        }
        
        this.uiEntities.push(uiEntity);
    }
    /**Añade al GraphicsRenderer todas las imágenes de las entidades de interfaz */
    public addEntitiesToRenderer(){
        for(let ent of this.uiEntities){
            ent.addToGraphicRenderer();
        }
    }
    

    public resize(w :number, h :number){
        this.dimension = {w: w, h: h};

        this.position.x = GraphicsRenderer.instance.getCanvas().width * 0.5 - this.dimension.w * 0.5; 
        this.position.y = GraphicsRenderer.instance.getCanvas().height * 0.5 - this.dimension.h * 0.5;

        for(let ent of this.uiEntities){
            if(ent.getPercentRelPos()){
                ent.x = this.position.x + ent.getRelativePos().x * this.dimension.w - ent.dimension.w * 0.5;
                ent.y = this.position.y + ent.getRelativePos().y * this.dimension.h;
            }else{
                ent.x = this.position.x + ent.getRelativePos().x;
                ent.y = this.position.y + ent.getRelativePos().y;
            }
            
        }
    }

    public hide(){
        this.visible = false;
        for(let ent of this.uiEntities){
            ent.hide();
        }
    }

    public show(){
        this.visible = true;
        for(let ent of this.uiEntities){
            ent.show();
        }
    }

    public toggleActive(){
        for(let ent of this.uiEntities){
            var coll = ent.getCollider();
            if(coll) coll.active = !coll.active;
        }
    }

    public deactivate(){
        for(let ent of this.uiEntities){
            var coll = ent.getCollider();
            if(coll) coll.active = false;
        }
    }

    public activate(){
        for(let ent of this.uiEntities){
            var coll = ent.getCollider();
            if (coll) coll.active = true;
        }
    }
}

/**Hereda de GraphicEntity cambia el método render */
export class UIGraphicEntity extends GraphicEntity{

    constructor(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number){
        super(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);

    }
    /**Deja las coordenadas de la cámara (no tiene en cuenta el scroll) */
    public render(context :CanvasRenderingContext2D){
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h,
        this.x, this.y, this.section.w, this.section.h);
        this.drawText();
    }


    private drawText() {
        
        if(this.text && this.textPos) {
            GraphicsRenderer.instance.getCanvasContext().font =  this.fontSize + " Arco";
            GraphicsRenderer.instance.getCanvasContext().textAlign = "end";
            GraphicsRenderer.instance.getCanvasContext().strokeStyle = 'white';
            GraphicsRenderer.instance.getCanvasContext().lineWidth = 5;
            GraphicsRenderer.instance.getCanvasContext().strokeText(this.text, this.x + this.textPos.x, this.y + this.textPos.y);
            GraphicsRenderer.instance.getCanvasContext().fillStyle = "#000000";
            GraphicsRenderer.instance.getCanvasContext().fillText(this.text, this.x + this.textPos.x, this.y + this.textPos.y);
        }
    }
}
