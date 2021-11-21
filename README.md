![](https://img.shields.io/badge/Foundry-v0.8.6-informational)
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
* Popup for playing one-shot elements as well as creating handy macros.
* Simple utility macro for playing elements (like gunshot)
```
game.syrinscape.playElement(180872);
```
* Load moods from CSV file ("Download Remote Control Links" button in Syrinscape Online Master Panel)
* Load moods automatically from Syrinscape API (currently needs CORS proxy, as Syrinscape has strict CORS rules)
* (WIP) QuickInsert integration to quickly find desired soundset (with SuperSyrin you get **A LOT** of soundsets, so its good to switch the mood as quickly as possible when your players detour :) )

## How to use

![Usage](https://user-images.githubusercontent.com/1165825/142780722-85a9163b-4afa-4f61-b2be-df89519194e0.png)

First of all in Playlists tab you have a new section "Syrinscape Online".
Here you can see currently playing mood (1 & 2)
You can select new mood by first selecting the soundset (1) and then mood (2).

Below there are control buttons (3 & 4 & 5).
* Play/Stop button (3)
* Add to playlist (4)
* Open Elements window (A)

Below control buttons you can see playlist (6). Here you can keep frequently used moods that are not significant enough to make them as a separate Foundry Scene.

You can either Play/Stop the entry (7) or remove it (8) from the list.

Last but not least - the most interesting feature - Scene synchronization.

Each FoundryVTT scene can (but doesn't have to) have linked Syrinscape Mood. Whenever GM activates the scene, mood will be switched!
For example you might have a dungeon, or a tavern, and whenever players go there, bam! A nice mood to increase imersion.

Please keep in mind, that Syrinscape is a global experience - All players will hear exactly the same sound.
That means, you cannot switch only one player to new epic Scene while the rest stays in the tavern. All players are going to hear epic music.

Use dropdown menus (9 & 10) to set mood for a scene.

And finally, Syrinscape One-Shots. Here you have a list of currently available sounds like a swing of a sword or gunshot. You can either play it (and keep the window opened as a DJ console) (11), or you can generate handy macro and save your favorite one-shots for later (12).

All macros are available in the standard macro folder.

You can use macros for one-shots even those not present for current playing soundset.


## How to setup

### 1. Get Authentication token
Go to [Syrinscape Online Control Panel](https://syrinscape.com/online/cp).
On left side of the panel, there is a section "Your token can allow third party services to control your Syrinscape devices".
Click "Copy" button.

![Setup 1](https://user-images.githubusercontent.com/1165825/142780736-70118de0-32bc-4cd7-8d95-055cd44dc054.png)

Next go to Module Settings in Foundry VTT and paste the token in "Auth Token" field.

![Setup 2](https://user-images.githubusercontent.com/1165825/142780756-4e4a23b7-b511-4e22-afbd-8012435e59b1.png)

> Note: This step is mandatory, Syrinscape wont allow you to play any sound or mood without it.

### 2. Choose synchronization method
There are two main synchronization methods:
* Via uploading a CSV file, or
* Via Syrinscape Online API

#### 2.A CSV file (default, easier method)
Go to [Syrinscape Online Master Interface](https://syrinscape.com/online/master/#/).
In top right corner, click hamburger menu and click "Download Remote Control Links (CSV)".

![Setup 3](https://user-images.githubusercontent.com/1165825/142780769-a4a6ea4c-8372-4580-a31e-190578e8f83f.png)

![Setup 4](https://user-images.githubusercontent.com/1165825/142780784-e0513ba6-877c-4a28-8041-72410cb49936.png)


> Warning: This file might weight up to 20-30 MB (depending how many soundsets you have in your library).
> It might be necessary to upload this file to Foundry server using external uploader.

Next, upload this file to the Foundry and select it in Module Settings under "Control Links" field.

![Setup 5](https://user-images.githubusercontent.com/1165825/142780804-459a78f3-6947-4172-9a22-e95c373b90a1.png)

![Setup 6](https://user-images.githubusercontent.com/1165825/142780821-523ffa34-4ec0-4ecc-9ea6-c7cef86883b6.png)


Save Changes in Module Settings - SyrinControl will parse the CSV file and hydrate its library with new moods, soundsets and elements.
Now you are ready to play some music!

#### 2.B Online API (experimental, requires additional knowledge, next generation)

> Warning: While this method is somehow superior (does not require uploading CSV files, your Foundry is up-to-date with Syrinscape all the time), currently it has some technical limitations, and requires extra CORS proxy.
> With Foundry Team and Syrinscape Devs we are currently working on solving those limitations to provide easy-to-use solution for all GMs.
>
> Nevertheless, if you are determined enough, here are tips how to enable it now :)

Currently Syrinscape Online API denies access with CORS (Cross-Origin Resource Sharing) enabled.
It means, while Foundry game can send "Fire and Forget" kinds of requests to Syrinscape (requests where we do not wait for the response, for example "Set Mood", or "Play Element"), it cannot send request to retrieve all soundsets in GM library.

However, this is only the limitation of the browser, not the server. It means, you can setup a CORS proxy server that would redirect traffic to Syrinscape Online API and set correct CORS header allowing Foundry to listen on responses.

[CORS anywhere](https://github.com/Rob--W/cors-anywhere) seems to be a fine solution.

Because SyrinControl needs only GM access and runs in browser, it means, you do not need pay for extra hosting.
You can run this server **on localhost**.

> If you run FoundryVTT under HTTPS connection (for example by using ForgeVTT hosting), you **need to hide the CORS proxy under HTTPS proxy or setup the CORS with HTTPS certs**. This HTTPS certificate, however can be self-signed.

``` javascript
var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8080;

var cors_proxy = require('cors-anywhere');

cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});
```

Now, with CORS (+ HTTPS nginx) running, go to Module Settings and modify "Syrinscape API address".
Prepend it with `http://localhost:8000/` or `https://localhost:8443`. Exact value depends on your setup.

![Setup 7](https://user-images.githubusercontent.com/1165825/142780850-bbbf2948-f512-40e0-b5fb-e7942a1748c6.png)


Thats it! No CSV, no hassle.


##### Docker-compose example
Note: If you have experience with `docker` and `docker-compose`, you can look at `docs/cors/docker-compose.yml`. 
I prepared NGINX proxy and CORS proxy with self-signed certificate.

Just go to directory and run `docker-compose up`.
In Syrinscape API address you can set: `https://localhost:8443/cors/https://syrinscape.com/online/frontend-api/` and enjoy the music.


## Planned features:
* [ ] Volume control
* [ ] Localization
* [ ] Better integration with Syrinscape Online to avoid CORS proxy.
