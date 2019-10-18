
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


    public activate(){
        for(let tile of this.farmlands){
            if(tile){
                tile.uiLayout.activate();
                tile.collider.active = true;
                tile.uiLayout.visible = false;
            }
        }
    }
    public deactivate(){
        for(let tile of this.farmlands){
            if(tile){
                tile.uiLayout.deactivate();
                tile.collider.active = false;
                tile.uiLayout.visible = false;
            }
        }
    }

    public activateThis(tile :TileEntity){
        if(tile.uiLayout.visible){
            tile.uiLayout.visible = false;
        }else{
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
}