import Entity from "../entity.js"
import { BoxCollider } from "../collider.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import GraphicEntity from "../graphics/graphicentity.js";
/**
 * Unidad mínima de interfaz de usuario
 */
export class UIEntity extends Entity {
    /**Si la entidad de interfaz llama a una función cuando se hace click sobre ella */
    private clickable :boolean;
    /**Posición relativa al layout en el que se encuentra */
    private relativePos :{x :number, y:number};

    constructor(left :number, top :number, w :number, h :number, clickable :boolean, onClick ?:((x :number, y :number)=>void)){
        super();
        this.clickable = clickable;
        this.relativePos = {x: left, y: top};
        this.setCollider(new BoxCollider(left, top, w, h, false));
        var collider = this.getCollider();
        /**Añadir al collider de la entidad la función que se activará con el evento onClick */
        if(collider && this.clickable && onClick){
            collider.addUserInteraction(this, onClick, null, null);
        }
        
    }
    //#region GETTERS Y SETTERS
    public setRealtivePos(relativePos :{x :number, y:number}){
        this.relativePos = relativePos;
    }
    public getRelativePos() :{x :number, y:number}{ return this.relativePos;}
    //#endregion
    /**Sobreescribir el setImage de Entity para usar UIGraphicEtity y no una GraphicEntity */
    public setImage(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number){
        this.image = new UIGraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        this.syncImage();
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
        uiEntity.x = this.position.x + uiEntity.getRelativePos().x;
        uiEntity.y = this.position.y + uiEntity.getRelativePos().y;
        this.uiEntities.push(uiEntity);
    }
    /**Añade al GraphicsRenderer todas las imágenes de las entidades de interfaz */
    public addEntitiesToRenderer(){
        for(let ent of this.uiEntities){
            GraphicsRenderer.instance.addExistingEntity(ent.getImage());
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
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h, this.x, this.y, this.section.w, this.section.h);
    }
}
