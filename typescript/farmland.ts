import Entity from "./entity.js"
import { BoxCollider, Collider } from "./collider.js";


export default class Farmland extends Entity{

    

    constructor(canvas :HTMLCanvasElement, ctx :CanvasRenderingContext2D, x :number, y :number, w :number, h :number){
        super();

        this.setCollider(new BoxCollider(x, y, w, h, false));
        var col = this.getCollider();
        if(col){
            col.addUserInteraction(this, this.onclick, null, null);
        }
    }

    public onclick(x :number, y :number) {
        
    }


}