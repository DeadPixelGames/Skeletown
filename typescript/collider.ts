import GameEvent from "./gameevent.js";
import { distance, clamp } from "./util.js";
import "./util.js";
import Entity from "./entity.js";

/**
 * Color en el que mostrar los colliders dinámicos cuando se dibujen para debug.
 */
const COLLIDER_RENDER_DYNAMIC_COLOR = "#00ff00";

/** 
 * Color en el que mostrar los colliders no dinámicos cuando se dibujen para debug.
 */
const COLLIDER_RENDER_NONDYNAMIC_COLOR = "#555555";

/** 
 * Tolerancia para usar en los cálculos que implican distancia. Dos distancias se consideran
 * iguales si su diferencia es menor que este valor.
 */
const RADIUS_TOLERANCE = 0.0001;

/**
 * Clase básica para colliders, que gestiona eventos de colisión e interacción. Asigna el collider
 * a una `ColliderLayer` para que reciba los eventos a través de ella.
 */
export abstract class Collider {

    //#region Atributos para eventos
    /**
     * Evento que dispara cuando el collider entra en contacto con otro.
     */
    private onCollisionEnter :GameEvent<(other :Collider) => void>;
    /**
     * Evento que dispara cuando el collider permanece en contacto con otro.
     */
    private onCollisionStay :GameEvent<(other :Collider) => void>;
    /**
     * Evento que dispara cuando el collider deja de estar en contacto con otro.
     */
    private onCollisionLeave :GameEvent<(other :Collider) => void>;
    /**
     * Evento que dispara si el collider recibe un evento de click.
     */
    private onClick :GameEvent<(x :number, y :number) => void>;
    /**
     * Evento que dispara cuando el collider empieza a recibir un evento de hover.
     */
    private onHover :GameEvent<(x :number, y :number) => void>;
    /**
     * Evento que dispara cuando el collider deja de recibir un evento de hover.
     */
    private onStopHover :GameEvent<(x :number, y :number) => void>;
    //#endregion

    /**
     * Colliders con los que este collider está en contacto actualmente. Se usa para determinar si una colisión
     * debería disparar `onCollisionEnter`, `onCollisionStay` u `onCollisionLeave`.
     */
    private intersectingColliders :Collider[];

    /**
     * Indica si actualmente el elemento tiene el cursor encima. Usado para determinar si un evento de hover
     * debería disparar `onHover` u `onStopHover`.
     */
    private currentlyHovered :boolean;

    /**
     * Indica si el collider está marcado como dinámico. Un `ColliderLayer` sólo comprobará las colisiones de los colliders
     * dinámicos. Un collider debería ser dinámico sólo si va a moverse.
     */
    private dynamic :boolean;

    /**
     * Indica la distancia máxima a la que debe estar otro collider para que este collider realice los cálculos para determinar
     * si colisionan.
     */
    protected activationRadius :number;

    /**
     * Coordenada X del centro del collider.
     */
    public centerX :number;

    /**
     * Coordenada Y del centro del collider.
     */
    public centerY :number;

    /**
     * Entidad a la que está asignada este collider.
     */
    public entity :Entity | null;

    /**
     * El constructor básico para `Collider` está protegido ya que es una clase abstracta. Utiliza una clase derivada.
     */
    protected constructor(x :number, y :number, activationRadius :number, dynamic :boolean) {
        this.centerX = x;
        this.centerY = y;
        this.activationRadius = activationRadius;

        this.onCollisionEnter = new GameEvent();
        this.onCollisionStay = new GameEvent();
        this.onCollisionLeave = new GameEvent();
        this.onClick = new GameEvent();
        this.onHover = new GameEvent();
        this.onStopHover = new GameEvent();

        this.currentlyHovered = false;

        this.entity = null;

        this.dynamic = dynamic;

        this.intersectingColliders = [];
    }

    /**
     * Devuelve si el punto indicado por (`x`, `y`) está dentro del área de este collider.
     */
    public abstract containsPoint(x :number, y :number) :boolean;
    /**
     * Dibuja el área de este collider. Usar sólo para debug.
     */
    public abstract render(context :CanvasRenderingContext2D, scrollX? :number, scrollY? :number) :void;
    
    /**
     * Devuelve el punto en el que se cortan el borde del collider y la recta que se puede trazar desde el centro del collider hasta
     * el punto inidicado. El punto devuelto podría estar o no situado entre el centro y el punto dado.
     */
    public abstract findBorderPoint(otherX :number, otherY :number, thisX? :number, thisY? :number) :{x :number, y :number}

    /**
     * Devuelve si existe una intersección entre el área del collider `other` y la de este collider.
     * El cálculo consiste en obtener el punto más cercano al otro collider que forma parte del área de este collider,
     * y determinar si el otro collider contiene dicho punto. Si se especifican coordenadas adicionales, se
     * calculará la intersección como si el centro de este collider estuviera en dichas coordenadas.
     */
    protected intersects(other :Collider, x? :number, y? :number) {
        var thisX = x == null ? this.centerX : x;
        var thisY = y == null ? this.centerY : y;
        
        var selfOutermostPoint = this.findBorderPoint(other.centerX, other.centerY, thisX, thisY);
        var otherOutermostPoint = other.findBorderPoint(thisX, thisY, other.centerX, other.centerY);
        return other.containsPoint(selfOutermostPoint.x, selfOutermostPoint.y) || this.containsPoint(otherOutermostPoint.x, otherOutermostPoint.y);
    };

    /**
     * Indica si este collider es dinámico, es decir, si las capas que lo contengan van a calcular sus colisiones. Un
     * collider debería ser dinámico sólo si va a moverse.
     */
    public isDynamic() {
        return this.dynamic;
    }

    /**
     * Comprueba las colisiones con todos los demás colliders de la capa indicada y dispara los eventos pertinentes.
     */
    public checkCollisions(layer :ColliderLayer) {
        for(let other of layer) {
            
            // Si estamos comparando este collider consigo mismo, ignoramos esta iteración porque no queremos disparar
            // eventos en esta situación
            if(this == other) {
                continue;
            }

            // Si el otro collider no es dinámico, la capa no va a disparar sus eventos de colisión, en cuyo caso  este collider debe
            // encargarse de disparar sus eventos también

            // Caso 1: Los dos colliders están lo suficientemente cerca como para que merezca la pena calcular si interseccionan,
            // y además determinamos que de hecho interseccionan
            if(distance(this.centerX, this.centerY, other.centerX, other.centerY) - (this.activationRadius + other.activationRadius) < RADIUS_TOLERANCE && this.intersects(other)) {
                
                // Caso 1.1: Los colliders ya estaban colisionando entre sí
                if(this.intersectingColliders.contains(other)) {
                    this.onCollisionStay.dispatch(other);
                    if(!other.isDynamic()) {
                        other.onCollisionStay.dispatch(this);
                    }

                // Caso 1.2: Los colliders no estaban colisionando antes, acaban de entrar en contacto
                } else {
                    this.onCollisionEnter.dispatch(other);
                    this.intersectingColliders.push(other);
                    if(!other.isDynamic()) {
                        other.onCollisionEnter.dispatch(this);
                    }
                }

            // Caso 2: Los colliders no interseccionan, o están demasiado lejos el uno del otro
            } else {

                // Caso 2.1: Los colliders estaban interseccionando antes, acaban de dejar de hacerlo
                if(this.intersectingColliders.contains(other)) {
                    this.onCollisionLeave.dispatch(other);
                    this.intersectingColliders.remove(other);
                    if(!other.isDynamic()) {
                        other.onCollisionLeave.dispatch(this);
                    }
                }

                // Caso 2.2: Los colliders no estaban interseccionando. No hay nada que hacer en este caso
            }
        }
    }

    /**
     * Dispara el evento de click si el collider contiene el punto al que se ha enviado el click.
     */
    public sendUserClick(x :number, y :number) {
        if(this.containsPoint(x, y)) {
            this.onClick.dispatch(x, y);
        }
    }

    /**
     * Dispara los eventos de hover en función de si el collider contiene el punto al que se ha enviado.
     */
    public sendUserHover(x :number, y :number) {
        // Caso 1: El cursor está sobre el collider y no lo estaba antes
        if(this.containsPoint(x, y) && !this.currentlyHovered) {
            this.onHover.dispatch(x, y);
            this.currentlyHovered = true;

        // Caso 2: El cursor ya no está sobre el collider y sí lo estaba antes
        } else if(!this.containsPoint(x, y) && this.currentlyHovered) {
            this.onStopHover.dispatch(x, y);
            this.currentlyHovered = false;
        }
    }

    /**
     * Suscribe la instancia indicada a los eventos de colisiones de este collider.
     * * `onCollisionEnter` - Se dispara al entrar en contacto.
     * * `onCollisionStay` - Se dispara al mantener el contacto.
     * * `onCollisionLeave` - Se dispara al abandonar el contacto.
     */
    public suscribe(instance :any, onCollisionEnter :((other :Collider) => void) | null, onCollisionStay :((other :Collider) => void) | null, onCollisionLeave :((other :Collider) => void) | null) {
        if(onCollisionEnter) {
            this.onCollisionEnter.suscribe(onCollisionEnter, instance);
        }
        if(onCollisionStay) {
            this.onCollisionStay.suscribe(onCollisionStay, instance);
        }
        if(onCollisionLeave) {
            this.onCollisionLeave.suscribe(onCollisionLeave, instance);
        }
    }

    /**
     * Suscribe la instancia indicada a los eventos de interacción de este collider.
     * * `onClick` - Se dispara cuando el usuario hace click dentro del área del collider.
     * * `onHover` - Se dispara cuando el usuario introduce el cursor dentro del área del collider.
     * * `onStopHover` - Se dispara cuando el usuario saca el cursor del área del collider.
     */
    public addUserInteraction(instance :any, onClick :((x :number, y :number) => void) | null, onHover :((x :number, y :number) => void) | null, onStopHover :((x :number, y :number) => void) | null) {
        if(onClick) {
            this.onClick.suscribe(onClick, instance);
        }
        if(onHover) {
            this.onHover.suscribe(onHover, instance);
        }
        if(onStopHover) {
            this.onStopHover.suscribe(onStopHover, instance);
        }
    }

    /**
     * Devuelve si el collider, de estar en el punto indicado y la capa indicada, colisionaría.
     */
    public wouldCollideAt(layer :ColliderLayer, x :number, y :number) {
        
        var ret = false;
        
        for(let collider of layer) {
            
            // Si es el collider para el que estamos usando esta función, nos lo saltamos
            if(collider == this) {
                continue;
            }
            if(this.intersects(collider, x, y)) {
                ret = true;
            }
        }
        return ret;
    }
}

/**
 * Colección de colliders que deben interactuar entre sí. Esta clase está pensada para ser una envoltura global para los eventos de todos
 * los colliders que están contenidos en ella. Un mismo collider puede formar parte de varias capas.
 */
export class ColliderLayer {

    /**
     * Los colliders que forman parte de esta capa.
     */
    private colliders :Collider[];

    constructor() {
        this.colliders = [];
    }

    /**
     * Añade el collider indicado a la capa.
     */
    public add(collider :Collider) {
        this.colliders.push(collider);

        // Cada vez que añadimos un collider, reordenamos la lista de colliders de forma que los colliders dinámicos estén al principio.
        // Podemos aprovechar esto al comprobar las colisiones para hacerlo más eficiente.
        this.colliders.sort((c1, c2) => c1.isDynamic() ? -1 : 1);
    }

    /**
     * Elimina el collider indicado de la capa, o no hace nada si no estaba.
     */
    public remove(collider :Collider) {
        this.colliders.remove(collider);
    }

    /**
     * Indica si el collider forma parte de esta capa.
     */
    public contains(collider :Collider) {
        return this.colliders.contains(collider);
    }

    /**
     * Permite iterar por los colliders de la capa sin exponer la referencia a la lista de colliders.
     * Es importante garantizar que todos los colliders se añadan a través de `add(collider)` para garantizar
     * que los colliders dinámicos están al principio en todo momento.
     */
    public *[Symbol.iterator]() {
        for(let collider of this.colliders) {
            yield collider;
        }
    }

    /**
     * Comprueba las colisiones de todos los colliders dinámicos. No hay un método equivalente para comprobar
     * las colisiones de los colliders no dinámicos. Sus eventos deben ser disparados por colliders dinámicos.
     */
    public checkCollisions() {
        for(let collider of this.colliders) {
            
            if(!collider.isDynamic()) {
                // Como los colliders están ordenados de manera que todos los colliders dinámicos están al principio,
                // si llegamos a un collider que no es dinámico es que ya hemos comprobado todos los dinámicos y
                // podemos abandonar el bucle.
                break;
            }

            collider.checkCollisions(this);
        }
    }

    /**
     * Envía un evento de click para que lo capture el collider que se encuentra en el punto indicado. Si hay varios colliders
     * que se contenga ese punto, todos los colliders reciben el evento. Los colliders no dinámicos también pueden recibirlo.
     */
    public sendUserClick(x :number, y :number) {
        for(let collider of this.colliders) {
            collider.sendUserClick(x, y);
        }
    }

    /**
     * Envía un evento de hover para actualizar el estado de hover de todos los colliders de la capa. Los colliders no
     * dinámicos también pueden recibirlo.
     */
    public sendUserHover(x :number, y :number) {
        for(let collider of this.colliders) {
            collider.sendUserHover(x, y);
        }
    }

    /**
     * Devuelve si esta capa contiene una colisión no dinámica en el punto (`x`, `y`) especificado.
     */
    public nondynamicCollisionAtPosition(x :number, y :number) {
        var ret = false;
        for(let collider of this.colliders) {
            if(collider.isDynamic()) {
                continue;
            }
            if(collider.containsPoint(x, y)) {
                ret = true;
            }
        }
        return ret;
    }

    /**
     * Dibuja todos los colliders de la capa. Sólo usar para debug.
     */
    public render(context :CanvasRenderingContext2D, scrollX = 0, scrollY = 0) {
        for(let collider of this.colliders) {
            collider.render(context, scrollX, scrollY);
        }
    }
}

/**
 * Collider circular cuya área la determina un punto y un radio.
 */
export class CircleCollider extends Collider {

    /** El radio del círculo */
    private radius :number;

    constructor(x :number, y :number, radius :number, dynamic :boolean) {
        super(x, y, radius, dynamic);
        this.radius = radius;
    }

    public containsPoint(x :number, y :number) {
        // Un círculo contiene un punto si ese punto su distancia desde el centro es menor que el radio
        return distance(this.centerX, this.centerY, x, y) - this.radius < RADIUS_TOLERANCE;
    }

    public render(context :CanvasRenderingContext2D, scrollX = 0, scrollY = 0) {
        context.beginPath();
        context.strokeStyle = this.isDynamic() ? COLLIDER_RENDER_DYNAMIC_COLOR : COLLIDER_RENDER_NONDYNAMIC_COLOR;
        context.moveTo(this.centerX + this.radius - scrollX, this.centerY - scrollY);
        context.arc(this.centerX - scrollX, this.centerY - scrollY, this.radius, 0, 2 * Math.PI);
        context.stroke();
    }
    
    public findBorderPoint(otherX :number, otherY :number, thisX? :number, thisY? :number) {
        var thisCenterX = thisX == null ? this.centerX : thisX;
        var thisCenterY = thisY == null ? this.centerY : thisY;

        var dist = Math.sqrt(Math.pow(otherX - thisCenterX, 2) + Math.pow(otherY - thisCenterY, 2));
        
        return {
            x: thisCenterX + this.radius * (otherX - thisCenterX) / dist,
            y: thisCenterY + this.radius * (otherY - thisCenterY) / dist
        };
    }
}

/**
 * Collider rectángular cuya área queda definida por su esquina superior izquierda, su anchura y su altura.
 */
export class BoxCollider extends Collider {

    /**
     * La distancia que hay desde el centro hasta uno de los bordes verticales.
     */
    private halfWidth :number;

    /**
     * La distancia que hay desde el centro hasta uno de los bordes horizontales.
     */
    private halfHeight :number;

    constructor(left :number, top :number, width :number, height :number, dynamic :boolean) {
        super(left + width * 0.5, top + height * 0.5, distance(left, top, left + width * 0.5, top + height * 0.5), dynamic);
        this.halfWidth = width * 0.5;
        this.halfHeight = height * 0.5;
    }

    public containsPoint(x :number, y :number) {
        // Un punto está contenido en este collider si sus coordenadas se encuentran entre las coordenadas de las esquinas del rectángulo
        return (this.centerX - this.halfWidth) <= x && (this.centerX + this.halfWidth) > x
            && (this.centerY - this.halfHeight) <= y && (this.centerY + this.halfHeight) > y;
    }

    public render(context :CanvasRenderingContext2D, scrollX = 0, scrollY = 0) {
        context.beginPath();
        context.strokeStyle = this.isDynamic() ? COLLIDER_RENDER_DYNAMIC_COLOR : COLLIDER_RENDER_NONDYNAMIC_COLOR;
        context.strokeRect(this.centerX - this.halfWidth - scrollX, this.centerY - this.halfHeight - scrollY, this.halfWidth * 2, this.halfHeight * 2);
    }

    public findBorderPoint(otherX :number, otherY :number, thisX? :number, thisY? :number) {
        
        // El punto del borde de un rectángulo, es un punto que se encuentra a la misma altura que el punto objetivo
        // en el eje de menor distancia, y en el borde más cercano en el eje de mayor distancia, limitándose por
        // supuesto a las esquinas del rectángulo

        var thisCenterX = thisX == null ? this.centerX : thisX;
        var thisCenterY = thisY == null ? this.centerY : thisY;

        var borderPointX = thisCenterX;
        var borderPointY = thisCenterY;

        if(Math.abs(otherX - thisCenterX) > Math.abs(otherY - thisCenterY)) {
            borderPointX = otherX > thisCenterX ? thisCenterX + this.halfWidth : thisCenterX - this.halfWidth;
            borderPointY = clamp(otherY, thisCenterY - this.halfHeight, thisCenterY + this.halfHeight);
        } else if(Math.abs(otherY - thisCenterY) > Math.abs(otherX - thisCenterX)) {
            borderPointX = clamp(otherX, thisCenterX - this.halfWidth, thisCenterX + this.halfWidth);
            borderPointY = otherY > thisCenterY ? thisCenterY + this.halfWidth : thisCenterY - this.halfWidth;
        } else {
            borderPointX = otherX > thisCenterX ? thisCenterX + this.halfWidth : thisCenterX - this.halfWidth;
            borderPointY = otherY > thisCenterY ? thisCenterY + this.halfWidth : thisCenterY - this.halfWidth;
        }
        
        return {
            x: borderPointX,
            y: borderPointY
        };
    }
}