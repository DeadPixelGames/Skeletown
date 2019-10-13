var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { pixelToTilePosition, tileToPixelPosition } from "./util.js";
import AreaMap from "./graphics/areamap.js";
import GameEvent from "./gameevent.js";
/**
 * Ruta inteligente trazada desde la posición actual de una entidad hasta un punto dado
 * en la sala, esquivando todos los tiles sólidos, implementada con el algoritmo A*
 */
export default class AIPath {
    constructor(entity, destination) {
        this.entity = entity;
        this.destination = destination;
        this.onGenerated = new GameEvent();
        // Al crear la ruta, la empezamos a generar inmediatamente
        this.recalculate(destination);
    }
    /**
     * Devuelve el siguiente punto en la ruta, o el último si no quedan más
     */
    next() {
        // Si queda más de un punto, sacamos el que estuviera al frente
        if (this.points.length > 1) {
            this.points.shift();
        }
        // Y devolvemos el siguiente, que estará ahora al frente
        return this.points[0];
    }
    /**
     * Devuelve el punto de la ruta que es posterior al siguiente, o `null` si no hay.
     * Este método, a diferencia de `next()`, no consume el punto.
     */
    secondNext() {
        var ret = null;
        if (this.points.length > 2) {
            ret = this.points[1];
        }
        return ret;
    }
    /**
     * Indica si la ruta ha sido recorrida al completo, es decir, si mediante `next()` ya se
     * ha obtenido el último punto de la ruta, o si la ruta no tiene puntos en primer lugar
     * porque es imposible.
     */
    isDone() {
        return this.points.length <= 1;
    }
    /**
     * Indica si la ruta es imposible de recorrer. Esto puede pasar si el punto de destino
     * se encuentra dentro de un tile sólido o si está en una estancia a la que es imposible
     * acceder desde la posición en la que se encuentra la entidad.
     */
    isImpossible() {
        return this.points.length == 0;
    }
    /**
     * Vuelve a calcular los puntos de esta ruta para adaptarse al nuevo estado del mapa y los nuevos
     * puntos de origen y destino. La función es asíncrona porque la ruta puede tardar un poco en generarse.
     */
    recalculate(newDest) {
        return __awaiter(this, void 0, void 0, function* () {
            this.destination = newDest;
            this.points = [];
            this.generatePoints();
            // La ruta ya ha terminado de generarse, así que disparamos el evento
            this.onGenerated.dispatch();
        });
    }
    /**
     * Suscribe la instancia indicado para ejecutar un callback en un evento.
     * * `onGenerated` - Se dispara cuando la ruta ha terminado de generarse.
     */
    suscribe(instance, onGenerated) {
        if (onGenerated) {
            this.onGenerated.suscribe(instance, onGenerated);
        }
    }
    /**
     * Dibuja una línea verde que representa la ruta, para hacerla visible. Esta función es sólo
     * para depuración y no se va a usar en la versión final.
     */
    render(context, scrollX, scrollY) {
        // Si no hay nada que dibujar
        if (this.points.length == 0) {
            // Aquí no pintamos nada
            return;
        }
        // Si la entidad no tiene colisionador, no debería tener ruta
        var collider = this.entity.getCollider();
        if (!collider) {
            return;
        }
        // Comenzamos el trazado de la ruta
        context.beginPath();
        context.strokeStyle = "#FFBB00";
        // Empezamos en la posición de la entidad
        context.moveTo(collider.centerX - scrollX, collider.centerY - scrollY);
        // Y ahora dibujamos una línea a cada punto de la ruta
        for (let point of this.points) {
            context.lineTo(point.x - scrollX, point.y - scrollY);
        }
        // Ya podemos emitir el trazado
        context.stroke();
    }
    /**
     * Genera los puntos que componen esta ruta siguiendo el algoritmo A*
     */
    generatePoints() {
        // Si la entidad no tiene collider, no puede bscar una ruta
        if (!this.entity.getCollider()) {
            return;
        }
        var colliders = AreaMap.getCurrent().getColliders();
        var entityCollider = this.entity.getCollider();
        // Obtenemos el tile en el que empezamos y el tile al que vamos
        var destTile = pixelToTilePosition(this.destination.x, this.destination.y);
        var startTile = pixelToTilePosition(entityCollider.centerX, entityCollider.centerY);
        // Puede ser que el tile al que vamos sea sólido, en cuyo caso la ruta es imposible
        if (colliders.nondynamicCollisionAtPosition(this.destination.x, this.destination.y)) {
            console.warn("Atención, Ruta Imposible: "
                + "Una entidad ha intentado generar una ruta hacia el tile sólido situado en (%d, %d)", destTile.x, destTile.y);
            // ¿Para qué perder el tiempo intentando crear la ruta si ya sabemos que es imposible?
            return;
        }
        var astarmap = new Map();
        // También tenemos una cola donde añadiremos los tiles que hay que procesar. La
        // inicializamos con el tile inicial, que es por el que vamos a empezar.
        var tileQueue = [startTile];
        // También es buena idea añadir el tile inicial al mapa para que se pueda empezar
        // el procesamiento sin problemas.
        astarmap.set(this.toString(startTile), { value: 0, neighbours: [] });
        // Estaremos procesando tiles hasta que ya no queden más por procesar
        while (tileQueue.length > 0) {
            // Reordenamos la cola de tiles para que los que estén probablemente más cerca tengan prioridad para salir
            let that = this;
            tileQueue.sort((t1, t2) => that.getManhattanDistance(t1, destTile) - that.getManhattanDistance(t2, destTile));
            // Obtenemos los vecinos y los datos en el mapa del tile que estamos procesando
            // actualmente (el que está al frente de la cola)
            let neighbours = AIPath.getNeighbourTiles(tileQueue[0]);
            let currentTileData = astarmap.get(this.toString(tileQueue[0]));
            for (let neighbour of neighbours) {
                // Si el vecino no es sólido ni está todavía en el mapa
                var neighbourPixelCoords = tileToPixelPosition(neighbour.x, neighbour.y);
                if (!astarmap.has(this.toString(neighbour)) && !colliders.nondynamicCollisionAtPosition(neighbourPixelCoords.x, neighbourPixelCoords.y)) {
                    // Hay que añadirlo al mapa. Además, la relación de vecindad
                    // es recíproca y hay que indicarlo también.
                    astarmap.set(this.toString(neighbour), {
                        value: currentTileData.value + 1,
                        neighbours: [tileQueue[0]]
                    });
                    // El tile recién añadido al mapa no se ha procesado todavía. Lo
                    // procesaremos más tarde en el bucle.
                    tileQueue.push(neighbour);
                    // El mapa también tiene que tener constancia de los vecinos de este tile.
                    // La diferencia entre los vecinos obtenidos con Path.getNeighbourTiles()
                    // y los que estamos añadiendo ahora es que ahora estamos distinguiendo
                    // los que son sólidos de los que no.
                    currentTileData.neighbours.push(neighbour);
                }
            }
            // ¿El tile que acabamos de procesar es el tile al que teníamos que llegar?
            if (this.tilesAreEqual(tileQueue[0], destTile)) {
                // Si es así entonces esta etapa de la generación de la ruta ha terminado
                break;
            }
            else {
                // Si no, sacamos de la cola al tile que acabamos de procesar para que
                // pase el siguiente
                tileQueue.shift();
            }
        }
        // A lo mejor hemos salido del bucle anterior por haber vaciado la cola y no por haber
        // encontrado el tile de destino. Esto se debe a que la estancia donde está la entidad
        // y la estancia donde está el tile de destino están completamente separadas y aisladas
        // por tiles sólidos. En este caso, la ruta también es imposible.
        if (!this.tilesAreEqual(tileQueue[0], destTile)) {
            console.warn("Atención, Ruta Imposible: "
                + "Una entidad ha intentado generar una ruta hacia el tile (%d, %d) pero es inalcanzable "
                + "desde su posición actual", destTile.x, destTile.y);
            // No podemos hacer nada más
            return;
        }
        // Ahora que ya está el mapa trazado, tenemos que hacer el recorrido inverso: Desde el
        // tile de destino hasta la posición inicial. Lo haremos utilizando los valores que
        // hemos asignado previamente en el mapa. Esta es la etapa que genera los puntos realmente.
        var currentTile = destTile;
        var lastTile = destTile;
        var lastTileAux = destTile;
        // Vamos a estar generando puntos hasta que hayamos vuelto a la posición original,
        // aunque haremos al menos una iteración para que, si no es una ruta imposible,
        // haya al menos un punto en la misma para evitar errores.
        while (!this.tilesAreEqual(currentTile, startTile) || this.points.length == 0) {
            // Hay que añadir el punto de este tile. La lista de puntos está en píxeles, así
            // que hay que pasar el tile a píxeles antes de añadirlo. El punto de destino
            // está en píxeles también así que no hay que pasarlo a nada.
            let add;
            if (currentTile == destTile) {
                add = this.destination;
            }
            else {
                add = tileToPixelPosition(currentTile.x, currentTile.y);
            }
            // Metemos el nuevo punto al principio de la lista de puntos
            this.points.unshift(add);
            // Ahora vamos a consultar los datos de este tile para determinar cuál será el siguiente
            let currentTileData = astarmap.get(this.toString(currentTile));
            for (let neighbour of currentTileData.neighbours) {
                let neighbourData = astarmap.get(this.toString(neighbour));
                // Si el vecino que estamos mirando existe y su valor es menor que el tile actual,
                // es porque está más cerca del tile inicial que el actual
                if (neighbourData && neighbourData.value < currentTileData.value) {
                    // Y si además es adyacente al tile que miramos en la iteración anterior...
                    if (this.areDiagonallyAdjacent(lastTile, neighbour) && this.tilesAreEqual(currentTile, destTile)) {
                        // ... entonces no necesitamos tener el tile actual en la lista de puntos
                        // (salvo si es el tile de destino, por muy adyacente que sea)
                        this.points.shift();
                        // Pasamos a este vecino para la siguiente iteración
                        currentTile = neighbour;
                        break;
                    }
                    else {
                        // Ponemos a este vecino como posible tile de la siguiente iteración,
                        // pero seguimos mirando por si hay otro vecino que sí es adyacente
                        currentTile = neighbour;
                    }
                }
            }
            // Pero hay que guardar el tile que miramos en la iteración anterior para futuras
            // referencias relacionadas con la adyacencia
            lastTile = lastTileAux;
            lastTileAux = currentTile;
        }
    }
    /**
     * Devuelve los tiles en la capa de colisiones que son colindantes,
     * horizontal y verticalmente, al tile indicado.
     */
    static getNeighbourTiles(tile) {
        var areasize = AreaMap.getCurrent().getSize();
        var tilesize = AreaMap.getCurrent().getTileSize();
        var ret = [];
        if (tile == null) {
            return [];
        }
        var possibleNeighbours = [
            //// {x: tile.x-1, y: tile.y-1},
            { x: tile.x - 1, y: tile.y },
            //// {x: tile.x-1, y: tile.y+1},
            { x: tile.x, y: tile.y - 1 },
            { x: tile.x, y: tile.y + 1 },
            //// {x: tile.x+1, y: tile.y-1},
            { x: tile.x + 1, y: tile.y },
        ];
        // Antes de consultar si hay una colisión en el tile, hay que comprobar que
        // esté dentro de la sala
        for (let possibility of possibleNeighbours) {
            if (possibility.x >= 0 && possibility.x < areasize.width
                && possibility.y >= 0 && possibility.y < areasize.height) {
                ret.push({ x: possibility.x, y: possibility.y });
            }
        }
        return ret;
    }
    /**
     * Indica si dos tiles dados son adyacentes diagonalmente.
     */
    areDiagonallyAdjacent(tile1, tile2) {
        // Dos tiles son diagonalmente adyacentes si están separados por una distancia de una
        // unidad en ambos ejes. Si la distancia en cualquiera de los ejes fuera 0 ya no sería
        // una adyacencia diagonal, y si la distancia fuera más de 1 ya no sería una adyacencia.
        return Math.abs(tile1.x - tile2.x) == 1 && Math.abs(tile1.y - tile2.y) == 1;
    }
    /**
     * Devuelve la distancia Manhattan, en tiles, entre dos tiles.
     */
    getManhattanDistance(orig, dest) {
        return Math.abs(dest.x - orig.x) + Math.abs(dest.y - dest.y);
    }
    /**
     * Devuelve si dos tiles son iguales. Se usa porque no se pueden comparar dos tiles con el operador
     * de igualdad predeterminado.
     */
    tilesAreEqual(tile1, tile2) {
        return tile1 && tile2 && tile1.x == tile2.x && tile1.y == tile2.y;
    }
    /**
     * Devuelve en string las coordenadas enteras del tile. Para usar como clave en un mapa.
     */
    toString(tile) {
        return tile.x + ", " + tile.y;
    }
}
//# sourceMappingURL=aipath.js.map