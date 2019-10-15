import Entity from "./entity.js"
import { BoxCollider, Collider } from "./collider.js";
import { UILayout} from "./ui/uiEntity.js";
import Interface from "./ui/interface.js";


export default class Farmland{

    private layout :UILayout;

    //private item :Item;

    private collider :Collider;

    constructor(collider :Collider){

        this.collider = collider;
    
        this.collider.addUserInteraction(this, this.onclick, null, null);

        Interface.instance.addCollider(this.collider);
        
    }

    public onclick(x :number, y :number) {
        
    }



    public initLayout(){
        //var plant = new UICircleEntity(this.collider.centerX, this.collider.centerY, this.collider.)
        //var harvest = new UICircleEntity();
        //var inventory = new UICircleEntity();
        //var layout = new UILayout();
        //layout.addUIEntity(plant)
        //layout.addUIEntity(harvest)
        //layout.addUIEntity(inventory)
    }


}


export class FarmlandManager{

    private farmlands :Farmland[];

    constructor(){

    }

    public addFarmland(collider :Collider){
        this.farmlands.push(new Farmland(collider));
    }
}