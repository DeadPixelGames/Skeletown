/** Clase que representa una entidad gráfica fundamental. Es la unidad básica utilizada por el `GraphicsRenderer` para
 * renderizar todos los elementos gráficos del juego.
 */
export default class GraphicEntity {
    constructor(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
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
        };
        this.x = 0;
        this.y = 0;
        this.visible = true;
    }
    /**
     * Dibuja la entidad en sus coordenadas usando el contexto indicado. Se puede indicar un desplazamiento adicional para tener en
     * cuenta el desplazamiento de la pantalla. Los valores de desplazamiento están invertidos.
     */
    render(context, offsetX, offsetY) {
        var x = Math.floor(offsetX == null ? this.x : this.x - offsetX);
        var y = Math.floor(offsetY == null ? this.y : this.y - offsetY);
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h, x - this.pivot.x, y - this.pivot.y, this.section.w, this.section.h);
    }
    ;
    //#region Getters y setters
    /**
     * Devuelve una referencia al elemento del DOM que contiene la imagen original de este elemento.
     */
    getSource() {
        return this.sourceElement;
    }
    /**
     * Devuelve una copia de la sección de la imagen que usa esta entidad para renderizarse. La sección no es modificable;
     * para usar otra sección, crea otra entidad.
     */
    getSection() {
        return {
            x: this.section.x,
            y: this.section.y,
            w: this.section.w,
            h: this.section.h
        };
    }
    /**
     * Devuelve una copia del punto de origen que usa esta entidad. {x: 0, y: 0} significa que el punto de origen es la esquina
     * superior izquierda de la sección que está usando. Para modificar el punto de origen, utiliza `setPivot(x, y)`.
     */
    getPivot() {
        return {
            x: this.pivot.x,
            y: this.pivot.y
        };
    }
    /**
     * Modifica el punto de origen que usa esta entidad. {x: 0, y: 0} significa que el punto de origen es la esquina superior
     * izquierda de la sección de la imagen que está usando.
     */
    setPivot(x, y) {
        this.pivot = {
            x: x,
            y: y
        };
    }
    /**
     * Modifica la sección de imagen que se renderiza
     */
    setSection(x, y, w, h) {
        this.section = {
            x: x,
            y: y,
            w: w,
            h: h
        };
    }
    getWidth() {
        return this.section.w;
    }
    getHeight() {
        return this.section.h;
    }
}
//# sourceMappingURL=graphicentity.js.map