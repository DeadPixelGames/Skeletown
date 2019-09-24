import CustomEvent from "./customevent.js";
console.log("hello world");
class Player {
    constructor() {
        this.hp = 0;
        this.playerDead = new CustomEvent();
    }
    update() {
        if (this.hp == 0) {
            this.playerDead.dispatch("tried to swim in lava");
        }
    }
}
class HUD {
    constructor(player) {
        player.playerDead.suscribe(this.onPlayerDead, this);
    }
    onPlayerDead(text) {
        console.log("player is ded F");
    }
}
var p = new Player();
var h = new HUD(p);
p.update();
//# sourceMappingURL=main.js.map