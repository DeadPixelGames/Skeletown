var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Clase estática auxiliar para cargar archivos del juego. Es necesario
 * ejecutar el programa en un servidor para poder usarla. Las direcciones
 * de los archivos parten de la raíz del proyecto.
 */
export default class FileLoader {
    /**
     * Carga un objeto a partir de un archivo JSON.
     */
    static loadJSON(path) {
        return __awaiter(this, void 0, void 0, function* () {
            var ret = yield FileLoader.loadRawFile(path);
            return JSON.parse(ret);
        });
    }
    /**
     * Carga la imagen indicada como elemento del DOM.
     */
    static loadImage(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loadMedia(path, "img");
        });
    }
    /**
     * Carga el audio especificado.
     */
    static loadAudio(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Audio(path);
        });
    }
    //#region Funciones auxiliares
    /**
     * Carga en datos crudos el contenido de un archvio especificado
     * utilizando API Rest. El contenido devuelto debe procesarse más
     * a fondo para poder utilizarse en el programa.
     */
    static loadRawFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            var request = new XMLHttpRequest();
            // Los eventos asociados a la petición los realizamos en
            // la promesa para poder cargar el contenido asíncronamente
            return new Promise((resolve) => {
                // Asignamos, ya dentro de la promesa para poder cargar
                // el archivo asíncronamente, el evento que se encargará
                // de gestionar los cambios de estado de la petición
                request.onreadystatechange = function () {
                    // Cuando el proceso de la petición haya terminado
                    if (this.readyState == 4) {
                        // Si ha cargado el archivo correctamente, resolvemos
                        // la promesa con los datos
                        if (this.status == 200) {
                            resolve(request.response);
                            // Si no, lanzamos el error producido
                        }
                        else {
                            throw new Error("No se ha podido cargar el archivo " + path + ". Código de error: " + this.status);
                        }
                    }
                };
                // Lanzamos la petición. La lanzamos después de asignar el
                // evento para no arriesgarnos a que la petición cambie de
                // estado antes de que nosotros asignemos el evento
                request.open("GET", path, true);
                request.send();
            });
        });
    }
    /**
     * Carga elementos multimedia y los almacena cono elementos del DOM.
     * Los elementos cargados no aparecerán en el documento a menos que
     * se agreguen explícitamente.
     * @param path La ruta donde se encuentra el archivo a cargar
     * @param tag La etiqueta HTML que el elemento lleva asociada
     */
    static loadMedia(path, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            var element = document.createElement(tag);
            element.setAttribute("src", path);
            return new Promise((resolve) => {
                element.onload = function () {
                    resolve(element);
                };
            });
        });
    }
}
//# sourceMappingURL=fileloader.js.map