import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, from } from 'rxjs';
import * as Tone from 'tone';
const AUDIO_ENCODER = require('audio-encoder')
import { saveAs } from 'file-saver'



@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  @Input() recording$: any
  @ViewChild('volumeRef') volumeRef!: any
  @ViewChild('seekRef') seekRef!: any

  currentTimeSubject = new BehaviorSubject<any>(0)
  currentTime$ = this.currentTimeSubject.asObservable()

  durationSubject = new BehaviorSubject<any>(0)
  duration$ = this.durationSubject.asObservable()

  audioBufferNode!: AudioBufferSourceNode;

  player!: Tone.Player;
  encoder = AUDIO_ENCODER

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    /** recording from track */
    this.recording$.subscribe((recordingBlobData: AudioBufferSourceNode) => {
      console.log('recording$',recordingBlobData, 'type::', typeof recordingBlobData)
      this.audioBufferNode = recordingBlobData
    })
  }

  pause() {
  }

  stop() {
    this.player.stop()
    this.audioBufferNode.onended = (ev) => {
      console.log('buffer source onend', ev)
    }
  }

  async play() {
    Tone.start()
    this.player = new Tone.Player((this.audioBufferNode.buffer) as AudioBuffer)
    .toDestination()
    .start()
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
   this.encoder(this.audioBufferNode.buffer, 'WAV', (v: any) => console.log('happeing now', v), (blob:Blob) => {
    saveAs(blob, 'sound.mp3')
  })
    // let anc =document.createElement('a')
    // let rdr = new FileReader()
    // if(this.audioBufferNode !== null) {
    //   rdr.readAsDataURL(this.audioBlob)

    // }

    // rdr.onload = () => {
    //   anc.href = rdr.result as string
    //   anc.download = "audio"
    //   anc.click()
    // }
  }

}
