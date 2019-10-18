import Entity from "../entity.js"
import { BoxCollider, CircleCollider } from "../collider.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import GraphicEntity from "../graphics/graphicentity.js";
import { clamp } from "../util.js";
/**
 * Unidad mínima de interfaz de usuario Cuadrada
 */
export class UIEntity extends Entity {
    /**Si la entidad de interfaz llama a una función cuando se hace click sobre ella */
    protected clickable :boolean;
    /**Posición relativa al layout en el que se encuentra */
    protected relativePos :{x :number, y:number};

    public dimension :{w :number, h :number};

    protected text? :string;
    /**Posición del texto en coordenadas locales de la interfaz */
    protected textPos? :{x :number, y :number};


    constructor(clickable :boolean){
        super();
        this.clickable = clickable;
        GraphicsRenderer.instance.suscribe(this, null, this.drawText);
    }

    
    //#region GETTERS Y SETTERS
    public getRelativePos() :{x :number, y:number}{ return this.relativePos;}
    public getText() {return this.text;}
    
    public setRealtivePos(relativePos :{x :number, y:number}){
        this.relativePos = relativePos;
    }
    public setText(text :string, textPos :{x :number, y :number}){this.text = text; this.textPos = textPos;}
    
    //#endregion
    /**Sobreescribir el setImage de Entity para usar UIGraphicEtity y no una GraphicEntity */
    public setImage(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number){
        this.image = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        
    }
    
    public addToGraphicRenderer(){
        var img = this.getImage();
        if(img)
        GraphicsRenderer.instance.addExistingEntity(img);
    }

    protected drawText() {
        if(this.text && this.textPos) {
            this.ctx.font = "45px Arco Black";
            this.ctx.fillStyle = "#000000";
            this.ctx.fillText(this.text, this.x + this.textPos.x, this.y + this.textPos.y);
        }
    }
}


export class UISquareEntity extends UIEntity {


    constructor (left :number, top :number, w :number, h :number, clickable :boolean, onClick ?:((x :number, y :number)=>void)){
        super(clickable);
        this.relativePos = {x: left, y: top};
        this.dimension = {w: w, h: h};
        this.setCollider(new BoxCollider(left, top, w, h, false));
        var collider = this.getCollider();
        /**Añadir al collider de la entidad la función que se activará con el evento onClick */
        if(collider && this.clickable && onClick){
            collider.addUserInteraction(this, onClick, null, null);
        }
    }
}

export class UICircleEntity extends UIEntity {
    constructor (centerX :number, centerY :number, radius :number, clickable :boolean, onClick ?:((x :number, y :number)=>void)){
        super(clickable);
        this.relativePos = {x: centerX, y: centerY};
        this.setCollider(new CircleCollider(centerX, centerY, radius, false));
        var collider = this.getCollider();

        if(collider && this.clickable && onClick){
            collider.addUserInteraction(this, onClick, null, null);
        }
        this.dimension = {w: radius, h: radius};
    }
}

export class ProgressBar extends UISquareEntity{

    private progressBar :UIGraphicEntity;
    private icon :UIGraphicEntity;

    private progress :number;

    constructor(left :number, top :number, w :number, h :number, clickable :boolean, onClick ?:((x :number, y :number)=>void)){
        super(left, top, w, h, clickable, onClick);
        this.progress = 100;
    }


    //#region GETTERS Y SETTERS
    public getProgressBar(){return this.progressBar;}
    public getIcon(){return this.icon;}
    public getProgress(){return this.progress;}

    public setProgressBar(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number){
        this.progressBar = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        
    }
    public setIcon(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number){
        this.icon = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        
    }

    public setProgress(progress :number){
        this.progress = progress;
        this.progressBar.setSection(this.relativePos.x, this.relativePos.y, Math.max(1,(progress * this.dimension.w) * 0.01), this.dimension.h);
    }
    //#endregion

    public addToGraphicRenderer(){
        var img = this.getImage()
        if(img)
        GraphicsRenderer.instance.addExistingEntity(img);
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
}

/**Contenedor de entidades de layout */
export class UILayout {
    /**COnjunto de entidades de interfaz que coniene el layout */
    private uiEntities :UIEntity[];
    /**Posición del layout en la pantalla */
    private position :{x :number, y :number};
    /**Dimensión del layout */
    private dimension :{w :number, h :number};


    constructor(x :number, y :number, w :number, h :number){
        this.uiEntities = [];
        this.position = {x: x, y: y};
        this.dimension = {w: w, h: h};
    }

    /**Añade una entidad de interfaz al layout
     * Cambia las coordenadas de la entidad según las coordenadas del layout
     */
    public addUIEntity(uiEntity :UIEntity){
        uiEntity.x = this.position.x + uiEntity.getRelativePos().x * this.dimension.w - uiEntity.dimension.w * 0.5;
        uiEntity.y = this.position.y + uiEntity.getRelativePos().y * this.dimension.h;
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

        for(let ent of this.uiEntities){
            ent.x = this.position.x + ent.getRelativePos().x * this.dimension.w - ent.dimension.w * 0.5;
            ent.y = this.position.y + ent.getRelativePos().y * this.dimension.h;
        }
    }
}

/**Hereda de GraphicEntity cambia el método render */
class UIGraphicEntity extends GraphicEntity{
    constructor(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number){
        super(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);

    }
    /**Deja las coordenadas de la cámara (no tiene en cuenta el scroll) */
    public render(context :CanvasRenderingContext2D){
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h,
        this.x, this.y, this.section.w, this.section.h);
    }
}
