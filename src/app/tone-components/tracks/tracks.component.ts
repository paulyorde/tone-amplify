import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import * as Tone from 'tone';
import { AudioStream } from 'rxjs-audio';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class TracksComponent implements OnInit {
  audioURLSubject = new BehaviorSubject<any>(null)
  audioURL$  = this.audioURLSubject.asObservable()

 

  _recorder = new Tone.Recorder();
  _audioContext = new Tone.UserMedia()
  _reverb = new Tone.Reverb({ "wet": 1, "decay": 1.9, "preDelay": 1.00 })
  // options = {debug: true, delayTime: "4n", feedBack: .04}
  _pingPong = new Tone.PingPongDelay()

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {

  }

  synth!: any

  _startRecording = async () => {
    this.synth = new Tone.MembraneSynth().toDestination()
    this.synth.volume.value = .1;
    this.synth.triggerAttackRelease("C1", "16n");

    this.startDeviceAudioInputStream()
    await Tone.start()
    this._audioContext.connect(this._recorder)

    this._recorder.start()
  };

  _stopRecording = async () => {
    const recording = await this._recorder.stop();
    let rec = URL.createObjectURL(recording)
    this.audioURLSubject.next(rec)
    // this.audioURLSubject.next(this.sanitizer.bypassSecurityTrustUrl(rec))

    console.log('disconnect record start')
    this._audioContext.disconnect(this._recorder)
    this._recorder.dispose()
    console.log('disconnect record end')
  };

  startDeviceAudioInputStream = () => {
    this._audioContext.open().then(() => {
      console.log("mic open");
    }).catch(e => {
      console.log("mic not open", e);
    })
  }

}
