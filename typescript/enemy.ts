import Entity from "./entity.js";
import { distance } from "./util.js";
import { ColliderLayer, Collider } from "./collider.js";
import Player from "./player.js";
import AIPath from "./aipath.js";

/**
 * Alcance del ataque. Si el enemigo está a menos de esta distancia de su objetivo, le atacará.
 */
const ATTACK_RADIUS = 150;
/**
 * Tiempo en segundos que debe pasar entre ataque y ataque.
 */
const ATTACK_COOLDOWN = 2;
/**
 * Velocidad de movimiento del enemigo.
 */
const ENEMY_SPEED = 300;
/**
 * Factor que multiplica la velocidad a la que se moverá el punto de destino entre un punto
 * y otro de la ruta. A más lento, más redondeada será la trayectoria de la entidad.
 */
const DEST_SMOOTH_FACTOR = 300;
/**
 * Distancia máxima a la que puede estar el enemigo de su punto de destino para
 * considerar que ha llegado y, por tanto, ir al siguiente punto en su ruta.
 */
const DIST_TO_NEXT_POINT = 30;
/**
 * Radio dentro del cual el enemigo podrá detectar a su objetivo inmediatamente.
 */
const ENEMY_VISION_RADIUS = 800;
/**
 * Tiempo en segundos que el objetivo debe pasar consecutivamente fuera del radio
 * de visión del enemigo para que deje de seguirle.
 */
const TIME_TO_STOP_FOLLOWING = 5;
/**
 * Tiempo en segundos que debe pasar entre recálculos de la ruta. Más pequeño significa
 * que la ruta será más precisa según se mueva su objetivo, pero también será más
 * costoso computacionalmente.
 */
const TIME_TO_RECALCULATE_PATH = 1;

/**
 * Entidad que representa un agente hostil en el mundo del juego. Persigue a un objetivo
 * y le ataca si está a su alcance.
 */
export default class Enemy extends Entity {

    /**
     * Objetivo al que persigue.
     */
    private target :Entity | null;
    /**
     * Tiempo que el objetivo lleva sin estar en el radio de visión.
     */
    private timeNotSeeingTarget :number;
    /**
     * Tiempo que ha pasado desde el último recálculo de la ruta.
     */
    private timeToRecalculatePath :number;
    /**
     * Capa de colliders a través de la cual navegará y detectará su objetivo.
     */
    private colliders :ColliderLayer | null;
    /**
     * Ruta que la entidad está siguiendo.
     */
    private path :AIPath | null;
    /**
     * Tiempo en segundos a esperar entre ataque y ataque.
     */
    private cooldown :number;
    /**
     * Callback que ejecuta el enemigo sobre su objetivo al atacar.
     */
    private attack :(target :Entity) => void;

    constructor() {
        super();

        this.colliders = null;
        this.target = null;
        this.timeNotSeeingTarget = 0;
        this.timeToRecalculatePath = 0;

        this.speed.x = ENEMY_SPEED;
        this.speed.y = ENEMY_SPEED;

        this.path = null;

        this.cooldown = 0;
    }

    /**
     * Busca al jugador y, si está en el radio de visión, lo convierte en su objetivo. El enemigo debe estar en la misma
     * capa de colliders que el jugador para detectarlo.
     */
    public searchPlayer() {

        if(!this.colliders) {
            console.warn("Un enemigo está intentando buscar al jugador, pero no se encuentra en una capa de colisiones.");
            return;
        }

        for(let collider of this.colliders) {
            if(!collider.isDynamic()) {
                break;
            }
            if(distance(this.x, this.y, collider.centerX, collider.centerY) < ENEMY_VISION_RADIUS && collider.entity && collider.entity instanceof Player) {
                this.target = collider.entity;
                this.path = new AIPath(this, Enemy.entityOrCollider(this.target));
            }
        }
    }

    /**
     * Asigna al enemigo una capa de colisiones que usará para generar la ruta y detectar
     * a su objetivo.
     */
    public setColliderLayer(colliders :ColliderLayer) {
        this.colliders = colliders;
    }
    /**
     * Asigna un ataque al enemigo.
     */
    public setAttack(attack :(target :Entity) => void) {
        this.attack = attack;
    }

    protected update(deltaTime :number) {

        // Si tenemos un objetivo
        if(this.target && this.target.getCollider()) {

            if(distance(this.x, this.y, this.target.x, this.target.y) < ATTACK_RADIUS && this.cooldown <= 0) {
                this.attack.call(this, this.target);
                this.cooldown = ATTACK_COOLDOWN;
            } else {
                this.cooldown -= deltaTime;
            }

            // Si está fuera del radio de visión, sumamos tiempo al contador correspondiente
            let targetCollider = this.target.getCollider() as Collider;
            if(distance(this.x, this.y, targetCollider.centerX, targetCollider.centerY) > ENEMY_VISION_RADIUS) {
                this.timeNotSeeingTarget += deltaTime;
            
            // Si no, lo reiniciamos
            } else {
                this.timeNotSeeingTarget = 0;
            }

            // Si el contador ha sobrepasado el tiempo especificado para dejar de seguir al objetivo
            if(this.timeNotSeeingTarget > TIME_TO_STOP_FOLLOWING) {
                // Dejamos de seguirlo y cancelamos la ruta
                this.target = null;
                this.timeNotSeeingTarget = 0;
                this.dest = null;
                this.path = null;

            // Si el objetivo sigue siendo detectable y es hora de recalcular la ruta
            } else if(this.path && this.timeToRecalculatePath > TIME_TO_RECALCULATE_PATH) {
                // Recalculamos la ruta y reiniciamos el contador
                this.path.recalculate(Enemy.entityOrCollider(this.target));
                this.timeToRecalculatePath = 0;

            // En otro caso, simplemente vamos acumulando en el contador de recalcular la ruta
            } else {
                this.timeToRecalculatePath += deltaTime;
            }

            // Movemos el punto de destino al siguiente punto en la ruta
            this.followPath(deltaTime);
        }

        // Si no hay objetivo, lo buscamos
        if(!this.target) {
            this.searchPlayer();
        }

        // Ya puede actualizarse el contenido de la entidad
        super.update(deltaTime);
    }

    /**
     * Dirige el punto de destino para hacer que el enemigo navegue por la ruta que ha calculado
     */
    private followPath(deltaTime :number) {
        // Si no hay ruta, o la ruta ha terminado, no hay nada que recorrer
        if(!this.path || this.path.isDone()) {
            return;
        }

        // Si nos hemos acercado lo suficiente al punto de destino, podemos pasar al siguietne punto de
        // la ruta
        if(!this.dest || distance(this.x, this.y, this.dest.x, this.dest.y) < DIST_TO_NEXT_POINT) {
            this.dest = this.path.next();
        }

        // Además, podemos ir moviendo el punto de destino gradualmente hacia el punto posterior para que
        // la entidad siga una trayectoria redondeada
        var secondNext = this.path.secondNext();
        if(this.dest && secondNext) {
            var dist = Math.max(distance(this.dest.x, this.dest.y, secondNext.x, secondNext.y), 0.1);
            // Restringimos que la distancia tenga un valor mínimo para que al dividirla por las coordenadas
            // no obtengamos valores inútiles.
    
            this.dest.x += (secondNext.x - this.dest.x) * deltaTime / dist * DEST_SMOOTH_FACTOR;
            this.dest.y += (secondNext.y - this.dest.y) * deltaTime / dist * DEST_SMOOTH_FACTOR;
        }
    }

    public renderDebug(context :CanvasRenderingContext2D, scrollX :number, scrollY :number) {
        super.renderDebug(context, scrollX, scrollY);

        // Dibujamos un círculo con el radio de visión y la ruta que está siguiendo la entidad
        var position = Enemy.entityOrCollider(this);
        context.beginPath();
        context.strokeStyle = "#FFBB00";
        context.moveTo(position.x + ENEMY_VISION_RADIUS - scrollX, position.y - scrollY);
        context.arc(position.x - scrollX, position.y - scrollY, ENEMY_VISION_RADIUS, 0, 2 * Math.PI);
        context.stroke();

        if(this.path) {
            this.path.render(context, scrollX, scrollY);
        }
    }

    /**
     * Devuelve las coordenadas del collider de la entidad, o las de la propia entidad si el collider
     * no está disponible.
     */
    private static entityOrCollider(entity :Entity) {
        var ret = {
            x: entity.x,
            y: entity.y
        };

        var collider = entity.getCollider();
        if(collider) {
            ret = {
                x: collider.centerX,
                y: collider.centerY
            };
        }

        return ret;
    }
}