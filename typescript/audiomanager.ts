import FileLoader from "./fileloader.js";
import { sleep } from "./util.js";

/**
 * Directorio a partir del cual leer las rutas para los archivos de audio, partiendo de la raíz del proyecto.
 * No es necesario incluir '/' al principio ni al final.
 */
const AUDIO_FOLDER = "resources/audio";
/**
 * Constante de tiempo utilizada en las transiciones para desvanecer la música. Ver https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime
 * para más información.
 */
const MUSIC_FADE_TIME_CONSTANT = 0.3;
/**
 * Tiempo en segundos a esperar entre que se termina el desvanecimiento de una música y empieza la siguiente.
 */
const MUSIC_TRANSITION_WAIT = 0.6;

/**
 * Clase singleton que permite reproducir sonido y música en el juego. Se puede acceder a sus métodos mediante `AudioManager.instance`.
 */
export default class AudioManager {
    //#region Singleton
    private static _instance :AudioManager;

    /** La instancia única de esta clase singleton. */
    public static get instance() {
        return this._instance;
    }

    /** Inicia el patrón singleton, o lanza un error si ya hay otra instancia de esta clase en funcionamiento. */
    private static initSingleton(instance :AudioManager) {
        // Si la instancia singleton de esta clase ya es la actual, no hacemos nada
        if(AudioManager._instance == instance) {
            return;
        }
        // Pero si es otra, ha habido un problema y hay que lanzar un error
        if(AudioManager._instance) {
            throw new Error("Ya hay otra instancia de " + this.name + " en funcionamiento.");
        } else {
            // Y si no, es la primera vez que iniciamos este singleton y vamos a usar la instancia actual
            this._instance = instance;
        }
    }
    //#endregion

    /**
     * Contexto que permite reproducir el audio a través del navegador.
     */
    private context :AudioContext | null;
    /**
     * Buffers que contienen los datos de los sonidos a reproducir. Se almacenan para no tener que cargarlos cada vez.
     */
    private buffers :Map<string, AudioBuffer>;
    /**
     * Nodos que utiliza la música que se está reproduciendo. Guardamos referencias a estos nodos porque es necesario
     * acceder a ellos varias veces (primero para iniciar la música, luego para detenerla).
     */
    private playingMusicInfo :{
        name :string,
        source :AudioBufferSourceNode,
        gain :GainNode
    } | null;

    /** El constructor de esta clase es privado, usa `AudioManager.initInstance` en su lugar. */
    private constructor() {
        this.context = null;
        this.buffers = new Map();
        this.playingMusicInfo = null;
    }

    /**
     * Inicia la instancia del AudioManager para la sesión. Esta acción NO inicializa el AudioContext; este debe ser
     * activado independientemente mediante `AudioManager.instance.activateContext()`.
     */
    public static initInstance() {
        var ret = new AudioManager();
        AudioManager.initSingleton(ret);
        return ret;
    }

    /**
     * Activa el AudioContext para poder reproducir sonido usando el navegador, si no estaba activado ya. Este método
     * sólo puede ejecutarse a través de un evento de interacción del usuario, debido a la especificación de AudioContext.
     */
    public activateContext() {
        if(!this.context) {
            this.context = new AudioContext();
        }
    }

    /**
     * Devuelve si el AudioContext ha sido activado ya o no.
     */
    public contextIsActive() {
        return this.context != null;
    }

    /**
     * Crea un buffer con la información del audio leído. El nombre asignado permite reproducir el audio más adelante mediante
     * `playSound()` o `playMusic()`. La ruta parte del valor de `AUDIO_FOLDER`. Para poder cargar el audio, es necesario
     * que el AudioContext esté activo.
     */
    public async load(name :string, path :string) {
        if(!this.context) {
            throw new Error("El AudioContext no ha sido activado todavía.");
        }

        var buffer = await FileLoader.loadAudio(this.context, AUDIO_FOLDER + "/" + path);
        this.buffers.set(name.toLowerCase(), buffer);
    }

    /**
     * Reproduce una sola vez el audio cargado previamente con el nombre indicado. El AudioContext debe estar activado para
     * poder reproducir un audio.
     */
    public playSound(name :string) {
        // Comprobamos los errores que puedan surgir
        if(!this.context) {
            throw new Error("El AudioContext no ha sido activado todavía.");
        }
        if(!this.buffers.has(name.toLowerCase())) {
            throw new Error("No se ha cargado ningún sonido con el nombre \"" + name + "\".");
        }

        // Cargamos el buffer del audio y lo reproducimos. Es necesario hacer esto cada vez porque cada nodo BufferSource
        // sólo puede reproducirse una vez
        var source = this.context.createBufferSource();
        source.buffer = this.buffers.get(name.toLowerCase()) as AudioBuffer;
        source.connect(this.context.destination);
        source.start(0);
    }

    /**
     * Reproduce en bucle el audio cargado previamente con el nombre indicado. Este audio debería ser un tema musical, y
     * reemplazará al tema musical que estuviera sonando previamente. Opcionalmente se puede especificar el volumen, en
     * tanto por 1, que se usará para reproducir el audio. Si el audio indicado ya está sonando, no se reiniciará, pero
     * usará el nuevo volumen especificado. El AudioContext debe estar activado para poder reproducir un audio.
     */
    public async playMusic(name :string, volume :number = 1) {
        // Comprobamos los errores que puedan surgir
        if(!this.context) {
            throw new Error("El AudioContext no ha sido activado todavía.");
        }
        var lowercaseName = name.toLowerCase();
        if(!this.buffers.has(lowercaseName)) {
            throw new Error("No se ha cargado ningún tema con el nombre \"" + name + "\"");
        }

        // Si el tema seleccionado ya está sonando, le asignamos el nuevo volumen, pero no hacemos nada más.
        if(this.playingMusicInfo && this.playingMusicInfo.name == lowercaseName) {
            this.playingMusicInfo.gain.gain.setValueAtTime(volume, this.context.currentTime);
            return;
        }

        // Si no, paramos el tema anterior antes de reproducir el actual
        if(this.playingMusicInfo) {
            await this.stopMusic();
        }

        // El nodo BufferSource se conecta al sonido del navegador por medio de un nodo de ganancia, que permite
        // modificar el volumen al que se reproduce el tema. Tenemos que hacer esto cada vez que reproduzcamos un audio
        // porque los nodos BufferSource sólo pueden reproducirse una vez
        var source = this.context.createBufferSource();
        source.buffer = this.buffers.get(lowercaseName) as AudioBuffer;
        source.loop = true;
        var gain = this.context.createGain();
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        source.connect(gain);
        gain.connect(this.context.destination);
        source.start(0);

        // Almacenamos referencias a los nodos utilizados para poder acceder a ellos más adelante. Por ejemplo, querremos
        // acceder al nodo de ganancia para cambiar el volumen del tema a posteriori
        this.playingMusicInfo = {
            name: lowercaseName,
            source: source,
            gain: gain
        };
    }

    /**
     * Detiene el tena que estuviera sonando en bucle. Es necesario que el AudioContext esté activado para poder hacer esto.
     */
    public async stopMusic() {
        if(!this.context) {
            throw new Error("El AudioContext no ha sido activado todavía.");
        }

        // Si hay información de la música que se está reproduciendo, desvanecemos el volumen usando la constante de tiempo
        // especificada, esperamos a que termine, y detenemos formalmente la reproducción
        if(this.playingMusicInfo) {
            this.playingMusicInfo.gain.gain.setTargetAtTime(0, this.context.currentTime, MUSIC_FADE_TIME_CONSTANT);
            await sleep((MUSIC_FADE_TIME_CONSTANT + MUSIC_TRANSITION_WAIT) * 1000);
            this.playingMusicInfo.source.stop();
        }

        // Ya no hay ningún tema reproduciéndose
        this.playingMusicInfo = null;
    }
}