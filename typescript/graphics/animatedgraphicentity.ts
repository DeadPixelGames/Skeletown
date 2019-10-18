import GraphicEntity from "./graphicentity.js";
import FileLoader from "../fileloader.js";

/**
 * Directorio donde se almacenan los jsons que representan las animaciones, partiendo de la raíz del
 * servidor. No es necesario añadir '/' al principio ni al final.
 */
const ANIMATIONS_JSON_FOLDER = "animation/jsons";

/**
 * Entidad gráfica que contiene varios clips y varios fotogramas que puede reproducir a modo de animación.
 */
export default class AnimatedGraphicEntity extends GraphicEntity {
    /**
     * Lista de clips de la entidad.
     */
    private clips :Map<string, ClipData | DirectionalClipData>;
    /**
     * Duración en segundos del fotograma.
     */
    private frameduration :number;
    /**
     * Factor que afecta a la duración del fotograma para cambiar la velocidad de la animación.
     */
    private durationfactor :number;
    /**
     * Fotograma actual del clip actual.
     */
    private currentframe :number;
    /**
     * Tiempo en segundos transcurrido en el fotograma actual.
     */
    private currentframetime :number;
    /**
     * Clip actual de la animación.
     */
    private currentclip :string;
    /**
     * Si la animación está en pausa o no.
     */
    private paused :boolean;
    /**
     * Factor que escala la velocidad de algunas animaciones para coincidir con la velocidad de
     * movimiento de la entidad.
     */
    private walkAnimFactor :number;
    /**
     * Dirección a la que apunta esta entidad.
     */
    private direction :"up" | "down" | "left" | "right";

    /**
     * El constructor de esta clase es privado. Utiliza `AnimatedGraphicEntity.load(jsonFile)` en su lugar.
     */
    private constructor(source :HTMLImageElement) {
        super(0, source);
        this.clips = new Map();
        this.frameduration = 0;
        this.durationfactor = 1;
        this.currentclip = "";
        this.currentframe = 0;
        this.currentframetime = 0;
        this.walkAnimFactor = 1;
        this.paused = false;
        this.direction = "down";
    }

    /**
     * Genera una entidad gráfica animada a partir del archivo JSON especificado.
     */
    public static async load(jsonFile :string) {

        // Empezamos cargando la información del JSON
        var animData = await FileLoader.loadJSON(ANIMATIONS_JSON_FOLDER + "/" + jsonFile) as AnimationData; 
        
        // Con la información básica que tenemos, ya podemos generar la entidad gráfica con la fuente y el pivote indicados
        // en el archivo
        var ret = new AnimatedGraphicEntity(await FileLoader.loadImage(ANIMATIONS_JSON_FOLDER + "/" + animData.source));
        ret.setPivot(animData.pivotX, animData.pivotY);
        if(animData.walkAnimFactor) {
            ret.walkAnimFactor = animData.walkAnimFactor;
        } else {
            ret.walkAnimFactor = 1;
        }

        // En el archivo leído, la duración de los fotogramas viene especificada indirectamente a través del framerate
        ret.frameduration = 1 / animData.framerate;

        // Ya podemos cargar los clips
        ret.loadClips(animData);

        // Información predeterminada
        ret.currentclip = animData.clips[0].id.toLowerCase();
        var defaultclip = (ret.clips.get(ret.currentclip) as ClipData | DirectionalClipData);
        if(defaultclip.isDirectional) {
            ret.currentframe = defaultclip.down.pause ? defaultclip.down.pause : 0;
            ret.section = defaultclip.down.frames[ret.currentframe];
        } else {
            ret.currentframe = defaultclip.pause ? defaultclip.pause : 0;
            ret.section = defaultclip.frames[ret.currentframe];
        }
        return ret;
    }

    /**
     * Reproduce el clip especificado en esta entidad.
     */
    public play(clip :string) {
        // Lo primero es garantizar que el clip especificado existe en la animación. Si no, lanzamos un error
        var lowercaseclip = clip.toLowerCase();
        if(!this.clips.has(lowercaseclip)) {
            throw new Error("La animación no tiene ningún clip llamado " + clip + ".");
        }

        // También podemos tener en cuenta el caso en el que se le ordena reproducir el clip que ya está
        // reproduciendo, en cuyo caso no hacemos nada.
        if(lowercaseclip == this.currentclip) {
            return;
        }

        // Y si sí existe, preparamos el estado de la entidad para reproducir la animación
        this.currentclip = lowercaseclip;
        this.currentframe = 0;
        this.currentframetime = 0;
    }

    /**
     * Pone en pausa la animación de la entidad. Si el clip actual tiene un fotograma de pausa, la entidad cambiará
     * a ese fotograma inmediatamente.
     */
    public pause() {
        this.paused = true;
    }

    /**
     * Reanuda la animación de la entidad.
     */
    public resume() {
        this.paused = false;
    }

    /**
     * La velocidad a la que se reproduce la animación.
     */
    public getSpeed() {
        return 1 / this.durationfactor;
    }

    /**
     * Cambia la velocidad a la que se reproduce la animación. La velocidad predeterminada es 1.
     */
    public setSpeed(speed :number) {
        var newfactor = 1 / speed;
        // this.currentframetime = this.currentframe *  newfactor / this.durationfactor;
        this.durationfactor = newfactor;
    }

    /**
     * Determina el factor con el que la velocidad de la animación se verá afectada por la
     * velocidad de movimiento de la entidad.
     */
    public getWalkAnimFactor() {
        return this.walkAnimFactor;
    }

    /**
     * Dado un punto en coordenadas locales a la entidad, asigna la dirección correcta para
     * los clips direccionales de esta animación.
     */
    public setDirection(x :number, y :number) {
        var ret :"up" | "down" | "left" | "right";

        if(Math.abs(x) > Math.abs(y)) {
            if(x < 0) {
                ret = "left";
            } else {
                ret = "right";
            }
        } else {
            if(y < 0) {
                ret = "up";
            } else {
                ret = "down";
            }
        }

        this.direction = ret;
    }

    protected update(deltaTime :number) {
        // Cogemos del mapa la información del clip para no tener que leer el mapa constantemente.
        var playingClip = this.clips.get(this.currentclip) as ClipData | (DirectionalClipData & Indexable<PartialClipData>);
        
        var frames :Section[];
        var flip :boolean;
        var pause :number | null;
        var transition :AnimationTransition;

        if(!playingClip.isDirectional) {
            frames = playingClip.frames;
            flip = playingClip.flip;
            pause = playingClip.pause;
            transition = playingClip.transition
        } else {
            frames = playingClip[this.direction].frames;
            flip = playingClip[this.direction].flip;
            pause = playingClip[this.direction].pause;
            transition = playingClip.transition;
        }

        // Si estamos en pausa, no actualizamos los fotogramas, y ponemos el fotograma de pausa si existe.
        if(this.paused) {
            if(pause != null) {
                this.currentframe = pause;
            }

        // Si no estamos en pausa, contamos el tiempo que llevamos en el actual fotograma, pasamos al
        // siguiente fotograma si es necesario, o ejecutamos la transición del final del clip si es necesario.
        } else {
            if(this.currentframetime > this.frameduration * this.durationfactor) {
                if(this.currentframe >= frames.length - 1) {
                    this.executeTransition(transition);
                } else {
                    this.currentframe += 1;
                }
                this.currentframetime -= this.frameduration * this.durationfactor;
            }
            
            this.currentframetime += deltaTime;
        }

        // Marcamos el fotograma actual como sección a dibujar de la entidad gráfica
        this.section = frames[this.currentframe];
        this.flipped = flip;

        super.update(deltaTime);
    }

    /**
     * Genera los datos de clips que podemos utilizar en el programa a raíz de un archivo leído.
     */
    private loadClips(animData :AnimationData) {
        
        // Para cada clip, calculamos la sección equivalente a cada fotograma especificado en el archivo, y lo
        // añadimos a la colección de secciones asociadas a este clip. Estas secciones las iremos alternando
        // periódicamente para que la entidad gráfica renderice los fotogramas correctos para la animación
        for(let clip of animData.clips) {
            
            // Si el clip que estamos leyendo es direccional
            if(AnimatedGraphicEntity.clipIsDirectional(clip)) {
                
                let directional = clip as DirectionalClip & Indexable<PartialAnimationClip>;

                // Asignamos las propiedades independientemente de las direcciones
                // Es necesario tener el ibjeto ya preparado para añadirle los clips parciales
                // de cada una de las direcciones
                let clipdata = {
                    transition: clip.after ? clip.after : "stop",
                    isDirectional: true
                } as DirectionalClipData & Indexable<PartialClipData>;

                // Para cada dirección, asignamos sus fotogramas al clip
                for(let dir of ["up", "down", "left", "right"]) {
                    let sections = [];

                    for(let frame of directional[dir].frames) {
                        sections.push({
                            x: frame[1] * animData.framewidth,
                            y: frame[0] * animData.frameheight,
                            w: animData.framewidth,
                            h: animData.frameheight
                        });
                    }
                    
                    // Con los frames de esta dirección ya calculados, procedemos a introducir los
                    // datos que sí dependen de la animación
                    clipdata[dir] = {
                        frames: sections,
                        pause: directional[dir].pause != null ? directional[dir].pause : null,
                        flip: directional[dir].flip != null ? directional[dir].flip : false,
                    };
                }

                // El clip ya está cargado, lo añadimos al mapa
                this.clips.set(directional.id, clipdata);
            
            } else {

                // En este caso, el clip no es direccional, por lo que podemos cargar los fotogramas
                // directamente al mapa, sin iterar por direcciones

                let anim = clip as AnimationClip;
                
                let sections = [];

                for(let frame of anim.frames) {
                    sections.push({
                        x: frame[1] * animData.framewidth,
                        y: frame[0] * animData.frameheight,
                        w: animData.framewidth,
                        h: animData.frameheight
                    });
                }

                this.clips.set(anim.id, {
                    frames: sections,
                    transition: anim.after ? anim.after : "stop",
                    pause: anim.pause != null ? anim.pause : null,
                    flip: anim.flip != null ? anim.flip : false,
                    isDirectional: false,
                });                
            }
        }
    }

    /**
     * Ejecuta la instrucción especificada como transición en los datos de la animación.
     */
    private executeTransition(transition :AnimationTransition) {

        if(typeof transition == "string") {

            switch(transition) {
                // stop: No hacer nada
                case "stop":
                    break;
                // repeat: Volver a empezar desde el primer fotograma
                case "repeat":
                    this.currentframe = 0;
                    break;
            }
        
        // {goto: "clip"}: Pasar a reproducir el clip indicado desde el principio
        } else if(transition.goto) {
            let nextclip = transition.goto.toLowerCase();
            if(!this.clips.has(nextclip)) {
                throw new Error("La animación no tiene ningún clip llamado " + nextclip + ".");
            }
            this.currentclip = nextclip;
            this.currentframe = 0;
        }
    }

    /**
     * Devuelve si un clip leído del archivo es direccional o no. Para que un clip sea direccional, debe tener
     * las propiedades `up`, `down`, `left` y `right` definidas. Si no tiene ninguna de las cuatro, entonces no
     * es direccional. No está permitido que estén definidas algunas direcciones pero no otras.
     */
    private static clipIsDirectional(clip :AnimationClip | DirectionalClip) {
        var ret = false;
        var directional = clip as DirectionalClip;

        if(directional.up || directional.down || directional.left || directional.right) {
            ret = true;
        }

        if(ret) {
            if(!directional.up || !directional.down || !directional.left || !directional.right) {
                throw new Error("Se ha detectado que este clip es direccional, pero no tiene todas las direcciones.");
            }
        }

        return ret;
    }
}

/**
 * Sección de la imagen de fuente para usar como sprite.
 */
type Section = {
    x :number,
    y :number,
    w :number,
    h :number
};

/**
 * Datos procesados de una animación.
 */
type ClipData = {
    frames :Section[],
    transition :AnimationTransition,
    pause :number | null,
    flip :boolean,
    isDirectional :false
};

/**
 * Datos procesados de una animación direccional.
 */
type DirectionalClipData = {
    up :PartialClipData,
    down :PartialClipData,
    left :PartialClipData,
    right :PartialClipData,
    transition :AnimationTransition,
    isDirectional :true
};

/**
 * Datos procesados de una animación pensados para usarse en otra estructura.
 */
type PartialClipData = {
    frames :Section[],
    pause :number | null,
    flip :boolean,
};

/**
 * Permite acceder a las propiedades de un objeto mediante el accesor de corchetes.
 */
type Indexable<T> = {[key :string] :T};