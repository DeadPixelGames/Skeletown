/**
 * Representa los datos leídos del JSON que representa una animación a reproducir en el juego.
 */
declare type AnimationData = {
    /**
     * Ubicación respecto al JSON donde se almacena el spritesheet que usará esta animación.
     */
    source :string,
    /**
     * Cantidad de fotogramas que avanzará la animación en un segundo.
     */
    framerate :number,
    /**
     * Anchura de cada fotograma de la animación.
     */
    framewidth :number,
    /**
     * Altura de cada fotograma de la animación.
     */
    frameheight :number,
    /**
     * Coordenada X del punto de origen desde el que se dibujan los sprites.
     */
    pivotX :number,
    /**
     * Coordenada Y del punto de origen desde el que se dibujan los sprites.
     */
    pivotY :number,
    /**
     * Factor que cambia la velocidad de los clips de caminar en función de la
     * velocidad. Más alto significa que la velocidad de la animación aumentará
     * más abruptamente según aumente la velocidad de la entidad.
     */
    walkAnimFactor :number;
    
    /**
     * Clips de esta animación
     */
    clips :(AnimationClip | DirectionalClip)[]
}

/**
 * Conjunto de ciclos de fotogramas orientados a las cuatro direcciones usadas en el juego.
 */
declare type DirectionalClip = {
    /**
     * El nombre único que identifica este clip.
     */
    id :string,
    /**
     * Clip para cuando la entidad mira al norte.
     */
    up :PartialAnimationClip,
    /**
     * Clip para cuando la entidad mira al sur.
     */
    down :PartialAnimationClip,
    /**
     * Clip para cuando la entidad mira al oeste.
     */
    left :PartialAnimationClip,
    /**
     * Clip para cuando la entidad mira al este.
     */
    right :PartialAnimationClip,
    /**
     * Qué hacer al llegar al último fotograma del clip.
     */
    after :AnimationTransition
}

/**
 * Ciclo de fotogramas que puede reproducirse independientemente para la animación.
 */
declare type AnimationClip = {
    /**
     * El nombre único que identifica este clip.
     */
    id :string,
    /**
     * Fotogramas que forman parte de este clip. El primer elemento
     * es la fila, el segundo elemento es la columna.
     */
    frames :[number, number][],
    /**
     * Indica si el sprite debe voltearse horizontalmente durante este clip.
     */
    flip :boolean,
    /**
     * Posición del fotograma en el que se congelará la animación si se pausa durante este clip.
     * Si no se especifica, la animación se detendrá en el fotograma en el que esté.
     */
    pause :number | null,
    /**
     * Qué hacer al llegar al último fotograma del clip.
     */
    after :AnimationTransition
}

/**
 * Ciclo de fotogramas pensado para usarse como parte de una estructura mayor.
 */
declare type PartialAnimationClip = {
    /**
     * Fotogramas que forman parte de este clip. El primer elemento
     * es la fila, el segundo elemento es la columna.
     */
    frames :[number, number][],
    /**
     * Indica si el sprite debe voltearse horizontalmente durante este clip.
     */
    flip :boolean,
    /**
     * Posición del fotograma en el que se congelará la animación si se pausa durante este clip.
     * Si no se especifica, la animación se detendrá en el fotograma en el que esté.
     */
    pause :number | null,
}

/**
 * Qué hacer al término de un clip.
 * * `"stop"` - Detener la animación en el último fotograma.
 * * `"repeat"` - Volver a empezar el clip desde el principio.
 * * `{goto: ""}` - Reproducir el clip indicado desde el principio.
 */
declare type AnimationTransition = "stop" | "repeat" | {
    goto :string
};