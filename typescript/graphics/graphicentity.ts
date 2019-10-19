import GameLoop from "../gameloop.js";

/** Clase que representa una entidad gráfica fundamental. Es la unidad básica utilizada por el `GraphicsRenderer` para
 * renderizar todos los elementos gráficos del juego. 
 */
export default class GraphicEntity {

    /**
     * Elemento del DOM que representa la imagen de la que procede esta entidad gráfica.
     */
    protected sourceElement :HTMLImageElement;

    /** 
     * Sección de la imagen original que se va a utilizar para renderizar esta entidad.
     */
    protected section :{
        x :number,
        y :number,
        w :number,
        h :number
    };

    /**
     * Punto de origen desde el que se dibujará la entidad gráfica. {x: 0, y: 0} representa la esquina superior izquierda de la sección.
     * El punto especificado será el que coincida con las coordenadas puntuales en las que se encuentra la entidad.
     */
    protected pivot :{
        x :number,
        y :number
    }

    /**
     * Indica si la entidad está horizontalmente volteada.
     */
    protected flipped :boolean;
    
    /**
     * Capa en la que se va a renderizar la entidad gráfica. La escala del valor absoluto que pueda tomar esta variable es irrelevante;
     * solo se tiene en cuenta en comparación con los valores de otras entidades.
     */
    public renderLayer :number;
    /**
     * Si es visible la entidad gráfica
     */
    public visible :boolean;
    /**
     * Posición puntual en X de esta entidad, en coordenadas del mundo en píxeles.
     */
    public x :number;
    /**
     * Posición puntual en Y de esta entidad, en coordenadas del mundo en píxeles.
     */
    public y :number;

    public text? :string;
    /**Posición del texto en coordenadas locales de la interfaz */
    public textPos? :{x :number, y :number};

    public fontSize :string;

    constructor(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number) {
        this.sourceElement = source;
        this.section = {
            x: sX != null ? sX : 0,
            y: sY != null ? sY : 0,
            w: sWidth != null ? sWidth : source.width,
            h: sHeight != null ? sHeight : source.height
        };
        this.renderLayer = layer;
        this.pivot = {
            x: pivotX != null ? pivotX : 0,
            y: pivotY != null ? pivotY : 0
        }
        this.flipped = false;
        this.x = 0;
        this.y = 0;
        this.visible = true;

        GameLoop.instance.suscribe(this, null, this.update, null, null);
    }

    /**
     * Dibuja la entidad en sus coordenadas usando el contexto indicado. Se puede indicar un desplazamiento adicional para tener en
     * cuenta el desplazamiento de la pantalla. Los valores de desplazamiento están invertidos.
     */
    public render(context :CanvasRenderingContext2D, offsetX? :number, offsetY? :number, scaleX = 1, scaleY = 1) {
        var x = Math.round((offsetX == null ? this.x : this.x - offsetX) - this.pivot.x);
        var y = Math.round((offsetY == null ? this.y : this.y - offsetY) - this.pivot.y);
        var w = this.section.w;
        var h = this.section.h;

        // Si la entidad gráfica está volteada, hay que voltear el contexto para dibujarla correctamente
        var sign = 1;
        if(this.flipped) {
            context.scale(-1, 1);
            sign = -1;
        }
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h, sign * x, y, sign * w + 1, h + 1);
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h, sign * x, y, sign * w, h);
        // Y ahora hay que devolver el contexto a su escala natural para no afectar al resto de entidades a dibujar
        if(this.flipped) {
            context.scale(-1, 1);
        }
    };

    //#region Getters y setters
    /**
     * Devuelve una referencia al elemento del DOM que contiene la imagen original de este elemento.
     */
    public getSource() {
        return this.sourceElement;
    }

    /**
     * Devuelve una copia de la sección de la imagen que usa esta entidad para renderizarse. La sección no es modificable;
     * para usar otra sección, crea otra entidad.
     */
    public getSection() {
        return {
            x: this.section.x,
            y: this.section.y,
            w: this.section.w,
            h: this.section.h
        }
    }

    public shouldBeCulled(scrollX :number, scrollY :number, scaleX = 1, scaleY = 1) {
        return false;
    }

    /**
     * Devuelve una copia del punto de origen que usa esta entidad. {x: 0, y: 0} significa que el punto de origen es la esquina
     * superior izquierda de la sección que está usando. Para modificar el punto de origen, utiliza `setPivot(x, y)`.
     */
    public getPivot() {
        return {
            x: this.pivot.x,
            y: this.pivot.y
        }
    }

    /**
     * Modifica el punto de origen que usa esta entidad. {x: 0, y: 0} significa que el punto de origen es la esquina superior
     * izquierda de la sección de la imagen que está usando.
     */
    public setPivot(x :number, y :number) {
        this.pivot = {
            x: x,
            y: y
        }
    }
    
    /**
     * Modifica la sección de imagen que se renderiza 
     */
    public setSection(x :number, y :number, w :number, h :number){
        this.section = {
            x: x,
            y: y,
            w: w,
            h: h
        }
    }

    public getWidth() {
        return this.section.w;
    }

    public getHeight() {
        return this.section.h;
    }

    /**
     * Actualiza la entidad gráfica de acuerdo con los eventos de actualización del GameLoop.
     */
    protected update(deltaTime :number) {
        // Dejado vacío intencionalmente. Utiliza el método update de las clases derivadas
    }

    /**
     * Elimina la referencia a esta entidad en otras instancias para poder eliminarla.
     */
    public dispose() {
        GameLoop.instance.unsuscribe(this, null, this.update, null, null);
    }
    //#endregion
}