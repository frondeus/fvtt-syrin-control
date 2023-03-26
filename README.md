![](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://github.com/frondeus/fvtt-syrin-control/releases/download/0.4.0/module.json)
![Latest Release Download Count](https://img.shields.io/github/downloads/frondeus/fvtt-syrin-control/latest/module.zip)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffvtt-syrin-control&colorB=4aa94a)

# SyrinControl - provides integration with Syrinscape Online

[![SyrinControl 0.4 walk-through](http://img.youtube.com/vi/nHGWU5m5atU/0.jpg)](https://youtu.be/nHGWU5m5atU "SyrinControl 0.4")


### Compatibility with V10
This release brings support for Foundry V10, but at the same time, it no longer supports older versions of Foundry.

## Useful links:

- [Frequently Asked Questions](https://github.com/frondeus/fvtt-syrin-control/wiki/Frequently-Asked-Questions)
- [How to Setup](https://github.com/frondeus/fvtt-syrin-control/wiki/Setup)
- [How to Use](https://github.com/frondeus/fvtt-syrin-control/wiki/How-To-Use)

## Features
* New Syrinscape Online viewer
* A possibility to import playlists
* Audio & Volume Control
* Ambient sounds (experimental)
* Translations
* Players can trigger moods  & one-shots
* Macro API is extended

### New Syrinscape Online viewer
In the Audio Playlist tab, a new button opens the Syrinscape Online browser.

![image](https://user-images.githubusercontent.com/1165825/227784496-01928ca4-91fa-4666-9b2a-9a052c8d5211.png)

It opens a new window with all your soundsets.

![image](https://user-images.githubusercontent.com/1165825/227784543-7306abd8-8464-42b7-b486-f52d976be24e.png)

### A possibility to import playlists
The new browser allows previewing moods and bulk-create playlists.

![image](https://user-images.githubusercontent.com/1165825/227784593-ba67ab24-d682-408d-87f5-416713cec732.png)

The playlists are no different from native Foundry playlists.

![image](https://user-images.githubusercontent.com/1165825/227784614-639877d7-8ff5-4227-ae39-3d03b1c70584.png)

### Audio & Volume Control

You do not need Syrinscape Player opened to hear sweet moods! SyrinControl will play the audio (both moods and one-shots) directly in the browser tab (alongside the FoundryVTT native audio)!

![image](https://user-images.githubusercontent.com/1165825/184591185-e8648948-7f4c-402c-a591-04278867a07d.png)

This release also brings control of the global volume and one-shots volume.

![image](https://user-images.githubusercontent.com/1165825/227784789-148a39b0-a7a0-4c1b-b623-0a7e390d952f.png)

Additionally, each player can adjust their local volume to their needs.

### Ambient sounds (experimental)

now SyrinControl can well... control, detect and trigger moods (for now only moods) based on the native ambient sound feature.

![image](https://user-images.githubusercontent.com/1165825/213864068-2af853ae-1e02-495a-81d8-c41d66b5500c.png)

### Translations
The English text is no longer hard coded, internationality, yay!

![image](https://user-images.githubusercontent.com/1165825/213864104-af3eaeee-f764-489a-879f-26f880573397.png)

### Players can trigger moods  & one-shots
A GM has to prepare a macro and permit them to run it. It just works (TM).

### Scene - Mood integration
![image](https://user-images.githubusercontent.com/1165825/186473709-a3507547-1380-45d0-b4ad-e9139372dae4.png)

### Macro API is extended

Several functions can be triggered in the macro:

```js
game.syrinscape.playElement(id: number);
game.syrinscape.stopElement(id: number);
game.syrinscape.stopAll();
game.syrinscape.playMood(id: number);
game.syrinscape.soundSources();
game.syrinscape.onlineElements();
game.syrinscape.onlineGlobalElements();
```


