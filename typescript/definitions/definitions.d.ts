
//#region Extensión de interfaces

// Extender la interfaz de arrays
declare interface Array<T> {
    /** Devuelve un elemento aleatorio del array. Se pueden especificar pesos para que distintos elementos
     * tengan distintas probabilidades de salir.
     * @param weights Opcional. Array que contiene la probabilidad de elegir cada elemento. Si se omite, todos
     * los elementos tienen la misma probabilidad */
    pickRandom(weights? :number[]) :T;
    
    /** Devuelve si el elemento especificado está en el array. */
    contains(elem :T) :boolean;
    
    /** Intenta eliminar la primera instancia del elemento especificado, y devuelve si tuvo éxito. */
    remove(elem :T) :boolean;
    
    /** Elimina de este array todos los elementos contenidos en `other`. */
    subtract(other :T[]) :this;

    /** Devuelve la posición del primer array que coincida con el array especificado. */
    indexOfArray(other :T) :number;

    /** Devuelve una copia superficial de este array. */
    clone() :T[];

    /** Indica si este array contiene los mismos elementos que el array `other`.
     * @param orderMatters Si es `true`, todos los elementos deben aparecer en el mismo orden para que
     * los arrays se consideren iguales. Por defecto `true`.
     */
    equals(other :T[], orderMatters?: boolean) :boolean;
}

// Extender la interfaz de Map
declare interface Map<K, V> {
    /** Devuelve un array con todas las claves de este mapa */
    getKeySet() :K[];

    /** Devuelve un array con todos los valores de este mapa */
    getValueSet() :V[];
}
//#endregion

type ClickEvent = {
    clientX :number,
    clientY :number
}

// Propiedades no declaradas que usamos de Window
declare interface Window {
    
    TouchEvent :typeof TouchEvent;
}