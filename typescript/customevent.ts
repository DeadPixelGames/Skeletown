export default class CustomEvent<F extends Function> {

    /** Lista de suscriptores, indicados por tuplas que contienen la función a llamar y el sujeto 
     * List of suscribers, indicated by tuples containing the function to call and the subject
     * que las recibe */
    private suscribed :[F, any][];

    constructor() {
        this.suscribed = [];
    }

    /** Cuando el evento dispare, la función indicada se ejecutará con `thisValue` como
     * el valor de `this`. */
    public suscribe(func :F, thisValue :any) {
        this.suscribed.push([func, thisValue]);
    }

    /** La tupla que contenga la función `func` y el valor `thisValue` dados no recibirá más este evento. */
    public unsuscribe(func :F, thisValue :any) {
        this.suscribed.remove([func, thisValue]);
    }

    /** Invoca todas las funciones suscritas con los parámetros indicados. */
    public dispatch(... args :any[]) {
        for(let s of this.suscribed) {
            s[0].apply(s[1], args);
        }
    }
}