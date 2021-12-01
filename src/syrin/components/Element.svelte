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
    <a class="syrin-control syrin-play-element" title="Play: {element.name}" on:click={play}>
        <img alt="icon" src="{element.icon}"/>
        <!-- <h4> {element.name} </h4> -->
        <i class="fas fa-play"></i>
    </a>
    <a on:click={macro} class="syrin-control syrin-macro-element" title="Create Macro: {element.name}"> <i class="fas fa-terminal"></i> </a>
</div>

<style>
.syrin-element {
    border: 1px solid #000;
    border-radius: 4px;
    padding: 0.5em;
    text-align: center;
    margin: 4px;
    max-width: 120px;
}

.syrin-element img {
    max-height: 64px;
    max-width: 64px;
    border: 0;
    object-fit: cover;
}
</style>
