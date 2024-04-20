import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, from } from 'rxjs';
import { AudioStream, StreamState } from 'rxjs-audio';
import * as Tone from 'tone';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  @Input() toneContext$: any
  @Input() recording$: any
  @Input() sourceNode$: any
  @ViewChild('volumeRef') volumeRef!: any
  @ViewChild('seekRef') seekRef!: any

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
  toneContext!: any;

  player!: Tone.Player;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.toneContext$.subscribe((v: any) => {
      this.toneContext = v
      console.log('tone ctx',v)
    })

    this.recording$.subscribe((recordingBlobData: any) => {
      console.log('recording$',recordingBlobData)
      this.recBlob = recordingBlobData
    })

    this.sourceNode$.subscribe((sourceNode: any) => {
      this.sourceNode = sourceNode
      console.log('src node',sourceNode)
    })

  }

  pause() {
   Tone.Transport.pause()
  }

  stop() {
    this.player.stop()
  }

  async  play() {
    await Tone.start()
    this.player = new Tone.Player(this.sourceNode.buffer)
    this.player.toDestination()
    console.log('tone::', this.toneContext)
    const now = Tone.now()
    const time = this.player.now()
    this.player.start(time)

    Tone.Transport.start(time)
    this.player.sync().start(time *10)
    console.log('transport', Tone.Transport.state)
    console.log('player state', this.player.state)
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
