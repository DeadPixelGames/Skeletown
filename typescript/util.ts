import AreaMap from "./graphics/areamap.js";

//#region Random
/** Devuelve un número aleatorio entre `min` (inclusivo) y `max` (exclusivo) */
export function random(min :number, max :number) {
    return Math.random() * (max - min) + min;
}

/** Devuelve un número entero aleatorio entre `min` (inclusivo) y `max` (exclusivo) */
export function randomInt(min :number, max :number) {
    var flooredMin = Math.floor(min);
    var flooredMax = Math.floor(max);
    return Math.floor(Math.random() * (flooredMax - flooredMin) + flooredMin);
}
//#endregion

//#region Otras funciones
/** Devuelve el `value` especificado, limitándolo al rango marcado por `min` y `max`. */
export function clamp(value :number, min :number, max :number) {
    return Math.min(max, Math.max(min, value));
}

/** Devuelve la distancia entre los puntos indicados por (`x1`, `y1`) y (`x2`, `y2`) */
export function distance(x1 :number, y1 :number, x2 :number, y2 :number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/** Devuelve el tile al que pertenece el punto (`x`, `y`)  */
export function pixelToTilePosition(x :number, y :number) {
    var tile = AreaMap.getCurrent().getTileSize();
    return {
        x: Math.floor(x / tile.width),
        y: Math.floor(y / tile.height)
    };
}

/** Devuelve el punto del centro del tile (`x`, `y`) */
export function tileToPixelPosition(x :number, y :number) {
    var tile = AreaMap.getCurrent().getTileSize();
    return {
        x: tile.width * (x + 0.5),
        y: tile.height * (y + 0.5)
    };
}
//#endregion

//#region Array
Array.prototype.pickRandom = function<T>(weights? :number[]) {
    
    // Si los pesos no se indican, entonces todos los elementos tienen la misma probabilidad de salir
    if(!weights) {
        return this[randomInt(0, this.length)];
    }

    // Comprobamos que el array de pesos tenga la misma longitud que este array
    if(this.length != weights.length) {
        throw new Error("El array de pesos debe tener el mismo número de elementos que el array objetivo. Hay " + this.length + " elementos y " + weights.length + " pesos.");
    }

    // Elegimos un número al azar entre 0 y la suma de todos los pesos
    var sum = 0;
    // Tratamos cualquier peso negativo como 0 para evitar cualquier posible error
    weights.forEach(w => sum += Math.max(0, w));
    // Si la suma total es 0, entonces todos los pesos son 0. Esta posibilidad no está contemplada
    if(sum == 0) {
        throw new Error("Todos los pesos son cero o negativos");
    }
    var randomNumber = random(0, sum);


    // Descartamos los pesos en order mientras el número elegido sea más grande que ellos, pero le restamos el valor del peso al número.
    // Hay que llevar un contador con la cantidad de pesos que hemos descartado
    var counter = 0;
    while(counter < weights.length && randomNumber >= weights[counter]) {
        randomNumber -= weights[counter];
        counter += 1;
    }

    // Devuelve el elemento asociado con el peso actualmente seleccionado, según indica el contador.
    // Return the element associated with the currently selected weight, as indicated by the counter
    return this[counter];
}

Array.prototype.contains = function<T>(elem :T) {
    return this.indexOfArray(elem) != -1;
}

Array.prototype.remove = function<T>(elem :T) {
    var success = false;
    var indexToRemove = this.indexOfArray(elem);
    if(indexToRemove >= 0) {
        this.splice(indexToRemove, 1);
        success = true;
    }
    return success;
}

Array.prototype.subtract = function<T>(other :T[]) {
    other.forEach(o => this.remove(o));
    return this;
}

Array.prototype.indexOfArray = function<T>(other :T) {
    var ret = -1;
    if(!Array.isArray(other)) {
        ret = this.indexOf(other);
    } else {
        for(let i = 0; i < this.length; i++) {
            if(other.equals(this[i])) {
                ret = i;
                break;
            }
        }
    }
    return ret;
}

Array.prototype.clone = function<T>() {
    var ret :T[] = [];
    (this as T[]).forEach(e => ret.push(e));
    return ret;
}

Array.prototype.equals = function<T>(other :T[], orderMatters :boolean = true) {
    // Comprobamos si los dos arrays tienen la misma longitud
    // Si no la tienen, no son iguales
    if(this.length != other.length || !Array.isArray(other)) {
        return false;
    }

    var ret = true;
    var self = this as T[];

    if(orderMatters) {
    // Si el orden importa, basta con comprobar todos los pares de elementos. Si los dos arrays son
    // iguales incluyendo el orden, entonces todos los elementos iguales deben estar en las mismas posiciones
        for(let i = 0; i < self.length; i++) {
            if(self[i] != other[i]) {
                ret = false;
            }
        }

    } else {
    // Si el orden no importa, comprueba si este array contiene todos los elementos del otro array y viceversa
        for(let selfElement of self) {
            if(!other.contains(selfElement)) {
                ret = false;
                break;
            }
        }

        if(ret) {
            for(let otherElement of other) {
                if(!self.contains(otherElement)) {
                    ret = false;
                    break;
                }
            }
        }
    }

    // Devuelve el resultado
    return ret;
}
//#endregion

//#region Map
Map.prototype.getKeySet = function<K, V>() {
    return Array.from(this.keys());
}

Map.prototype.getValueSet = function<K, V>() {
    return Array.from(this.values());
}
//#endregion

