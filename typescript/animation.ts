
export default class Animation{

    private spriteSheet :string;
    private dimX :number;
    private dimY :number;
    private ini :number;
    private end :number;

    constructor(spriteSheet :string, dimX :number, dimY :number, ini :number, end :number){
        this.spriteSheet = spriteSheet;
        this.dimX = dimX;
        this.dimY = dimY;
        this.ini = ini;
        this.end = end;
    }

    public play(){

    }

    public stop(){
        
    }

}