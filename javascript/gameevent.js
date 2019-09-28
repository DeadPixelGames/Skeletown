export default class GameEvent {
    constructor() {
        this.suscribed = [];
    }
    /** Cuando el evento dispare, la función indicada se ejecutará con `thisValue` como
     * el valor de `this`. */
    suscribe(func, thisValue) {
        this.suscribed.push([func, thisValue]);
    }
    /** La tupla que contenga la función `func` y el valor `thisValue` dados no recibirá más este evento. */
    unsuscribe(func, thisValue) {
        this.suscribed.remove([func, thisValue]);
    }
    /** Invoca todas las funciones suscritas con los parámetros indicados. */
    dispatch(...args) {
        for (let s of this.suscribed) {
            s[0].apply(s[1], args);
        }
    }
}
//# sourceMappingURL=gameevent.js.map