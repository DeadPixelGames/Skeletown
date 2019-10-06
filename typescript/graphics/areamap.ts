import FileLoader from "../fileloader.js";
import GraphicEntity from "./graphicentity.js";
import GraphicsRenderer from "./graphicsrenderer.js";
import GameEvent from "../gameevent.js";
import { ColliderLayer, Collider, BoxCollider } from "../collider.js";

/**
 * Directorio donde se almacenan los mapas de tiles en formato JSON. La dirección parte de la raíz del programa; no se requiere
 * añadir '/' al principio ni al final.
 */
const MAPS_JSON_FOLDER = "resources/tilemaps";

/**
 * Clase que representa un mapa de Tiled en formato JSON cargado en el juego.
 */
export default class AreaMap {

    /**
     * La anchura del mapa.
     */
    private width :number;
    /**
     * La altura del mapa.
     */
    private height :number;
    /**
     * El color de fondo del mapa.
     */
    private backgroundColor :string;
    /**
     * La capa de colliders asignada a este mapa.
     */
    private colliders :ColliderLayer;

    /**
     * Paleta de tiles a usar. Contiene prototipos definiendo todos los distintos tiles que puede usar el mapa, provenientes de todos
     * los tilesets. Los datos de capa de Tiled son una secuencia de números enteros: Cada número entero es el ID que ocupa el tile
     * en esta paleta. 0 representa un tile vacío, razón por la cual se requiere que el primer elemento de la paleta sea `null`.
     */
    private palette :[null, ... TilePrototype[]];

    /**
     * Evento que se dispara al terminar de cargar el mapa colocando todos los tiles.
     */
    private onLoaded :GameEvent<() => void>;

    /** El constructor es privado. Usa `AreaMap.load(jsonFile)` en su lugar. */
    private constructor() {
        this.width = 0;
        this.height = 0;
        this.backgroundColor = "#000000";
        this.palette = [null];
        this.onLoaded = new GameEvent();
        this.colliders = new ColliderLayer();
    }

    /**
     * Inicia la generación de  un área cargando el archivo especificado. Sólo es necesario indicar el nombre del archivo.
     * El directorio a partir del cual se buscará lo determina la constante `MAPS_JSON_FOLDER` en la clase `AreaMap`.
     * El área devuelta no cargará inmediatamente. Para realizar una acción al término de la carga del área, usa el
     * callback `onLoadedCallback`.
     */
    public static load(jsonFile :string, onLoadedCallback? :() => void, callbackTarget? :any) {
        // Creamos el área y la devolvemos síncronamente. Esto es para permitir que otras instancias puedan suscribirse
        // a los eventos de esta área antes de que cargue
        var ret = new AreaMap();

        // Si la llamada especifica un callback, lo suscribimos al evento onLoaded
        if(onLoadedCallback) {
            ret.onLoaded.suscribe(onLoadedCallback, callbackTarget);
        }

        // Iniciamos la carga asíncrona del área. Esta es la razón por la que devolvemos el área sin cargar y
        // el callback es necesario
        ret.asyncLoadAuxiliar(jsonFile);
        return ret;
    }

    /**
     * Suscribe la instancia especificada a los eventos indicados, que al disparar ejecutarán los callbacks que se
     * les hayan asignado aquí.
     * * `onLoaded`: Dispara cuando el mapa ha terminado de cargar completamente.
     */
    public suscribe(instance :any, onLoaded :(() => void) | null) {
        if(onLoaded) {
            this.onLoaded.suscribe(onLoaded, instance);
        }
    }

    /**
     * Devuelve la capa de colisiones del área.
     */
    public getColliders() {
        return this.colliders;
    };

    /**
     * Permite realizar la mayor parte de la carga de manera asíncrona, agilizando el proceso, ya que depende de la carga
     * de varios archivos e iteraciones pesadas. Esta función es un suplemento de `AreaMap.load(jsonFile)`.
     */
    private async asyncLoadAuxiliar(jsonFile :string) {
        // En primer lugar cargamos los datos del mapa del archivo indicado
        var mapData = await FileLoader.loadJSON(MAPS_JSON_FOLDER + "/" + jsonFile) as MapData;

        // Extraemos toda la información sobre todos los tiles disponibles y los añadimos a la paleta
        await this.generateTilePalette(mapData.tilesets);

        // Contamos la capa para añadirla al orden de renderizado
        var layerCount = 0;

        // Con la paleta ya lista, podemos leer el contenido de las capas y agregar tiles según indiquen sus datos
        for(let layer of mapData.layers) {
 
            // Por defecto, Tiled almacena los datos de las capas en formato CSV, por lo que Javascript lo puede leer como
            // un array numérico. Sin embargo, Tiled ofrece la opción de codificar las capas en formato Base64, con lo que
            // tenemos que decodificar eso primero
            let data :number[] = [];
            if(!(layer.data instanceof Array)) {
                data = AreaMap.decodeBase64Layer(layer.data);
            } else {
                data = layer.data;
            }

            // Con los datos ya listos (en formato de array numérico), podemos colocar todos los tiles en el mapa
            this.placeTilesInLayer(layerCount, data, mapData.width, mapData.tilewidth, mapData.tileheight);
            layerCount++;
        }

        // El mapa ya ha terminado de cargar, dispara el evento
        this.onLoaded.dispatch();
    }

    /**
     * Coloca los tiles indicados numéricamente por `tiles` en la capa `layer`. El array `tiles` contiene una sequencia de
     * índices, que apunta al prototipo que corresponde al tile en cuestión en la paleta. `mapWidth`, `tileWidth` y `tileHeight`
     * se utilizan para calcular la ubicación en la que hay que colocar cada tile.
     */
    private placeTilesInLayer(layer :number, tiles :number[], mapWidth :number, tileWidth :number, tileHeight :number) {
        // Tiled almacena los tiles en secuencia: Los primeros <mapWidth> valores del array corresponden a la fila superior
        // del mapa; los siguientes <mapWidth>, a la segunda; etc
        var count = 0;
        for(let tileId of tiles) {

            // Obtenemos el prototipo asignado al índice actual
            let tileProto = this.palette[tileId];

            // Tiled representa la ausencia de un tile con el número 0, que no está asignado a ningún prototipo. Debemos
            // asegurarnos de que no es el caso en esta iteración
            if(tileProto != null) {

                // Generamos la entidad gráfica que representará este tile en particular a partir del prototipo cargado
                let tile = new TileEntity(layer, tileProto);

                // Colocamos el tile en su ubicación en el mapa
                tile.x = (count % mapWidth) * tileWidth;
                tile.y = Math.floor(count / mapWidth) * tileHeight;

                if(tile.collider) {
                    // Colocamos el collider también en el mismo lugar que el tile
                    tile.collider.centerX = tile.x + tileWidth * 0.5;
                    tile.collider.centerY = tile.y + tileHeight * 0.5;
    
                    // Añadimos el collider a los colliders del mapa
                    this.colliders.add(tile.collider);
                }
            
                // Se lo pasamos al `GraphicsRenderer` para que se encargue de renderizarlo
                GraphicsRenderer.instance.addExistingEntity(tile);
            }

            // Siguiente tile del mapa
            count++;
        }
    }

    /**
     * Partiendo de los datos indicados, genera una paleta con los prototipos de todos los tiles que usaremos en el mapa.
     * Este método es asíncrono porque, además de generar la paleta, también es la función que carga las imágenes de los tilesets.
     */
    private async generateTilePalette(tilesets :TilesetData[]) {

        // Pasaremos por toda la colección de tilesets para cargarlos todos. Nótese que este bucle puede percibirse como un
        // desaprovechamiento de las capacidades de la carga asíncrona, ya que en lugar de cargar los tilesets paralelamente,
        // esperamos a que cada uno cargue por completo antes de pasar a la siguiente iteración. Esto es intencional, ya que los
        // índices que usa Tiled dependen de que todos los tiles de todos los tilesets carguen en orden.
        for(let tileset of tilesets) {
            // Cargamos la imagen del tileset y esperamos
            let image = await FileLoader.loadImage(MAPS_JSON_FOLDER + "/" + tileset.image);
            
            // Iteraremos primero por las filas y luego por las columnas. La razón es que los índices usados por Tiled recorren
            // los tiles primero por filas y luego por columnas, y queremos ser consistentes con esta convención.
            let rows = tileset.tilecount / tileset.columns;
            for(let y = 0; y < rows; y++) {
                for(let x = 0; x < tileset.columns; x++) {
                    
                    // Un tile se considera sólido cuando tiene la propiedad "solid", así que es relevante consultar este dato
                    // para almacenarlo en el prototipo.
                    let solid = AreaMap.findCustomPropertyValue<boolean>("solid", y * tileset.columns + x, tileset.tiles);
                    if(solid == null) {
                        solid = false;
                    }

                    // Añadimos el prototipo a la paleta
                    this.palette.push({
                        source: image,
                        sX: x * tileset.tilewidth,
                        sY: y * tileset.tileheight,
                        sWidth: tileset.tilewidth,
                        sHeight: tileset.tileheight,
                        solid: solid
                    });
                }
            }
            
        }
    }

    /**
     * Devuelve el valor de un atributo personalizado asignado a un tile a través de Tiled. La función puede devolver `null` porque
     * es posible que el atributo en cuestión no exista en el tile indicado, o porque el tileset directamente no almacene propiedades
     * de los tiles.
     */
    private static findCustomPropertyValue<T>(property :string, tileId :number, tiles? :TileData[]) {
        var ret = null;
        
        // Es posible que el tileset no tenga datos de propiedades de tiles
        if(tiles != null) {
            // Si las tiene, busca el que corresponda al tile que estamos buscando
            let tileData = tiles.find(t => t.id == tileId);
            // Es posible que el tileset no tenga una entrada para este tile, o la tenga pero esta no tenga propiedades asignadas
            if(tileData != null && tileData.properties != null) {
                // Si las tiene, busca la propiedad indicada. Sin tener en cuenta distinción entre mayúsculas y minúsculas
                let searchedProperty = tileData.properties.find(p => p.name.toLowerCase() == property.toLowerCase());
                // Es posible que no la tenga, pero si la tiene, se puede devolver su valor
                if(searchedProperty != null) {
                    ret = searchedProperty.value as T;
                }
            }
        }

        return ret;
    }

    /**
     * Obtiene la secuencia de números almacenada en un string codificado en formato Base64.
     */
    private static decodeBase64Layer(layer :string) {
        // Base64 almacena los datos como una secuencia de enteros de 32 bits en little-endian. Esta constante especifica
        // el número de bytes a utilizar para decodificar la capa
        const DATA_LENGTH = 4;

        // Primero decodificamos la capa de Base64. Lo que obtenemos es una secuencia de bytes en forma de string
        var decodedDataString = atob(layer);

        // Tenemos que convertir este string en un array numérico para poder usarlo en el resto del programa. Los datos
        // seguirán siendo esencialmente los mismos, pero es más conveniente leerlos en forma de array
        var ret :number[] = [];

        // Dividimos el string decodificado en varios trozos de la longitud correcta
        for(let i = 0; i < decodedDataString.length; i += DATA_LENGTH) {
            let sequence = decodedDataString.slice(i, i + DATA_LENGTH);

            // Usamos un DataView porque queremos editar los bytes directamente. Cada trozo del string decodificado es
            // un número entero de 32-bit en little-endian, y podemos representarlo justo así en el DataView
            let dataView = new DataView(new ArrayBuffer(DATA_LENGTH));
            for(let j = 0; j < DATA_LENGTH; j++) {
                // Como es little-endian, escribimos los bytes al revés de como aparecen en el string
                dataView.setUint8(j, sequence.charCodeAt(DATA_LENGTH - j - 1));
            }

            // Ya podemos leer el número final decodificado. Lo añadimos al array para devolverlo
            ret.push(dataView.getUint32(0));
        }

        // Array listo. Lo devolvemos
        return ret;
    }
}

//#region Tipos y clases auxiliares

/**
 * Representa los datos que se utilizarán para construir una instancia de tile.
 */
type TilePrototype = {
    source :HTMLImageElement,
    sX :number,
    sY :number,
    sWidth :number,
    sHeight :number
    solid :boolean,
};

/**
 * Instancia de tile particular que se puede renderizar directamente en la pantalla.
 */
class TileEntity extends GraphicEntity {

    /**
     * Indica si el tile se puede atravesar por otras entidades o no.
     */
    public solid :boolean;
    /**
     * El colisionador asignado a este tile.
     */
    public collider :Collider;

    public constructor(layer :number, proto :TilePrototype) {
        super(layer, proto.source, proto.sX, proto.sY, proto.sWidth, proto.sHeight, 0, 0);
        this.solid = proto.solid;
        if(this.solid) {
            this.collider = new BoxCollider(0, 0, proto.sWidth, proto.sHeight, false);
            this.collider.suscribe(this, null, this.pushAway, null);
        }
    }

    private pushAway(other :Collider) {
        if(!other.entity) {
            return;
        }

        var otherPoint = other.findBorderPoint(this.collider.centerX, this.collider.centerY);
        
        var entityOffsetX = other.entity.x - otherPoint.x;
        var entityOffsetY = other.entity.y - otherPoint.y;
        var overlap = this.collider.getOverlapVector(other);


        other.entity.x += overlap.x * 0.5;
        other.entity.y += overlap.y * 0.5;
    }
}
//#endregion

//#region Tipos de datos de Tiled
type MapData = {
    width :number,
    height :number,
    tiledversion :string,
    tilewidth :number,
    tileheight :number,
    infinite :boolean,
    backgroundcolor :string,
    layers :LayerData[],
    tilesets :TilesetData[]
}

type LayerData = {
    id :number,
    name :string,
    data :number[] | string,
    encoding? :"csv" | "base64",
    width :number,
    height :number,
    visible :boolean,
    properties? :{
        name :string,
        value :any,
        type :string
    }[],
    type :"tilelayer" | "objectgroup" | "imagelayer" | "group"
}

type TilesetData = {
    name :string,
    image :string,
    imagewidth :number,
    imageheight :number,
    columns :number,
    firstgid :number,
    margin :number,
    spacing :number,
    tilecount :number,
    tilewidth :number,
    tileheight :number,
    terrains? :TerrainData[],
    tiles? :TileData[]
}

type TileData = {
    id :number,
    properties? :{
        name :string,
        value :any,
        type :string
    }[],
    animation? :TileFrameData[],
    terrain? :number[],
}

type TerrainData = {
    name :string,
    tile :number
}

type TileFrameData = {
    duration :number,
    tileid :number
}
//#endregion