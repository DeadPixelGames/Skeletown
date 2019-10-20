import GraphicEntity from "./graphicentity.js";
import GameEvent from "../gameevent.js";
import GameLoop from "../gameloop.js";
import { sleep } from "../util.js";

/**
 * Clase singleton encargada de renderizar todos los gráficos del juego. Los métodos de esta clase se pueden
 * acceder mediante `GraphicsRenderer.instance`.
*/
export default class GraphicsRenderer {
    //#region Singleton
    private static _instance :GraphicsRenderer;

    /** La instancia única de esta clase singleton. */
    public static get instance() {
        return this._instance;
    }

    /** Inicia el patrón singleton, o lanza un error si ya hay otra instancia de esta clase en funcionamiento. */
    private static initSingleton(instance :GraphicsRenderer) {
        // Si la instancia singleton de esta clase ya es la actual, no hacemos nada
        if(GraphicsRenderer._instance == instance) {
            return;
        }
        // Pero si es otra, ha habido un problema y hay que lanzar un error
        if(GraphicsRenderer._instance) {
            throw new Error("Ya hay otra instancia de " + this.name + " en funcionamiento.");
        } else {
            // Y si no, es la primera vez que iniciamos este singleton y vamos a usar la instancia actual
            this._instance = instance;
        }
    }
    //#endregion

    /**
     * Entidades que esta clase tiene disponibles para renderizar.
     */
    private entities :GraphicEntity[];
    /**
    *  Canvas que usa esta el `GraphicsRenderer`.
    */
    private canvas :HTMLCanvasElement;
    /**
     * Contexto del canvas que usa el `GraphicsRenderer`.
     */
    private context :CanvasRenderingContext2D;
    /**
     * La entidad a la que sigue la cámara.
     */
    private following :GraphicEntity | null;
    /**
     * Indica el desplazamiento horizontal de la pantalla.
     */
    public scrollX :number;
    /**
     * Indica el desplazamiento vertical de la pantalla.
     */
    public scrollY :number;
    /**
     * La escala horizontal de la pantalla
     */
    public scaleX :number;
    /**
     * La escala vertical de la pantalla
     */
    public scaleY :number;
    /**
     * Evento que se dispara al renovar el renderer descartando todas las entidades actuales. 
     */
    private onFirstFrame :GameEvent<() => void>;
    /**
     * Evento que se dispara cada vez que un fotograma termina de renderizarse.
     */
    private onFrameUpdate :GameEvent<() => void>;
    /**
     * Color que tinta toda la pantalla. Los valores rojo (r), verde (g) y azul (b) están en tanto por 255,
     * mientras que el valor alfa (a) está en tanto por 1.
     */
    private overlayColor :{
        r :number,
        g :number,
        b :number,
        a :number
    };

    /** El constructor es privado, usa `GraphicsRenderer.initInstance(context)` en su lugar. */
    private constructor(context :CanvasRenderingContext2D) {
        this.entities = [];
        this.context = context;
        this.canvas = context.canvas;
        this.following = null;
        this.scrollX = 0;
        this.scrollY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.onFrameUpdate = new GameEvent();
        this.onFirstFrame = new GameEvent();

        this.overlayColor = {
            r: 0,
            g: 0,
            b: 0,
            a: 0
        };
    }

    /**
     * Inicializa la instancia Singleton de `GraphicsRenderer` del programa y la asocia al contexto de canvas especificado.
     */
    public static initInstance(context :CanvasRenderingContext2D) {
        if(!GameLoop.instance) {
            throw new Error("GameLoop no se ha iniciado todavía. Por favor inicia GameLoop antes de instanciar GraphicsRenderer.");
        }
        var ret = new GraphicsRenderer(context);
        GraphicsRenderer.initSingleton(ret);
        GameLoop.instance.suscribe(GraphicsRenderer.instance, null, GraphicsRenderer.instance.render, null, null);
        return ret;
    }

    /** Renderiza todas las entidades al canvas. */
    public render() {
        this.clearCanvas();
        this.sortEntities();
        this.updateScrollToFollow();
        for(let entity of this.entities) {
            if(!entity.visible)
                break;

            if(entity.shouldBeCulled(this.scrollX, this.scrollY))
                continue;
            
            entity.render(this.context, this.scrollX, this.scrollY);
        }
        // Dibujamos el overlay
        this.context.fillStyle = "rgba(" + this.overlayColor.r + ", " + this.overlayColor.g + ", " + this.overlayColor.b + ", " + this.overlayColor.a + ")";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "#000000";

        // Render del fotograma listo, disparamos el evento
        this.onFrameUpdate.dispatch();
    }

    /**
     * Descarta todas las entidades almacenadas y vuelve a ejecutar el evento del primer fotograma.
     */
    public flush() {
        this.entities.forEach(e => e.dispose());
        this.entities = [];
        this.following = null;
        this.onFirstFrame.dispatch();
    }

    //#region Añadir entidad
    /** Añade la entidad especificada al `GraphicsRenderer` para que la renderice. */
    public addExistingEntity(entity :GraphicEntity) {
        this.entities.push(entity);
    }

    /** Genera una nueva entidad gráfica y la añade al `GraphicsRenderer`. */
    public addNewEntity(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number, ) {
        this.entities.push(new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY));
    }
    //#endregion

    /** Elimina la entidad del `GraphicsRenderer` */
    public removeEntity(entity :GraphicEntity | null) {
        if(entity) {
            this.entities.remove(entity);
        }
    }

    /**
     * Suscribe la instancia especificada a los distintos eventos del `GraphicsRenderer`:
     * * `onFirstFrame`: Se ejecuta en el primer fotograma y después de vaciar todas las entidades.
     * * `onFrameUpdate`: Se ejecuta al término de cada fotograma.
     */
    public suscribe(instance: any, onFirstFrame :(() => void) | null, onFrameUpdate :(() => void) | null) {
        if(onFrameUpdate) {
            this.onFrameUpdate.suscribe(onFrameUpdate, instance);
        }
        if(onFirstFrame) {
            this.onFirstFrame.suscribe(onFirstFrame, instance);
        }
    }

    /**
     * Reproduce una animación de desvanecimiento en el color de overlay sobre la pantalla, pensada para
     * cambiar el estado del juego. El fundido en negro dura lo especificado en segundos. Después, se ejecuta
     * el callback. Por último, se vuelve a realizar un nuevo fundido con la misma duración. Si el callback
     * es asíncrono, la transición esperará a que se complete antes de continuar.
     */
    public async fadeOutAndIn(duration :number, callback :(() => void) | (() => Promise<void>)) {
        
        var durationInverse = 1 / (1000 * duration);
        var alpha = this.overlayColor.a;
        var oldAlpha = alpha;
        var currentMillis = Date.now();

        // Fundido hacia negro
        while(alpha < 1) {
            // Cada iteración de este bucle está en un fotograma distinto. Podemos producir esto esperando una
            // cantidad simbólica de tiempo
            await sleep(1);
            // Subimos el canal alfa proporcionalmente al tiempo que ha pasado desde la última iteración y la
            // duración especificada
            alpha = Math.min(1, alpha + (Date.now() - currentMillis) * durationInverse);
            currentMillis = Date.now();
            // Asignamos el alfa calculado al overlay de la pantalla
            this.overlayColor.a = alpha;
        }

        // Con el fundido hacia negro terminado, ejecutamos el callback
        var callbackResult = callback();

        // Si el callback es asíncrono, esperamos a que se complete antes de seguir
        if(callbackResult instanceof Promise) {
            await callbackResult;
        }

        currentMillis = Date.now();

        // Fundido desde negro
        while(alpha > oldAlpha) {
            // El proceso es igual que en el fundido hacia negro, pero esta vez el alfa está regresando a su
            // valor original
            await sleep(1);
            alpha = Math.max(oldAlpha, alpha - (Date.now() - currentMillis) * durationInverse);
            currentMillis = Date.now();
            this.overlayColor.a = alpha;
        }
    }

    /**
     * Ordena las entidades para ordenarlas correctamente. Se ordenan primero por capa, luego por coordenada Y, y por
     * último por coordenada X. Lo hacemos así porque los tiles deberían renderizarse por filas, no por columnas.
     */
    private sortEntities() {
        this.entities.sort((e1, e2) =>
            e1.visible != e2.visible ?  (e1.visible ? -1 : 1) :
            e1.renderLayer != e2.renderLayer ? e1.renderLayer - e2.renderLayer :
            e1.y != e2.y ? e1.y - e2.y :
            e1.x - e2.x
        );
    }

    //#region Gestionar canvas
    /**
     * Devuelve el canvas en uso por el GraphicsRenderer.
     */
    public getCanvas() {
        return this.canvas;
    }

    /**
     * Devuelve el contexto del canvas en uso por el GraphicsRenderer.
     */
    public getCanvasContext() {
        return this.context;
    }

    /**
     * Elimina todo lo que haya dibujado en el canvas
     */
    private clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    //#endregion
    
    //#region Gestionar seguimiento
    public follow(entity :GraphicEntity | null) {
        this.following = entity;
    }

    private updateScrollToFollow() {
        if(this.following) {
            this.scrollX = this.following.x - this.canvas.width * 0.5;
            this.scrollY = this.following.y - this.canvas.height * 0.5;
        }
    }
    //#endregion
}