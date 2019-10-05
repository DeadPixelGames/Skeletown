import GraphicEntity from "./graphicentity.js";
import GameEvent from "../gameevent.js";

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
     * Indica el desplazamiento horizontal de la pantalla.
     */
    public scrollX :number;
    /**
     * Indica el desplazamiento vertical de la pantalla.
     */
    public scrollY :number;
    /**
     * Evento que se dispara al renovar el renderer descartando todas las entidades actuales. 
     */
    private onFirstFrame :GameEvent<() => void>;
    /**
     * Evento que se dispara cada vez que un fotograma termina de renderizarse.
     */
    private onFrameUpdate :GameEvent<() => void>;

    /** El constructor es privado, usa `GraphicsRenderer.initInstance(context)` en su lugar. */
    private constructor(context :CanvasRenderingContext2D) {
        this.entities = [];
        this.context = context;
        this.canvas = context.canvas;
        this.scrollX = 0;
        this.scrollY = 0;
        this.onFrameUpdate = new GameEvent();
        this.onFirstFrame = new GameEvent();
    }

    /**
     * Inicializa la instancia Singleton de `GraphicsRenderer` del programa y la asocia al contexto de canvas especificado.
     */
    public static initInstance(context :CanvasRenderingContext2D) {
        var ret = new GraphicsRenderer(context);
        GraphicsRenderer.initSingleton(ret);
        return ret;
    }

    /** Renderiza todas las entidades al canvas. */
    public render() {
        this.clearCanvas();
        this.sortEntities();
        for(let entity of this.entities) {
            entity.render(this.context, this.scrollX, this.scrollY);
        }
        this.onFrameUpdate.dispatch();
    }

    /** Añade la entidad especificada al `GraphicsManager` para que la renderice. */
    public addExistingEntity(entity :GraphicEntity) {
        this.entities.push(entity);
    }

    /** Genera una nueva entidad gráfica y la añade al `GraphicsManager`. */
    public addNewEntity(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number, ) {
        this.entities.push(new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY));
    }

    /**
     * Descarta todas las entidades almacenadas y vuelve a ejecutar el evento del primer fotograma.
     */
    public flush() {
        this.entities = [];
        this.onFirstFrame.dispatch();
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
     * Elimina todo lo que haya dibujado en el canvas
     */
    private clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Ordena las entidades para ordenarlas correctamente. Se ordenan primero por capa, luego por coordenada Y, y por
     * último por coordenada X. Lo hacemos así porque los tiles deberían renderizarse por filas, no por columnas.
     */
    private sortEntities() {
        this.entities.sort((e1, e2) =>
            e1.renderLayer != e2.renderLayer ? e1.renderLayer - e2.renderLayer :
            e1.y != e2.y ? e1.y - e2.y :
            e1.x - e2.x
        );
    }
}