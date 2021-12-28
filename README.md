![](https://img.shields.io/badge/Foundry-v0.8.6-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/frondeus/fvtt-syrin-control/latest/module.zip)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffvtt-syrin-control&colorB=4aa94a)

# SyrinControl - provides control mechanisms for Syrinscape Online

Please, keep in mind that this module **do not** provide audio streaming, **and I do not intent to bring one**. You still need to use Syrinscape Online or some kind of Discord Bot.

## Features:

- Link Syrinscape mood to scene - module switches mood automatically when scene gets activated.
- Create playlist with Syrinscape moods
- Play/Stop mood from the playlist
- Popup for playing one-shot elements as well as creating handy macros.
- Simple utility macro for playing elements (like gunshot)

```
game.syrinscape.playElement(180872);
```

- Load moods from CSV file ("Download Remote Control Links" button in Syrinscape Online Master Panel)
- Load moods automatically from Syrinscape API (currently needs CORS proxy, as Syrinscape has strict CORS rules)

## How to:
- [Setup](https://github.com/frondeus/fvtt-syrin-control/wiki/Setup)
- [Use](https://github.com/frondeus/fvtt-syrin-control/wiki/How-To-Use)
