import GameEvent from "./gameevent.js";
/**
 * Cantidad de fotogramas renderizados por segundo.
 */
const FRAMERATE = 30;
/**
 * Multiplicador que se aplicará al factor `deltaTime` en los eventos de actualización. Un valor de 1 representaría milisegundos.
 */
const DELTATIME_FACTOR = 0.001;
/**
 * Clase singleton que gestiona de manera general los eventos de progreso del juego. Se puede acceder a los eventos y métodos
 * mediante `GameLoop.instance`.
 */
export default class GameLoop {
    /**
     * El constructor es privado. Usa `GameLoop.initInstance()` en su lugar.
     */
    constructor() {
        this.onStart = new GameEvent();
        this.onUpdate = new GameEvent();
        this.onPause = new GameEvent();
        this.onResume = new GameEvent();
        this.frameIntervalTime = 1000 / FRAMERATE;
        this.lastMilliseconds = Date.now();
        this.pausedMilliseconds = Date.now();
    }
    /** La instancia única de esta clase singleton. */
    static get instance() {
        return this._instance;
    }
    /** Inicia el patrón singleton, o lanza un error si ya hay otra instancia de esta clase en funcionamiento. */
    static initSingleton(instance) {
        // Si la instancia singleton de esta clase ya es la actual, no hacemos nada
        if (GameLoop._instance == instance) {
            return;
        }
        // Pero si es otra, ha habido un problema y hay que lanzar un error
        if (GameLoop._instance) {
            throw new Error("Ya hay otra instancia de " + this.name + " en funcionamiento.");
        }
        else {
            // Y si no, es la primera vez que iniciamos este singleton y vamos a usar la instancia actual
            this._instance = instance;
        }
    }
    /**
     * Inicia la instancia singleton de `GameLoop`. Nótese que aunque la instancia se cree, el GameLoop
     * como tal no empieza. Para eso es necesario ejecutar `GameLoop.instance.start()`.
     */
    static initInstance() {
        var ret = new GameLoop();
        GameLoop.initSingleton(ret);
        return ret;
    }
    /**
     * Inicia el ciclo del GameLoop. Sólo debe ejecutarse una vez; para detener y reanudar el GameLoop más adelante, usa
     * `pause` y `resume`.
     */
    start() {
        this.onStart.dispatch();
        this.init();
    }
    /**
     * Pone en pausa el ciclo del GameLoop. En este estado, las actualizaciones no se ejecutarán hasta que se reanude el ciclo.
     */
    pause() {
        if (this.updateInterval != null) {
            clearInterval(this.updateInterval);
        }
        this.onPause.dispatch();
        this.pausedMilliseconds = Date.now();
    }
    /**
     * Reanuda el GameLoop después de pausar el GameLoop.
     */
    resume() {
        this.onResume.dispatch();
        // Añadimos a la marca de tiempo de la última actualización el tiempo que el GameLoop ha estado en pausa. Si no
        // hiciéramos esto, las siguientes actualizaciones tendrían un valor de `deltaTime` lo suficientemente alto como para
        // negar la pausa por completo
        this.lastMilliseconds += Date.now() - this.pausedMilliseconds;
        this.updateInterval = setInterval(this.update.bind(this), this.frameIntervalTime);
    }
    /**
     * Suscribe la instancia indicada a los eventos del GameLoop.
     * * `onStart` - Se ejecuta al iniciar el GameLoop.
     * * `onUpdate(deltaTime)` - Se ejecuta al actualizar cada fotograma, y recibe por parámetro el tiempo transcurrido desde la última actualización.
     * * `onPause` - Se ejecuta al pausar el GameLoop.
     * * `onResume` - Se ejecuta al reanudar el GameLoop.
     */
    suscribe(instance, onStart, onUpdate, onPause, onResume) {
        if (onStart) {
            this.onStart.suscribe(onStart, instance);
        }
        if (onUpdate) {
            this.onUpdate.suscribe(onUpdate, instance);
        }
        if (onPause) {
            this.onPause.suscribe(onPause, instance);
        }
        if (onResume) {
            this.onResume.suscribe(onResume, instance);
        }
    }
    /**
     * Desuscribe la instancia de todos sus eventos del GameLoop.
     */
    unsuscribe(instance, onStart, onUpdate, onPause, onResume) {
        if (onStart) {
            this.onStart.unsuscribe(onStart, instance);
        }
        if (onUpdate) {
            this.onUpdate.unsuscribe(onUpdate, instance);
        }
        if (onPause) {
            this.onPause.unsuscribe(onPause, instance);
        }
        if (onResume) {
            this.onResume.unsuscribe(onResume, instance);
        }
    }
    /**
     * Configura el intervalo de actualización por primera vez.
     */
    init() {
        this.updateInterval = setInterval(this.update.bind(this), this.frameIntervalTime);
    }
    /**
     * Ejecuta los eventos de actualización suscritos con el valor de `deltaTime` calculado.
     */
    update() {
        var currentTime = Date.now();
        this.onUpdate.dispatch((currentTime - this.lastMilliseconds) * DELTATIME_FACTOR);
        this.lastMilliseconds = currentTime;
    }
}
//# sourceMappingURL=gameloop.js.map