var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
     * El constructor de esta clase es privado. Utiliza `AnimatedGraphicEntity.load(jsonFile)` en su lugar.
     */
    constructor(source) {
        super(0, source);
        this.clips = new Map();
        this.frameduration = 0;
        this.currentclip = "";
        this.currentframe = 0;
        this.currentframetime = 0;
        this.paused = false;
    }
    /**
     * Genera una entidad gráfica animada a partir del archivo JSON especificado.
     */
    static load(jsonFile) {
        return __awaiter(this, void 0, void 0, function* () {
            // Empezamos cargando la información del JSON
            var animData = yield FileLoader.loadJSON(ANIMATIONS_JSON_FOLDER + "/" + jsonFile);
            // Con la información básica que tenemos, ya podemos generar la entidad gráfica con la fuente y el pivote indicados
            // en el archivo
            var ret = new AnimatedGraphicEntity(yield FileLoader.loadImage(ANIMATIONS_JSON_FOLDER + "/" + animData.source));
            ret.setPivot(animData.pivotX, animData.pivotY);
            // En el archivo leído, la duración de los fotogramas viene especificada indirectamente a través del framerate
            ret.frameduration = 1 / animData.framerate;
            // Ya podemos cargar los clips y devolver la entidad animada
            ret.loadClips(animData);
            return ret;
        });
    }
    /**
     * Reproduce el clip especificado en esta entidad.
     */
    play(clip) {
        // Lo primero es garantizar que el clip especificado existe en la animación. Si no, lanzamos un error
        var lowercaseclip = clip.toLowerCase();
        if (!this.clips.has(lowercaseclip)) {
            throw new Error("La animación no tiene ningún clip llamado " + clip + ".");
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
    pause() {
        this.paused = true;
    }
    /**
     * Reanuda la animación de la entidad.
     */
    resume() {
        this.paused = false;
    }
    update(deltaTime) {
        // Cogemos del mapa la información del clip para no tener que leer el mapa constantemente.
        var playingClip = this.clips.get(this.currentclip);
        // Si estamos en pausa, no actualizamos los fotogramas, y ponemos el fotograma de pausa si existe.
        if (this.paused) {
            if (playingClip.pause != null) {
                this.currentframe = playingClip.pause;
            }
            // Si no estamos en pausa, contamos el tiempo que llevamos en el actual fotograma, pasamos al
            // siguiente fotograma si es necesario, o ejecutamos la transición del final del clip si es necesario.
        }
        else {
            if (this.currentframetime > this.frameduration) {
                if (this.currentframe >= playingClip.frames.length - 1) {
                    this.executeTransition(playingClip.transition);
                }
                else {
                    this.currentframe += 1;
                }
                this.currentframetime -= this.frameduration;
            }
            this.currentframetime += deltaTime;
        }
        // Marcamos el fotograma actual como sección a dibujar de la entidad gráfica
        this.section = playingClip.frames[this.currentframe];
        this.flipped = playingClip.flip;
        super.update(deltaTime);
    }
    /**
     * Genera los datos de clips que podemos utilizar en el programa a raíz de un archivo leído.
     */
    loadClips(animData) {
        // Para cada clip, calculamos la sección equivalente a cada fotograma especificado en el archivo, y lo
        // añadimos a la colección de secciones asociadas a este clip. Estas secciones las iremos alternando
        // periódicamente para que la entidad gráfica renderice los fotogramas correctos para la animación
        for (let clip of animData.clips) {
            let sections = [];
            for (let frame of clip.frames) {
                sections.push({
                    x: frame[1] * animData.framewidth,
                    y: frame[0] * animData.frameheight,
                    w: animData.framewidth,
                    h: animData.frameheight
                });
            }
            // Rellenamos datos predeterminados en caso de que el archivo no los especifique
            if (!clip.after) {
                clip.after = "stop";
            }
            if (!clip.flip) {
                clip.flip = false;
            }
            if (clip.pause == null) {
                clip.pause = null;
            }
            // Almacenamos todos los datos leídos en el mapa, asociados al id de la animación
            this.clips.set(clip.id.toLowerCase(), {
                frames: sections,
                transition: clip.after,
                pause: clip.pause,
                flip: clip.flip
            });
        }
    }
    /**
     * Ejecuta la instrucción especificada como transición en los datos de la animación.
     */
    executeTransition(transition) {
        if (typeof transition == "string") {
            switch (transition) {
                // stop: No hacer nada
                case "stop":
                    break;
                // repeat: Volver a empezar desde el primer fotograma
                case "repeat":
                    this.currentframe = 0;
                    break;
            }
            // {goto: "clip"}: Pasar a reproducir el clip indicado desde el principio
        }
        else if (transition.goto) {
            let nextclip = transition.goto.toLowerCase();
            if (!this.clips.has(nextclip)) {
                throw new Error("La animación no tiene ningún clip llamado " + nextclip + ".");
            }
            this.currentclip = nextclip;
            this.currentframe = 0;
        }
    }
}
//# sourceMappingURL=animatedgraphicentity.js.map