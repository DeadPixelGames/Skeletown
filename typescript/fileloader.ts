/**
 * Clase estática auxiliar para cargar archivos del juego. Es necesario
 * ejecutar el programa en un servidor para poder usarla. Las direcciones
 * de los archivos parten de la raíz del proyecto.
 */
export default class FileLoader {

    /**
     * Carga un objeto a partir de un archivo JSON.
     */
    public static async loadJSON(path :string) {
        var ret = await FileLoader.loadRawFile(path);
        return JSON.parse(ret) as object;
    }

    /**
     * Carga la imagen indicada como elemento del DOM.
     */
    public static async loadImage(path :string) {
        return this.loadMedia<HTMLImageElement>(path, "img");
    }
    
    /**
     * Carga un buffer que representa el audio especificado.
     */
    public static async loadAudio(context :AudioContext, path :string) {

        var response = await FileLoader.loadRawFile(path, "arraybuffer") as ArrayBuffer;
        return context.decodeAudioData(response);
    }

    //#region Funciones auxiliares

    /**
     * Carga en datos crudos el contenido de un archvio especificado
     * utilizando API Rest. El contenido devuelto debe procesarse más
     * a fondo para poder utilizarse en el programa.
     */
    private static async loadRawFile(path :string, type :XMLHttpRequestResponseType = "") {
        
        var request = new XMLHttpRequest();

        // Los eventos asociados a la petición los realizamos en
        // la promesa para poder cargar el contenido asíncronamente
        return new Promise<any>(resolve => {
            
            // Asignamos, ya dentro de la promesa para poder cargar
            // el archivo asíncronamente, el evento que se encargará
            // de gestionar los cambios de estado de la petición
            request.onreadystatechange = function() {
                // Cuando el proceso de la petición haya terminado
                if(this.readyState == 4) {
                    // Si ha cargado el archivo correctamente, resolvemos
                    // la promesa con los datos
                    if(this.status == 200) {
                        resolve(request.response);

                    // Si no, lanzamos el error producido
                    } else {
                        throw new Error("No se ha podido cargar el archivo " + path + ". Código de error: " + this.status);
                    }
                }
            }

            // Lanzamos la petición. La lanzamos después de asignar el
            // evento para no arriesgarnos a que la petición cambie de
            // estado antes de que nosotros asignemos el evento
            request.open("GET", path, true);
            request.responseType = type;
            request.send();
        });
    }

    /**
     * Carga elementos multimedia y los almacena cono elementos del DOM.
     * Los elementos cargados no aparecerán en el documento a menos que
     * se agreguen explícitamente.
     * @param path La ruta donde se encuentra el archivo a cargar
     * @param tag La etiqueta HTML que el elemento lleva asociada
     */
    private static async loadMedia<E extends HTMLElement>(path :string, tag :string) {
        var element = document.createElement(tag) as E;
        element.setAttribute("src", path);
        
        return new Promise<E>((resolve) => {
            element.onload = function() {
                resolve(element);
            }
        });
    }
    //#endregion
}