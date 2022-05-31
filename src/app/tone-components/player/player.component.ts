import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, from } from 'rxjs';
import { AudioStream, StreamState } from 'rxjs-audio';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  @Input() audioURL$: any
  @Input() recording$: any
  @Input() sourceNode$: any
  @ViewChild('audioRef') audioRefTS!: ElementRef<HTMLAudioElement>;
  @ViewChild('volumeRef') volumeRef!: any
  @ViewChild('seekRef') seekRef!: any

  audUrl: any
  currentTimeSubject = new BehaviorSubject<any>(0)
  currentTime$ = this.currentTimeSubject.asObservable()

  durationSubject = new BehaviorSubject<any>(0)
  duration$ = this.durationSubject.asObservable()

  // fooSub = new BehaviorSubject<any>(true)
  // foo$ = this.fooSub.asObservable()

  audioStream!: AudioStream
  state!: StreamState
  recBlob!: Blob;
  sourceNode!: any;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // need sourc node .resume() on play
    this.audioStream = new AudioStream();
    this.audioURL$.subscribe((track: any) => {
      /**
       * gets URLBlob created in Track
       */
      this.sanitizer.bypassSecurityTrustUrl(track)
      this.audioStream.loadTrack(track);
      this.audUrl = this.sanitizer.bypassSecurityTrustUrl(track);
      console.log(track, 'trck')
      console.log(this.audUrl.changingThisBreaksApplicationSecurity, ' aud url')
      console.log('stream', this.audioStream)
    })

    this.audioStream.getState().subscribe(state => {
      console.log('state', state)
      console.log('state', state.trackInfo.currentTrack)
      this.state = state
    })

    this.recording$.subscribe((v: any) => {
      console.log('recording$',v)
      this.recBlob = v
    })

    /**
     * source coming should be able to play w/out setting url
     */
    this.sourceNode$.subscribe((sourceNode: any) => {
      console.log(sourceNode,'source node subscribe')
      let rec
      if(sourceNode) {
        //  rec = URL.createObjectURL(sourceNode.mediaStream)

      }
      console.log('recd::',rec)
      this.sourceNode = sourceNode
      this.sanitizer.bypassSecurityTrustUrl(sourceNode)
      this.audioStream.loadTrack(sourceNode);
      this.audUrl = this.sanitizer.bypassSecurityTrustUrl(sourceNode);
      
    })

  }

  pause() {
    this.audioStream.pause()
  }

  stop() {
    this.audioStream.stop()
  }

  play() {
    // this.audioStream.play()
    // this.getAudioEvents()
    this.sourceNode.start()

  }

  getAudioEvents() {
    this.audioStream.events().subscribe(event => {
      console.log('event',event)
      if(event.type === 'pause') {
        console.log('goose me time evnet')
      }
    })
  }

  slideVoluem(v: any, e: Event) {
    console.log('volume value', v)
    this.audioStream.setVolume(v)
  }

  seek(v: any, e: Event) {
    console.log('seek value', v)
    this.audioStream.seekTo(v)
  }

  convertTime(time: number) {
  }

  upload() {
    let upload =  document.getElementById('uploadAudioFie')
    upload?.addEventListener('change', (e) => {
      console.log('upload dir', e)

    })
  }

 async download() {
    let anc =document.createElement('a')
    let rdr = new FileReader()
    rdr.readAsDataURL(this.recBlob)

    rdr.onload = () => {
      anc.href = rdr.result as string
      anc.download = "audio"
      anc.click()
    }
    
  }

}
