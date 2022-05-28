import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import * as Tone from 'tone';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class TracksComponent implements OnInit {
  audioURLSubject = new BehaviorSubject<any>(null)
  audioURL$  = this.audioURLSubject.asObservable()

  recordingSubject = new BehaviorSubject<any>(null)
  recording$ = this.recordingSubject.asObservable()

  // _recorder = new Tone.Recorder();
  _audioContext = new Tone.UserMedia()
  synth!: any

  _reverb = new Tone.Reverb({ "wet": 1, "decay": 1.9, "preDelay": 1.00 })
  // options = {debug: true, delayTime: "4n", feedBack: .04}
  _pingPong = new Tone.PingPongDelay()

  analy = document.getElementById('analyzer')
  // toneFFT!: Tone.FFT;

  userMediaRecording: any

 

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {

  }

  _startRecording = async () => {
    // await Tone.start()

    // this.synth = new Tone.MembraneSynth().toDestination()
    // this.synth.volume.value = .1;
    // this.synth.triggerAttackRelease("C1", "16n");

    this.startDeviceAudioInputStream()

    
    // this._audioContext.connect(this._recorder)

    // const toneMeter = new Tone.Meter();

		// this.toneFFT = new Tone.FFT();

		// const toneWaveform = new Tone.Waveform();

    // this._recorder.start()

    



    



    if(this.webAudioContext) {
      console.log('web audio context from start recording', this.webAudioContext)
      
      // Tone.setContext(this.webAudioContext)
    } 
    // let src = this._audioContext.context.createMediaStreamSource()

    
  };

  mediaRecorder: any
  _stopRecording = async () => {
    // const recording = await this._recorder.stop();
    // this.recordingSubject.next(recording)
    // let rec = URL.createObjectURL(recording)
    // this.audioURLSubject.next(rec)
    // this.audioURLSubject.next(this.sanitizer.bypassSecurityTrustUrl(rec))

    console.log('disconnect record start')
    // this._audioContext.disconnect(this._recorder)
    // this._recorder.dispose()
    console.log('disconnect record end')
    
  };

   webAudioContext = new AudioContext()

  startDeviceAudioInputStream = () => {
    console.log('start::')
    let canvas = document.getElementById('canvas') as HTMLCanvasElement
    navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
    console.log('start stream::',stream)
    this.recordStream(stream)

    // this.mediaRecorder = new MediaRecorder(stream)
      let source = this.webAudioContext.createMediaStreamSource(stream)
      let level, smoothLevel= 0, canvasMeter
      let canvasContext: CanvasRenderingContext2D | null 
      if(canvas) {
        canvasContext = canvas.getContext('2d')
      }
      let analyser = this.webAudioContext.createAnalyser()
      source.connect(analyser)
      // source.connect(this.mediaRecorder)
      console.log('source::', source)
      let data = new Float32Array(analyser.frequencyBinCount)
      // get audio buffer data to send to recording 
      function draw() {
        requestAnimationFrame(draw)
        analyser.getFloatTimeDomainData(data)
        canvasContext?.clearRect(0,0,canvas.width, canvas.height)
        level = 0
        for(let i=0; i<data.length; i++) {
          level+=5*Math.abs(data[i])/data.length
         
        }
        smoothLevel = 0.85*smoothLevel+0.15*level
        canvasMeter = canvas.height*(1*smoothLevel)-1
        canvasContext?.fillRect(1,canvasMeter,canvas.width,canvas.height)
        if(canvasContext) {
          canvasContext.fillStyle = 'red'
        }
      }
      draw()
    })

    /**
     * maybe audioContext can connect anaylyzer 
     */

    // need to use web media recorder 

    // Tone.start()
    // this._audioContext.open().then((stream) => {

      
    //   console.log("mic open",stream);
    // }).catch(e => {
    //   console.log("mic not open", e);
    // })

    // pass audio ctx to tone
  }

  /**
   * start web recorder 
   * send user stream to recorder
   * push data as blobPart as the data comes in
   * create object URL on stop recording
   * send URL to Player 
   * 
   */

  recordStream(stream?: any) {
    const recordButton = document.getElementById('start')
    const stopButton = document.getElementById('stop')
    const data: any[] | undefined = []
    let recording: any
    const sourceNode = this.webAudioContext.createBufferSource()
    sourceNode.connect(this.webAudioContext.destination)
    recording = this.record(stream, data, sourceNode)
    // if(recordButton) {
    //   recordButton.onclick = () => {
    //     console.log('start cliecked')
    //     recording = this.record(stream, data, sourceNode)
    //   }
    // }
    if(stopButton) {
      stopButton.onclick = () => recording.stop()
    }
    
  
  }

   record(stream: MediaStream, data: any, sourceNode:any) {
     
    const recording = new MediaRecorder(stream)
    recording.start()
    recording.ondataavailable = event => data.push(event.data)
    recording.onstop = () => {
      new Blob(data).arrayBuffer()
      .then(arrayBuffer => this.webAudioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => sourceNode.buffer = audioBuffer)
      sourceNode.start()
    }
    return recording
  }
 
   
  recordUserMedia(stream: MediaStream) {
    const options = {mimeType: 'audio/webm'};
    const recordedChunks: BlobPart[] | undefined = [] 
    this.mediaRecorder = new MediaRecorder(stream, options)
    const recordListener = of('stop', this.mediaRecorder)

    recordListener.subscribe(v => {
      console.log('recorder listenerCount',v)
      const url = URL.createObjectURL(new Blob(recordedChunks));
      console.log('recorder url',url)
    })

    this.mediaRecorder.addEventListener('dataavailable', function(e:any) {
      if (e.data.size > 0) recordedChunks.push(e.data);
    });

    // rxjs from('stop', mediaRecorder)
    // maybe changes 'this' value

    // this.mediaRecorder.addEventListener('stop', function() {
    //    //= URL.createObjectURL(new Blob(recordedChunks));
    //   downloadLink.download = 'acetest.wav';
    // });

    // stopButton.addEventListener('click', function() {
    //   mediaRecorder.stop();
    // });

    // mediaRecorder.start();

  }

}
