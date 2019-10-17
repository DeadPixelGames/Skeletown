import Entity from "./entity.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
/** Velocidad de desplazamiento del jugador. */
const PLAYER_SPEED = 500;
/**
 * Factor que indica cómo afecta la distancia desde el toque hasta la posición del personaje a la velocidad del
 * movimiento. Cuanto más alto el valor, más grande será la diferencia de velocidad entre el centro y los
 * márgenes de la pantalla.
 */
const MOUSE_DISTANCE_SPEED_FACTOR = 1 / 500;
/**Capacidad máxima del inventario */
const INVENTORY_MAX_SPACES = 10;
/**
 * Clase que representa al jugador
 */
export default class Player extends Entity {
    /**
     * Constructor
     */
    constructor() {
        /**
         * Llamada al constructor del padre (Entity)
         */
        super();
        /** true si está activo el movimiento del personaje */
        this.mouse = false;
        var that = this;
        var listenerCallback = (e, mouseActive) => {
            if (mouseActive != null) {
                that.mouse = mouseActive;
            }
            that.event = e;
        };
        document.addEventListener("mousedown", e => listenerCallback(e, true));
        document.addEventListener("touchstart", e => listenerCallback(e, true));
        document.addEventListener("mouseup", e => listenerCallback(e, false));
        document.addEventListener("touchend", e => listenerCallback(e, false));
        document.addEventListener("mousemove", e => listenerCallback(e, null));
        document.addEventListener("touchmove", e => listenerCallback(e, null));
        this.speed.x = PLAYER_SPEED;
        this.speed.y = PLAYER_SPEED;
    }
    /**
     * Coge el rectángulo del canvas y calcula la posición del ratón o la pulsación del dedo en el canvas
     * Hace uso del MouseEvent y el TouchEvent
     */
    getCursorPosition() {
        const rect = this.canvas.getBoundingClientRect();
        var ret = null;
        if (!this.event) {
            return ret;
        }
        var onCanvasX = null;
        var onCanvasY = null;
        // Obtenemos el punto tocado del canvas según si el usuario usa el ratón o la pantalla táctil
        if (this.event instanceof MouseEvent) {
            onCanvasX = this.event.clientX - rect.left;
            onCanvasY = this.event.clientY - rect.top;
        }
        else if (this.event instanceof TouchEvent && this.event.touches.length > 0) {
            onCanvasX = this.event.touches[0].clientX - rect.left;
            onCanvasY = this.event.touches[0].clientY - rect.top;
        }
        if (onCanvasX != null && onCanvasY != null && onCanvasX < this.canvas.width && onCanvasY < this.canvas.height) {
            ret = {
                x: onCanvasX + GraphicsRenderer.instance.scrollX,
                y: onCanvasY + GraphicsRenderer.instance.scrollY
            };
        }
        return ret;
    }
    /**
     * Calcula el movimiento que se tiene que hacer en cada frame.
     * Se calcula la distancia desde la posición hasta el destino y se normaliza el vector. Se multiplica por
     * la velocidad del jugador y se mueve la posición en esa cantidad.
     */
    update(deltaTime) {
        this.dest = this.getCursorPosition();
        if (!this.mouse) {
            return null;
        }
        if (this.dest) {
            this.speed.x = Math.abs(this.dest.x - this.x) * MOUSE_DISTANCE_SPEED_FACTOR * PLAYER_SPEED;
            this.speed.y = Math.abs(this.dest.y - this.y) * MOUSE_DISTANCE_SPEED_FACTOR * PLAYER_SPEED;
        }
        super.update(deltaTime);
    }
}
//# sourceMappingURL=player.js.map