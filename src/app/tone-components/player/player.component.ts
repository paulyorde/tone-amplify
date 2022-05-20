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
  @ViewChild('audioRef') audioRefTS!: ElementRef<HTMLAudioElement>;
  @ViewChild('volumeRef') volumeRef!: any
  @ViewChild('seekRef') seekRef!: any

  // get $player(): HTMLAudioElement {
  //   return this.audioRefTS.nativeElement;
  // }

  currentTimeSubject = new BehaviorSubject<any>(0)
  currentTime$ = this.currentTimeSubject.asObservable()

  durationSubject = new BehaviorSubject<any>(0)
  duration$ = this.durationSubject.asObservable()

  // fooSub = new BehaviorSubject<any>(true)
  // foo$ = this.fooSub.asObservable()

  audioStream!: AudioStream
  state!: StreamState

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.audioStream = new AudioStream();
    this.audioURL$.subscribe((track: any) => {
      this.sanitizer.bypassSecurityTrustUrl(track)
      this.audioStream.loadTrack(track);
    })

    this.audioStream.getState().subscribe(state => {
      console.log('state', state)
      this.state = state
    })
  }

  pause() {
    this.audioStream.pause()
  }

  stop() {
    this.audioStream.stop()
  }

  play() {
    this.audioStream.play()
    this.getCurrentTime()
  }

  getCurrentTime() {
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

  download() {
    // this.$player.preload = 'auto';
  }

}
