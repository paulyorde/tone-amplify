import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import * as Tone from 'tone';
const AUDIO_ENCODER = require('audio-encoder')
import { saveAs } from 'file-saver'
import * as THREE from 'three'

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class TracksComponent implements OnInit {
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
  audioLoader = new THREE.AudioLoader();
  listener = new THREE.AudioListener();
  audio = new THREE.Audio(this.listener);

  // audio.crossOrigin = "anonymous";
  // audioLoader.load(stream, function(buffer) {
  //   audio.setBuffer(buffer);
  //   audio.setLoop(true);
  //   audio.play();
  // });

  

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    console.log('encoder',this.encoder)
    Tone.setContext(this.webAudioContext)
    this.toneContextSubject.next(Tone.context)
    console.log('tone ctx', Tone.context)
  }

  _startRecording = async () => {
    this.startDeviceAudioInputStream()
  };

  startDeviceAudioInputStream =  () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(async (stream) => {
      


      if(this.webAudioContext.state == 'suspended') {

       await this.webAudioContext.resume()
       this.webAudioContextStateSubject.next('running')
      }
      this.recordStream(stream)
      this.analyze3D(stream)
      console.log('audio state::', this.webAudioContext.state)
      
    })
  
    
  }


  async analyze3D(stream?: any) {
    const self = this
    this.sourceNode = this.webAudioContext.createMediaStreamSource(stream as MediaStream)
    let analyser = this.webAudioContext.createAnalyser()
    await this.sourceNode.connect(analyser)
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = 15;
    let barHeight: number;
    let canvas = document.getElementById('canvas') as HTMLCanvasElement
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let x;
    let ctx: any
    ctx = canvas.getContext('2d')
    let reqId: number
    

    function animate() {
      
      x = 0
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyser.getByteFrequencyData(dataArray);
      drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray, ctx, canvas);
      
      reqId = requestAnimationFrame(animate)

      if(self.stop3d) {
        console.log('3d stop')
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate()

    this.webAudioContext$.subscribe(state => {
      if(state=='suspended') {
        console.log('uss state::', state)
        this.stop3d = true
        cancelAnimationFrame(reqId)
        
      } else if(state=='running') {
        console.log('running state::', state)
      }
    })
    

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

  reqId!: any

  async recordStream(stream?: any) {
    if(this.webAudioContext.state == 'suspended') {
     await this.webAudioContext.resume()
     this.webAudioContextStateSubject.next('running')
    }
    const stopButton = document.getElementById('stop')
    const data: any[] | undefined = []
    let recording: any
    this.sourceNode = this.webAudioContext.createBufferSource()
    this.sourceNode.connect(this.webAudioContext.destination)
    recording = this.record(stream, data, this.sourceNode)
    
    if (stopButton) {
      stopButton.onclick = async () => {
        recording.stop();
        if(this.webAudioContext.state == 'running') {
          await this.webAudioContext.suspend()
          this.webAudioContextStateSubject.next('suspended')
        }
        // this.webAudioContext.suspend()
        // this.recordingSubject.next(recording)
        // if (this.webAudioContext.state === 'running') {
        //   this.webAudioContext.suspend().then(function (v) {
            
        //     console.log('susspended')
        //   })
        // }
        
      }
    }
  }

  record(stream: MediaStream, data: any, sourceNode: any) {
    /**
     * this can be a createMediaStreamDestination()
     * which then can be trasnformed into objectBlobURL or WAV file 
     * web audio book (93)
     */
    const recording = new MediaRecorder(stream)
    recording.start()
    recording.ondataavailable = event => data.push(event.data)

    recording.onstop = () => {
      /** Send to Download
       * const arrayBuffer = new Blob(data).arrayBuffer
       * next(arrayBuffer)
       * apply encoder and savaAs in Player
       */
      this.recordingSubject.next(new Blob(data))

      /**
       * sorce node used sent to player -play
       */
      new Blob(data).arrayBuffer()
        .then(arrayBuffer => this.webAudioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => sourceNode.buffer = audioBuffer)

     

    //   let rdr = new FileReader()
    // rdr.readAsDataURL(this.recBlob)
      new Blob(data).arrayBuffer()
        .then(arrayBuffer => this.webAudioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => this.encoder(audioBuffer, 'WAV', (v: any) => console.log('happeing now',v), (blob:Blob) => {
          saveAs(blob, 'sound.mp3')
        }))

        // new Blob(data).arrayBuffer()
        // .then(arrayBuffer => this.webAudioContext.decodeAudioData(arrayBuffer))
        // .then(audioBuffer => this.encoder(audioBuffer, 'WAV', (v: any) => console.log('happeing now',v), (blob:Blob) => {
        //   // pass blob to three as obj blob
        //   // aduio setbuffer
        //    this.audio.setBuffer(audioBuffer);
        //    console.log('3 buffer', this.audio.buffer)

        // }))

    // this.audioUrlSubject.next(sourceNode.buffer)  
        
    }
    /** Send to Player */
    this.sourceNodeSubject.next(sourceNode)

    return recording
  }

 
}
