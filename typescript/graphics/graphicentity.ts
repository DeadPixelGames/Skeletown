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
        this.x = 0;
        this.y = 0;
        this.visible = true;
    }

    /**
     * Dibuja la entidad en sus coordenadas usando el contexto indicado. Se puede indicar un desplazamiento adicional para tener en
     * cuenta el desplazamiento de la pantalla. Los valores de desplazamiento están invertidos.
     */
    public render(context :CanvasRenderingContext2D, offsetX? :number, offsetY? :number) {
        var x = Math.floor(offsetX == null ? this.x : this.x - offsetX);
        var y = Math.floor(offsetY == null ? this.y : this.y - offsetY);
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h, x, y, this.section.w, this.section.h);
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
    //#endregion
}