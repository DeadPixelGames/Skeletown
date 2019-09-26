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
                request.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            resolve(request.response);
                        }
                        else {
                            throw new Error("No se ha podido cargar el archivo " + path + ". Código de error: " + this.status);
                        }
                    }
                };
                request.open("GET", path, true);
                request.send();
            });
        });
    }
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