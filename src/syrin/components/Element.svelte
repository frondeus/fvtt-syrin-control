<script lang="ts">
 import { playElement } from "../api";
 import { Element } from "../syrin";

 export let element: Element;

 function play() {
     ui.notifications?.info(`SyrinControl | Playing "${element.name}"`);
     playElement(element.id);
 }

 function macro() {
    let macro = Macro.create({
        name: element.name,
        type: "script",
        img: element.icon,
        command: "game.syrinscape.playElement(" + element.id + ")",
    });
    console.debug("SyrinControl | ", {macro});
    ui.notifications?.info(`SyrinControl | Created macro "${element.name}"`);
 }
</script>

<div class="syrin-element">
    <a class="syrin-control syrin-play-element" title="Play Element" on:click={play}>
        <img alt="icon" src="{element.icon}"/>
        <h4> {element.name} </h4>
        <i class="fas fa-play"></i>
    </a>
    <a on:click={macro} class="syrin-control syrin-macro-element" title="Create Macro"> <i class="fas fa-terminal"></i> </a>
</div>
