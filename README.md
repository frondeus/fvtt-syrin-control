![](https://img.shields.io/badge/Foundry-v0.8.6-informational)
<!--- Downloads @ Latest Badge -->
<!--- replace <user>/<repo> with your username/repository -->
![Latest Release Download Count](https://img.shields.io/github/downloads/frondeus/fvtt-syrin-control/latest/module.zip)

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2F<your-module-name>&colorB=4aa94a) -->

# SyrinControl - provides control mechanisms for Syrinscape Online
Please, keep in mind that this module **do not** provide audio streaming, **and I do not intent to bring one**. You still need to use Syrinscape Online or some kind of Discord Bot.

![image](https://user-images.githubusercontent.com/1165825/142510009-746f660d-9b6f-4aeb-8841-1503acdc6c56.png)


## Features:
* Link Syrinscape mood to scene - module switches mood automatically when scene gets activated.
* Create playlist with Syrinscape moods
* Play/Stop mood from the playlist
* Simple utility macro for playing elements (like gunshot)
```
game.syrinscape.playElement(180872);
```
* Load moods automatically from Syrinscape API (currently needs CORS proxy, as Syrinscape has strict CORS rules)
* Load moods from CSV file ("Download Remote Control Links" button in Syrinscape Online Master Panel)
* (WIP) QuickInsert integration to quickly find desired soundset (with SuperSyrin you get **A LOT** of soundsets, so its good to switch the mood as quickly as possible when your players detour :) )
* Popup for playing one-shot elements as well as creating handy macros.

## Planned features:
* [ ] Better README how to setup it
* [ ] Volume control
* [ ] Localization
* [ ] Better integration with Syrinscape Online to avoid CORS proxy.
