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
  // recBlob!: any;
  sourceNode!: any;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // need sourc node .resume() on play
    this.audioStream = new AudioStream();
  

    this.audioStream.getState().subscribe(state => {
      console.log('state', state)
      console.log('state', state.trackInfo.currentTrack)
      this.state = state
    })

    /** recording for file download */
    this.recording$.subscribe((recordingBlobData: any) => {
      console.log('recording$',recordingBlobData)
      this.recBlob = recordingBlobData
    })

    /** source to play audio */
    this.sourceNode$.subscribe((sourceNode: any) => {
      this.sourceNode = sourceNode
      console.log('src node',sourceNode)
    })

  }

  pause() {
   
  }

  stop() {
    // this.audioStream.stop()
    this.sourceNode.stop()
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
   console.log('download')
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
