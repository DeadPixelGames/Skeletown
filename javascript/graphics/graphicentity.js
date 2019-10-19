import GameLoop from "../gameloop.js";
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
    render(context, offsetX, offsetY) {
        var x = Math.floor(offsetX == null ? this.x : this.x - offsetX);
        var y = Math.floor(offsetY == null ? this.y : this.y - offsetY);
        var w = Math.ceil(this.section.w);
        var h = Math.ceil(this.section.h);
        // Si la entidad gráfica está volteada, hay que voltear el contexto para dibujarla correctamente
        var sign = 1;
        if (this.flipped) {
            context.scale(-1, 1);
            sign = -1;
        }
        context.drawImage(this.sourceElement, this.section.x, this.section.y, this.section.w, this.section.h, sign * (x - this.pivot.x), y - this.pivot.y, sign * w, h);
        // Y ahora hay que devolver el contexto a su escala natural para no afectar al resto de entidades a dibujar
        if (this.flipped) {
            context.scale(-1, 1);
        }
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
    shouldBeCulled(scrollX, scrollY, scaleX = 1, scaleY = 1) {
        return false;
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
    /**
     * Actualiza la entidad gráfica de acuerdo con los eventos de actualización del GameLoop.
     */
    update(deltaTime) {
        // Dejado vacío intencionalmente. Utiliza el método update de las clases derivadas
    }
    /**
     * Elimina la referencia a esta entidad en otras instancias para poder eliminarla.
     */
    dispose() {
        GameLoop.instance.unsuscribe(this, null, this.update, null, null);
    }
}
//# sourceMappingURL=graphicentity.js.map