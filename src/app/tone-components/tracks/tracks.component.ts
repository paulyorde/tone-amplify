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
  recordingSubject = new BehaviorSubject<any>(null)
  recording$ = this.recordingSubject.asObservable()

  toneContextSubject = new BehaviorSubject<any>(null)
  toneContext$ = this.toneContextSubject.asObservable()
  

  _reverb = new Tone.Reverb({ "wet": 1, "decay": 1.9, "preDelay": 1.00 })
  // options = {debug: true, delayTime: "4n", feedBack: .04}
  _pingPong = new Tone.PingPongDelay()

  userMediaRecording: any

  sourceNode!: any

  mediaRecorder: any

  sourceNodeSubject = new BehaviorSubject<any>(null);
  sourceNode$ = this.sourceNodeSubject.asObservable()

  webAudioContext = new AudioContext()

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    Tone.setContext(this.webAudioContext)
    this.toneContextSubject.next(Tone.context)
    console.log('tone ctx', Tone.context)
  }

  _startRecording = async () => {
    this.startDeviceAudioInputStream()
  };

  startDeviceAudioInputStream = () => {

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.recordStream(stream)
      // this.analyze3D(stream)
      console.log('audio state::', this.webAudioContext.state)
    })
  
    
  }

  async analyze3D(stream?: any) {
    this.sourceNode = this.webAudioContext.createMediaStreamSource(stream as MediaStream)
    let analyser = this.webAudioContext.createAnalyser()
    await this.sourceNode.connect(analyser)

    //TODO apply this to play(audio) 
    // analyser.connect(this.webAudioContext.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    console.log('buffer lenght', bufferLength)

    const barWidth = 15;
    let barHeight: number;

    let canvas = document.getElementById('canvas') as HTMLCanvasElement

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let x;
    let ctx: any
    ctx = canvas.getContext('2d')

    function animate() {
      console.log('animate')
      x = 0
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyser.getByteFrequencyData(dataArray);
      drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray, ctx, canvas);
      requestAnimationFrame(animate)
    }
    animate()

    function drawVisualiser(bufferLength: number, x: number, barWidth: number, barHeight: number, dataArray: any, ctx: CanvasRenderingContext2D, canvas: { width: number; height: number; }) {
      for (let i = 0; i < bufferLength; i++) {
        console.log('fuff lentgh', bufferLength)
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

  recordStream(stream?: any) {
    this.webAudioContext.resume()
    const stopButton = document.getElementById('stop')
    const data: any[] | undefined = []
    let recording: any
    this.sourceNode = this.webAudioContext.createBufferSource()
    this.sourceNode.connect(this.webAudioContext.destination)
    recording = this.record(stream, data, this.sourceNode)
    
    if (stopButton) {
      stopButton.onclick = () => {
        recording.stop();
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
      /** Send to Download */
      this.recordingSubject.next(new Blob(data))
      new Blob(data).arrayBuffer()
        .then(arrayBuffer => this.webAudioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => sourceNode.buffer = audioBuffer)
    }
    /** Send to Player */
    this.sourceNodeSubject.next(sourceNode)

    return recording
  }
}
