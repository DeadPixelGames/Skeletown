
import { Collider } from "./collider.js";
import { TileEntity } from "./graphics/areamap.js";





export class FarmlandManager{
    public static instance = new FarmlandManager;

    private farmlands :[null, ...TileEntity[]];


    private constructor(){
        this.farmlands = [null];
    }

    public addFarmland(tile :TileEntity){
        this.farmlands.push(tile);
    }

    public toggleActive(){
        for(let tile of this.farmlands){
            if(tile){
                tile.uiLayout.toggleActive();
                tile.uiLayout.visible = false;
                tile.collider.active = !tile.collider.active;
            }
        }
    }

    public activateThis(tile :TileEntity){
        tile.uiLayout.visible = true;
        tile.uiLayout.activate();
        for(let t of this.farmlands){
            if(t == tile) continue;
            if(t){
                t.uiLayout.visible = false;
                t.uiLayout.deactivate();
            }
        }
    }
}