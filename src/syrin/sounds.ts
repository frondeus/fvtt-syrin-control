import { DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { Unsubscriber } from "svelte/store";
import { container } from "tsyringe";
import { Context } from "./services/context";

type SyrinAmbientSoundFlags = ElementSoundFlags | MoodSoundFlags;

class SyrinAmbientSound extends AmbientSound {
  syrinFlags?: SyrinAmbientSoundFlags;
  ctx: Context;
  currentlyPlayingMood?: number;
  unsubsriber?: Unsubscriber;
  isCurrentlyPlaying: boolean;
  
  constructor(
    data: AmbientSoundDocument,
    ctx: any
  ) {
    // console.error("Creating syrinscape ambient sound", data);
    super(data);
    // this.syrinFlags = data!.!.syrinscape as SyrinAmbientSoundFlags;
    if (ctx === undefined || ctx === null) {
    	ctx = container.resolve(Context);
      ctx.utils.warn("Ambient Sound context was undefined. Fixing it!");
   }
    this.ctx = (ctx as any).ctx;
    this.isCurrentlyPlaying = false;
    const path = (data as any).path as string;
    const splitted = path.split(':');
    const ty = splitted[1];
    const id = Number(splitted[2].split('.')[0]);
    // console.warn({ splitted, ty, id });
    
    if(ty === "mood") {
      this.syrinFlags = { type: "mood", mood: id };
    } else if (ty === "element") {
      this.syrinFlags = { type: "element", element: id };
    } else {
      return;
    }


    if (this.syrinFlags.type === "mood") {
  
        this.unsubsriber = this.ctx.stores.currentMood.subscribe((mood) => {
          if (this.id !== null) {
          
            if (this.syrinFlags?.type === "mood") {
              const playing = mood?.id === this.syrinFlags.mood;
              this.ctx.utils.trace("Ambient Sound | Update Subscribe", { item: this, playing, mood });
              this.currentlyPlayingMood = mood?.id;
              // this.update({ playing });
            }
        }
      });
    }
    // this.syrinFlags = 
    // this.ctx.utils.error("Creating syrinscape ambient sound");

  }

  override _createSound(): null {
    return null;
  }
  
  override async sync(isAudible: boolean, _volume: number, _options?: Partial<AmbientSound.SyncOptions>): Promise<void> {
      // console.warn("Sync ambient sound", { isAudible, volume, options, flags: this.syrinFlags });
      if(!this.ctx.api.isPlayerActive()) {
        return;
      }
      // if (isAudible && )
      switch (this.syrinFlags?.type) {
        case "mood": {
          if(isAudible && !this.isCurrentlyPlaying) {
            this.isCurrentlyPlaying = true;
            if(this.syrinFlags.mood !== this.currentlyPlayingMood) {
              this.ctx.utils.trace("Playlist Item | Play Mood", { item: this, })
              await this.ctx.api.playMood(this.syrinFlags.mood);
            }
          } else if(!isAudible && this.isCurrentlyPlaying) {
            this.isCurrentlyPlaying = false;
            if(this.syrinFlags.mood === this.currentlyPlayingMood) {
              this.ctx.utils.trace("Playlist Item | Stop Mood", { item: this, })
              await this.ctx.api.stopMood();
            }
          }
          break;
        }
        case "element": {
          if(isAudible) {
            await this.ctx.api.playElement(this.syrinFlags.element);
          } else {
            await this.ctx.api.stopElement(this.syrinFlags.element);
          }
          break;
        }
      }
  }
  
}

interface ElementSoundFlags {
  type: "element",
  element: number
}

interface MoodSoundFlags {
  type: "mood",
  mood: number
}

type SyrinPlaylistSoundFlags = ElementSoundFlags | MoodSoundFlags;

class SyrinPlaylistSound extends PlaylistSound {
    syrinFlags: SyrinPlaylistSoundFlags;
    ctx: Context;
    currentlyPlayingMood?: number;
    unsubsriber?: Unsubscriber;
    /**
     * @param data   - Initial data provided to construct the PlaylistSound document
     * @param parent - The parent Playlist document to which this result belongs
     */
    constructor(
      data: ConstructorParameters<typeof foundry.documents.BasePlaylistSound>[0],
      context?: ConstructorParameters<typeof foundry.documents.BasePlaylistSound>[1]
    ) {
      super(data, context);
      this.syrinFlags = data!.flags!.syrinscape as SyrinPlaylistSoundFlags;
      this.ctx = (context as any).ctx;
      this.ctx.utils.trace("Creating syrinscape playlist sound", { data, context });
      if (this.syrinFlags.type === "mood") {
        const flagsMoodId = this.syrinFlags.mood;
        if (this.path === "./syrinscape-not-a-real-path.wav") {
          setTimeout(() => {
            this.update({path: `syrinscape:${this.syrinFlags.type}:${flagsMoodId}.wav`});
          },10);
        }
        this.unsubsriber = this.ctx.stores.currentMood.subscribe((mood) => {
          if (this.id !== null) {
          
          if (this.syrinFlags.type === "mood") {
            const playing = mood?.id === this.syrinFlags.mood;
            this.ctx.utils.trace("Playlist Item | Update Subscribe", { item: this, playing, mood });
            this.currentlyPlayingMood = mood?.id;
            this.update({ playing });
          }
        }
        });
      }
    
      // this.ctx.stores.currentlyPlaying.subscribe((currentlyPlaying) => {
      //   const playing = currentlyPlaying.elements.has(this.flags.element);
      //   this.playerIsPlaying = playing;
      //   this.update({ playing });
      // });
    }
  
  
    override async sync(): Promise<void> {
      if(!this.ctx.api.isPlayerActive()) {
        return;
      }
        // console.warn("Syrin! Sync!", {flags: this.syrinFlags, that: this});
      switch (this.syrinFlags.type) {
        case "mood": {
          if(this.playing) {
            if(this.syrinFlags.mood !== this.currentlyPlayingMood) {
              this.ctx.utils.trace("Playlist Item | Play Mood", { item: this, })
              await this.ctx.api.playMood(this.syrinFlags.mood);
            }
          } else {
            if(this.syrinFlags.mood === this.currentlyPlayingMood) {
              this.ctx.utils.trace("Playlist Item | Stop Mood", { item: this, })
              await this.ctx.api.stopMood();
            }
          }
          break;
        }
        case "element": {
          if(this.playing) {
            await this.ctx.api.playElement(this.syrinFlags.element);
          } else {
            await this.ctx.api.stopElement(this.syrinFlags.element);
          }
          break;
        }
      }
    }

    override _createSound(): null { return null; }

    override _onDelete(options: DocumentModificationOptions, userId: string): void {
      this.unsubsriber?.call([]);
      super._onDelete(options, userId);
    }
  
}

interface SyrinPlaylistFlags {
  soundset: string,
}

class SyrinPlaylist extends Playlist {
    syrinFlags: SyrinPlaylistFlags;
    ctx: Context;
    unsubsriber?: Unsubscriber;

    constructor(
      data: ConstructorParameters<typeof foundry.documents.BasePlaylist>[0],
      context?: ConstructorParameters<typeof foundry.documents.BasePlaylist>[1]
    ) {
      super(data, context);
      this.syrinFlags = data!.flags!.syrinscape as SyrinPlaylistFlags;
      this.ctx = (context as any).ctx;

        this.unsubsriber = this.ctx.stores.currentSoundset.subscribe((soundset) => {
            if(this.id !== null) {
              const playing = soundset?.id === this.syrinFlags.soundset;
              // debugger;
              this.update({ playing });
            } 
        });
      // this.ctx.stores.currentlyPlaying.subscribe((currentlyPlaying) => {
      //   const playing = currentlyPlaying.soundset?.id === this.flags.soundset;
      //   // const updateData = { };
      //   // if(playing !== this.data.playing) {
      //   //   updateData.playing = playing;
      //   // }

      //   // updateData.sounds = this.sounds.map(s => {
      //   //   const soundPlaying = currentlyPlaying.elements.has(s.data.flags.syrinscape.element);
      //   //   return { _id: s.id, playing: soundPlaying };
      //   // }); 
      //     // this.playerIsPlaying = playing;
      //   // console.warn("Playlist update", updateData);
      //   // this.update(updateData);
      // });
    }
  
    override async playAll(): Promise<undefined> {
      return undefined;
      // if(this.ctx.api.isPlayerActive()) {
      //   // console.warn("Syrin! PlayAll!", {flags: this.flags, data: this.data, that: this});
      //     await this.ctx.api.playMood(this.flags.mood);
      //   // this.update({ playing: true });
      // }
    }
    
    override async stopAll(): Promise<undefined> {
      // if(this.ctx.api.isPlayerActive()) {
      //     await this.ctx.api.stopMood();
      //   // this.update({ playing: false });
      // }
    return undefined;
    }
  
    override _onDelete(options: DocumentModificationOptions, userId: string): void {
      // debugger;
      this.unsubsriber?.call([]);
      this.sounds.clear();
      super._onDelete(options, userId);
    }
}

function handler< T extends object & (new (...args: any[]) => any), S extends object & (new (...args: any[]) => any) >(ctx: Context, t: T, s: S): ProxyHandler<T> {
  return {
    construct(_: T, args: ConstructorParameters<T>) {
      // console.log("ARGS",  args);
      const syrinscapeFlags = args[0]?.flags?.syrinscape;
      const syrinscapePath: string | undefined = args[0]?.path;
      const isSyrinscapeControlled = 
        syrinscapePath?.startsWith("syrinscape:") ||
        syrinscapeFlags !== undefined;
      if (!isSyrinscapeControlled) {
        return new t(...args);
      }

      if (args[1] === undefined) {
        args[1] = {};
      }
      (args[1] as any).ctx = ctx;
      return new s(...args);
    }
  };
}


export function createProxies(ctx: Context) {
  const PlaylistSoundProxy: typeof PlaylistSound = new Proxy(PlaylistSound, handler(ctx, PlaylistSound, SyrinPlaylistSound));
  const PlaylistProxy: typeof Playlist = new Proxy(Playlist, handler(ctx, Playlist, SyrinPlaylist));
  const AmbientSoundProxy: typeof AmbientSound = new Proxy(AmbientSound, handler(ctx, AmbientSound, SyrinAmbientSound));

  return {
    PlaylistSoundProxy,
    PlaylistProxy,
    AmbientSoundProxy
  }
};
