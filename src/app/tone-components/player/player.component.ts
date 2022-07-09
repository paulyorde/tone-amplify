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
  @ViewChild('volumeRef') volumeRef!: any
  @ViewChild('seekRef') seekRef!: any

  currentTimeSubject = new BehaviorSubject<any>(0)
  currentTime$ = this.currentTimeSubject.asObservable()

  durationSubject = new BehaviorSubject<any>(0)
  duration$ = this.durationSubject.asObservable()


  state!: StreamState
  recBlob!: AudioBufferSourceNode;
  toneContext!: any;

  player!: Tone.Player;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.toneContext$.subscribe((v: any) => {
      this.toneContext = v
      console.log('tone ctx',v)
    })

    /** recording for file download */
    this.recording$.subscribe((recordingBlobData: AudioBufferSourceNode) => {
      console.log('recording$',recordingBlobData, 'type::', typeof recordingBlobData)
      this.recBlob = recordingBlobData
    })
  }

  pause() {
  }

  stop() {
    const p1 =this.player.stop()
    // Tone.Transport.stop(0)
    this.recBlob.onended = (ev) => {
      console.log('buffer source onend', ev)
    }
    console.log('player state', this.player.state, 'returne player', p1)

  }

  async  play() {
    if(this.recBlob.buffer) {
      this.player = new Tone.Player(this.recBlob.buffer)
    }
    this.player.toDestination()
    console.log('tone from player::', this.toneContext)
    this.player.start()
    console.log('player state', this.player.state)
  }


  slideVoluem(v: any, e: Event) {
    console.log('volume value', v)
  }

  seek(v: any, e: Event) {
    console.log('seek value', v)
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
    // let anc =document.createElement('a')
    // let rdr = new FileReader()
    // rdr.readAsDataURL(this.recBlob)

    // rdr.onload = () => {
    //   anc.href = rdr.result as string
    //   anc.download = "audio"
    //   anc.click()
    // }
  }

}
