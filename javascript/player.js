import Entity from "./entity.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import AudioManager from "./audiomanager.js";
/** Velocidad de desplazamiento del jugador. */
const PLAYER_SPEED = 500;
/**
 * Factor que indica cómo afecta la distancia desde el toque hasta la posición del personaje a la velocidad del
 * movimiento. Cuanto más alto el valor, más grande será la diferencia de velocidad entre el centro y los
 * márgenes de la pantalla.
 */
const MOUSE_DISTANCE_SPEED_FACTOR = 1 / 800;
/**
 * Tiempo en segundos que hay que esperar antes de reproducir la segunda animación de inactividad.
 */
const TIME_UNTIL_IDLE = 3;
const STEP_SOUND_TIME = 0.2;
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
        this.idleTimer = 0;
        this.stepSoundCounter = 0;
        this.useStepSoundB = false;
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
        if (onCanvasX != null && onCanvasY != null && onCanvasX < this.canvas.width * GraphicsRenderer.instance.scaleX && onCanvasY < this.canvas.height * GraphicsRenderer.instance.scaleY) {
            ret = {
                x: onCanvasX / GraphicsRenderer.instance.scaleX + GraphicsRenderer.instance.scrollX,
                y: onCanvasY / GraphicsRenderer.instance.scaleY + GraphicsRenderer.instance.scrollY
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
        if (this.isAttacking()) {
            this.usingOwnClip = false;
        }
        if (this.mouse && this.dest && !this.isAttacking()) {
            this.speed.x = Math.abs(this.dest.x - this.x) * MOUSE_DISTANCE_SPEED_FACTOR * PLAYER_SPEED;
            this.speed.y = Math.abs(this.dest.y - this.y) * MOUSE_DISTANCE_SPEED_FACTOR * PLAYER_SPEED;
            this.idleTimer = 0;
        }
        else {
            if (!this.isAttacking()) {
                this.dest = null;
            }
            else {
                this.speed.x = 0;
                this.speed.y = 0;
            }
            this.idleTimer += deltaTime;
        }
        if (!this.isAttacking()) {
            this.idleTimer = 0;
        }
        else if (this.idleTimer > TIME_UNTIL_IDLE) {
            this.image.play("idle2");
            this.usingOwnClip = true;
            this.idleTimer = 0;
        }
        else {
            this.usingOwnClip = false;
        }
        super.update(deltaTime);
        if (AudioManager.instance.contextIsActive) {
            if (this.x > 21376) {
                AudioManager.instance.playMusic("music_danger");
            }
            else {
                AudioManager.instance.playMusic("music_town");
            }
            if (this.dest != null) {
                if (this.stepSoundCounter > STEP_SOUND_TIME) {
                    if (!this.useStepSoundB) {
                        AudioManager.instance.playSound("stepA");
                    }
                    else {
                        AudioManager.instance.playSound("stepB");
                    }
                    this.stepSoundCounter = 0;
                    this.useStepSoundB = !this.useStepSoundB;
                }
                else {
                    this.stepSoundCounter += deltaTime;
                }
            }
        }
    }
}
//# sourceMappingURL=player.js.map