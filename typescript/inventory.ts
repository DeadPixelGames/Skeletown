import { UIGraphicEntity, UILayout, UIEntity } from "./ui/uiEntity";
import GraphicEntity from "./graphics/graphicentity";
import GraphicsRenderer from "./graphics/graphicsrenderer";
import FileLoader from "./fileloader";
import Interface from "./ui/interface";
import { BoxCollider } from "./collider";

type Item = {
    id :number,
    name :string,
    description :string,
    image :number,
    count :number
}

export class Inventory{
    public instance = new Inventory();

    private items :[null, ... Item[]];

    public layout :UILayout;

    private cropsLayout :UILayout;
    private clothesLayout :UILayout;
    private wikiLayout :UILayout;
    private settingsLayout :UILayout;


    private background :UIEntity;
    private crops :UIEntity;
    private clothes :UIEntity;
    private wiki :UIEntity;
    private settings :UIEntity;

    private halfWidth = 512;
    private halfHeight = 348;

    private constructor(){
        this.layout = new UILayout(
            GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, 
            GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.cropsLayout = new UILayout(
            GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, 
            GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.clothesLayout = new UILayout(
            GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, 
            GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.wikiLayout = new UILayout(
            GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, 
            GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.settingsLayout = new UILayout(
            GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, 
            GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.background = new UIEntity(false);
        this.crops = new UIEntity(true);
        this.clothes = new UIEntity(true);
        this.wiki = new UIEntity(true);
        this.settings = new UIEntity(true);
        
        this.crops.setPercentRelPos(false);
        this.clothes.setPercentRelPos(false);
        this.wiki.setPercentRelPos(false);
        this.settings.setPercentRelPos(false);
        
        this.loadImages();
        this.loadColliders();
        
        this.layout.addUIEntity(this.crops);
        this.layout.addUIEntity(this.clothes);
        this.layout.addUIEntity(this.wiki);
        this.layout.addUIEntity(this.settings);

        this.layout.addEntitiesToRenderer();
        this.layout.hide();
        
    }


    public addItem(item :Item){
        this.items.push(item);
    }


    private async loadImages(){
        this.background.setImage(true, 101, await FileLoader.loadImage("resources/interface/or_inv_base.png"),0,0,this.halfWidth*2, this.halfHeight*2);
        this.crops.setImage(true, 103, await FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
        this.clothes.setImage(true, 103, await FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
        this.wiki.setImage(true, 103, await FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
        this.settings.setImage(true, 103, await FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
    }

    private loadColliders(){
        this.crops.setCollider(true, 58, 56, 101, 101, (x,y)=>{
            this.cropsLayout.show();
            this.clothesLayout.hide();
            this.wikiLayout.hide();
            this.settingsLayout.hide();
        })

        this.clothes.setCollider(true, 58, 106, 101, 101, (x,y)=>{
            this.cropsLayout.hide();
            this.clothesLayout.show();
            this.wikiLayout.hide();
            this.settingsLayout.hide();
        })

        this.wiki.setCollider(true, 58, 156, 101, 101, (x,y)=>{
            this.cropsLayout.hide();
            this.clothesLayout.hide();
            this.wikiLayout.show();
            this.settingsLayout.hide();
        })

        this.settings.setCollider(true, 58, 206, 101, 101, (x,y)=>{
            this.cropsLayout.hide();
            this.clothesLayout.hide();
            this.wikiLayout.hide();
            this.settingsLayout.show();
        })

        Interface.instance.addCollider(this.crops.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.clothes.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.wiki.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.settings.getCollider() as BoxCollider);
    }
}