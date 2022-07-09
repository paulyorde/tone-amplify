import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import * as Tone from 'tone';
const AUDIO_ENCODER = require('audio-encoder')
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class TracksComponent implements OnInit {
  @ViewChild('canvas') canvasEle!: ElementRef<HTMLCanvasElement>
  ctx!: CanvasRenderingContext2D;
 
  recordingSubject = new BehaviorSubject<any>(null)
  recording$ = this.recordingSubject.asObservable()

  toneContextSubject = new BehaviorSubject<any>(null)
  toneContext$ = this.toneContextSubject.asObservable()

  audioUrlSubject = new BehaviorSubject<any>(null)
  audioUrl$ = this.audioUrlSubject.asObservable() 
  

  _reverb = new Tone.Reverb({ "wet": 1, "decay": 1.9, "preDelay": 1.00 })
  // options = {debug: true, delayTime: "4n", feedBack: .04}
  _pingPong = new Tone.PingPongDelay()

  userMediaRecording: any

  sourceNode!: any
  analyzerSourceNode!: any

  mediaRecorder: any

  sourceNodeSubject = new BehaviorSubject<any>(null);
  sourceNode$ = this.sourceNodeSubject.asObservable()

  webAudioContext = new AudioContext()
  webAudioContextStateSubject = new BehaviorSubject<any>(null);
  webAudioContext$ = this.webAudioContextStateSubject.asObservable()
  stop3d: boolean = false;
  encoder = AUDIO_ENCODER

  fftSize = 2048;
  toneContext!: Tone.BaseContext;
  toneAnalyser!: AnalyserNode;
  toneMediaStream: any;
  toneRecorder!: Tone.Recorder;
  userMedia!: Tone.UserMedia;
  reqId!: number;
  toneRecordedAudio!: Blob;
  toneAudioUrl!: string;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.toneContextSubject.next(Tone.context)
  }

  ngAfterViewInit(): void {
    if(this.canvasEle) {
      this.ctx = this.canvasEle.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }
  }

  _startRecording = async () => {
    this.startDeviceAudioInputStream()
  };

  startDeviceAudioInputStream =  () => {
    this.userMedia = new Tone.UserMedia().toDestination();
    this.toneContext = Tone.context;

    this.userMedia.open().then(async (stream) => {
      console.log('mic',stream._mediaStream.mediaStream)
      this.toneMediaStream = stream._mediaStream.mediaStream;
      this.recordStream(stream._mediaStream.mediaStream)
      this.analyze3D(stream._mediaStream.mediaStream)
    });
  }

  async recordStream(stream?: any) {
    const stopButton = document.getElementById('stop')

    this.record()
    
    if (stopButton) {
      stopButton.onclick = async () => {
        console.log('tone context state', this.toneContext.state)
        this.toneRecordedAudio = await this.toneRecorder.stop()
        this.toneAudioUrl = URL.createObjectURL(this.toneRecordedAudio);
        console.log('url blob rec', this.toneAudioUrl)
        let toneBuffer = this.toneContext.createBufferSource()

        this.toneRecordedAudio.arrayBuffer()
        .then(arrayBuffer => this.toneContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          if(audioBuffer) {
            toneBuffer.buffer = audioBuffer
            console.log('buffer is set::', toneBuffer.buffer)
          } else {
            console.log('no buffer set')
          }
        })
        this.recordingSubject.next(toneBuffer)

        if(this.toneRecorder.state == 'stopped') {
          console.log('tone context state', this.toneContext.state)
          console.log('tone recorder state', this.toneRecorder.state)
          
        }

        if(this.toneRecorder.state === 'stopped') {
          console.log('record state stop::')
          cancelAnimationFrame(this.reqId)
          this.ctx.clearRect(0, 0, this.canvasEle.nativeElement.width, this.canvasEle.nativeElement.height);
        }
      }
    }
  }

  record() {
    Tone.start()
    this.toneContext.resume;
    this.toneRecorder = new Tone.Recorder()
    this.userMedia.connect(this.toneRecorder)
    this.toneRecorder.start()

    
    /**
     * this can be a createMediaStreamDestination()
     * which then can be trasnformed into objectBlobURL or WAV file 
     * web audio book (93)
     */


    // TODO:  replace with Tone Recorder
    // const recording = new MediaRecorder(stream)
    // recording.start()
    // recording.ondataavailable = event => data.push(event.data)

    // recording.onstop = async () => {
      // const rec = await this.toneRecorder.stop()
      // const url = URL.createObjectURL(rec);
      // console.log('url blob rec', url)
      


      /** Send to Download
       * const arrayBuffer = new Blob(data).arrayBuffer
       * next(arrayBuffer)
       * apply encoder and savaAs in Player
       */
      // this.recordingSubject.next(new Blob(data))

      /**
       * sorce node used sent to player -play
       */

      // Replace with blob from Tone recorder 
      // new Blob(data).arrayBuffer()
      //   .then(arrayBuffer => this.webAudioContext.decodeAudioData(arrayBuffer))
      //   .then(audioBuffer => sourceNode.buffer = audioBuffer)

    /**
     * Auto Downloads MP3
     */
      // new Blob(data).arrayBuffer()
      //   .then(arrayBuffer => this.webAudioContext.decodeAudioData(arrayBuffer))
      //   .then(audioBuffer => this.encoder(audioBuffer, 'WAV', (v: any) => console.log('happeing now',v), (blob:Blob) => {
      //     saveAs(blob, 'sound.mp3')
      //   }))
        
    // }
    /** Send to Player */
    // this.sourceNodeSubject.next(sourceNode)

    // return recording
        
  }


  async analyze3D(stream?: any) {
    const self = this
    console.log('this', self)
    this.sourceNode = this.toneContext.createMediaStreamSource(stream as MediaStream)

    this.toneAnalyser = this.toneContext.createAnalyser();
    await this.sourceNode.connect(this.toneAnalyser)
    this.toneAnalyser.fftSize = 1024;
    const bufferLength = this.toneAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 15;
    let barHeight: number;
    let canvas = document.getElementById('canvas') as HTMLCanvasElement
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let x = 0

    let ctx: any
    ctx = this.ctx
    // ctx = canvas.getContext('2d')
    this.reqId
    

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      self.toneAnalyser.getByteFrequencyData(dataArray);
      drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray, ctx, canvas);
      self.reqId = requestAnimationFrame(animate)
    }
    animate()

    // if(this.toneRecorder.state === 'stopped') {
    //   console.log('record state after stop::')
    //   this.stop3d = true
    //   cancelAnimationFrame(this.reqId)
    //   ctx.clearRect(0, 0, canvas.width, canvas.height);
    // }

    // this.recording$.subscribe(state => {
    //   console.log('tone context state:', state)
    //   if(state=='stopped') {
    //     console.log('record state after stop::', state)
    //     this.stop3d = true
    //     cancelAnimationFrame(reqId)
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
        
    //   } else if(state=='running') {
    //     console.log('running state::', state)
    //   }
    // })
    

    function drawVisualiser(bufferLength: number, x: number, barWidth: number, barHeight: number, dataArray: any, ctx: CanvasRenderingContext2D, canvas: { width: number; height: number; }) {
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 1.5;
        ctx.save();
        let x = Math.sin(i * Math.PI / 180) + 100;
        let y = Math.cos(i * Math.PI / 180) + 100;
        ctx.translate(canvas.width / 2 + x, canvas.height / 2)
        ctx.rotate(i + Math.PI * 2 / bufferLength);

        const hue = i * 0.6 + 200;
        ctx.fillStyle = 'hsl(' + hue + ',100%, 50%)';
        ctx.strokeStyle = 'hsl(' + hue + ',100%, 50%)';

        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,1)';

        ctx.globalCompositeOperation = 'source-over';

        // line
        ctx.lineWidth = barHeight / 5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - barHeight);
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.closePath();

        // circle
        ctx.beginPath();
        ctx.arc(0, y + barHeight, barHeight / 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'hsl(1, 100%, ' + i / 3 + '%)';
        ctx.stroke();

        ctx.restore();
        x += barWidth;
      }
    }
  }

  

 
}
