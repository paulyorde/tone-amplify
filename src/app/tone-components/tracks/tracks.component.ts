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

  synth!: any

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

  }

  _startRecording = async () => {
    // await Tone.start()
    // this.synth = new Tone.MembraneSynth().toDestination()
    // this.synth.volume.value = .1;
    // this.synth.triggerAttackRelease("C1", "16n");
    this.startDeviceAudioInputStream()
    if(this.webAudioContext) {
      console.log('web audio context from start recording', this.webAudioContext)
      // Tone.setContext(this.webAudioContext)
    } 
  };


   

  startDeviceAudioInputStream = () => {
    console.log('start::')
    let canvas = document.getElementById('canvas') as HTMLCanvasElement
    navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
      console.log('start stream::',stream)
      this.recordStream(stream)

      /**
       * globaize to 'this' for use in other features
       */
      // let source = this.webAudioContext.createMediaStreamSource(stream)
     
      // this.sourceNode = this.webAudioContext.createMediaStreamSource(stream)
      // let level, smoothLevel= 0, canvasMeter
      // let canvasContext: CanvasRenderingContext2D | null 
      // if(canvas) {
      //   canvasContext = canvas.getContext('2d')
      // }
      // let analyser = this.webAudioContext.createAnalyser()
      // this.sourceNode.connect(analyser)
     
      // let data = new Float32Array(analyser.frequencyBinCount)

      /**
       * get audio buffer data to send to recording
       * something like::
       *  source.connect(recorder)
       * let data = new Float32Array(recorder.frequencyBinCount)
       * recorder.getFloatTimeDomainData(data)
       */

      // function draw() {
      //   requestAnimationFrame(draw)
      //   analyser.getFloatTimeDomainData(data)
      //   canvasContext?.clearRect(0,0,canvas.width, canvas.height)
      //   level = 0
      //   for(let i=0; i<data.length; i++) {
      //     level+=5*Math.abs(data[i])/data.length
         
      //   }
      //   smoothLevel = 0.85*smoothLevel+0.15*level
      //   canvasMeter = canvas.height*(1*smoothLevel)-1
      //   canvasContext?.fillRect(1,canvasMeter,canvas.width,canvas.height)
      //   if(canvasContext) {
      //     canvasContext.fillStyle = 'red'
      //   }
      // }
      // draw()
      // this.webAudioContext.resume()
      this.analyze3D(stream)
    })
    // this.webAudioContext.resume()

  }

  async analyze3D(stream?: MediaStream) {
    // this.webAudioContext.resume()
    console.log('3d')
    
    // let analyser = this.webAudioContext.createAnalyser()
    this.sourceNode = this.webAudioContext.createMediaStreamSource(stream as MediaStream)
    let analyser = this.webAudioContext.createAnalyser()
    await this.sourceNode.connect(analyser)


    // analyser.connect(this.webAudioContext.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 15;
    let barHeight: number;

    let canvas = document.getElementById('canvas') as HTMLCanvasElement

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let  x;
    let ctx: any 
    ctx = canvas.getContext('2d')


   

    function animate() {
      console.log('animate')
      x=0
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // if(analyser) {
      //   console.log('anylyser length is set')
      //   analyser.getByteFrequencyData(dataArray);
      // }
       
      // if(barWidth) {
      //   console.log('barWidth length is set', barWidth)
       
      // }

      // if(barHeight) {
      //   console.log('barHeight length is set', barHeight)
      // }

      // if(bufferLength) {
      //   console.log('buffer length is set', bufferLength)
      // }
      
      // if(barWidth && bufferLength && barHeight) {
      //   console.log('bar height is set')
      //   // drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray, ctx, canvas);
      // }
      analyser.getByteFrequencyData(dataArray);
      drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray, ctx, canvas);
      requestAnimationFrame(animate)

    }
    animate()

    function drawVisualiser(bufferLength: number, x: number, barWidth: number, barHeight: number, dataArray:any, ctx: CanvasRenderingContext2D, canvas: { width: number; height: number; }){
      for (let i = 0; i < bufferLength; i++) {
            console.log('fuff lentgh', bufferLength)
            barHeight = dataArray[i] * 1.5;
            ctx.save();
            let x = Math.sin(i * Math.PI / 180) + 100;
            let y = Math.cos(i * Math.PI / 180) + 100;
            ctx.translate(canvas.width/2 + x, canvas.height/2)
            ctx.rotate( i +  Math.PI * 2/bufferLength);
  
            const hue = i * 0.6 + 200;
            ctx.fillStyle = 'hsl(' + hue + ',100%, 50%)';
            ctx.strokeStyle = 'hsl(' + hue + ',100%, 50%)';
  
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(0,0,0,1)';
  
            ctx.globalCompositeOperation='source-over';
  
            // line
            ctx.lineWidth = barHeight/5;
            ctx.beginPath();
            ctx.moveTo(x,y);
            ctx.lineTo(x, y - barHeight);
            ctx.lineCap = "round";
            ctx.stroke();
            ctx.closePath();
          
            // circle
            ctx.beginPath();
            ctx.arc(0, y + barHeight, barHeight/10, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'hsl(1, 100%, ' + i/3 + '%)';
            ctx.stroke();
  
            ctx.restore();
            x += barWidth;
          }
  }

    // requestAnimationFrame(() => {
    //   if(analyser) {
    //     analyser.getByteFrequencyData(dataArray);
    //   }
       
    //   if(barWidth && bufferLength && barHeight) {
    //     this.drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray, ctx, canvas);
    //   }
    // });

    // await this.animate()
    // this.foo(analyser, dataArray, bufferLength, barWidth, barHeight);
   
  
  }

  // foo(analyser?: any, dataArray?: any, bufferLength?: number, barWidth?: number, barHeight?: number) {
  //   return {ayalyser: analyser, dataArray: dataArray,  barWidth: barWidth, barHeight: barHeight, bufferLength: bufferLength}
  // }

  // async animate() {
  //   // let {ayalyser, dataArray, bufferLength, barWidth, barHeight} = this.foo()
    
      

  //     // if(canvas) {
  //     //   if(ctx) {
          
  //     //   }
  //     // }
  //   requestAnimationFrame(this.animate);
    
  // }

  drawVisualiser(bufferLength: number, x: number, barWidth: number, barHeight: number, dataArray:any, ctx: CanvasRenderingContext2D, canvas: { width: number; height: number; }){
    for (let i = 0; i < bufferLength; i++) {
          console.log('fuff lentgh', bufferLength)
          barHeight = dataArray[i] * 1.5;
          ctx.save();
          let x = Math.sin(i * Math.PI / 180) + 100;
          let y = Math.cos(i * Math.PI / 180) + 100;
          ctx.translate(canvas.width/2 + x, canvas.height/2)
          ctx.rotate( i +  Math.PI * 2/bufferLength);

          const hue = i * 0.6 + 200;
          ctx.fillStyle = 'hsl(' + hue + ',100%, 50%)';
          ctx.strokeStyle = 'hsl(' + hue + ',100%, 50%)';

          ctx.shadowOffsetX = 10;
          ctx.shadowOffsetY = 10;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(0,0,0,1)';

          ctx.globalCompositeOperation='source-over';

          // line
          ctx.lineWidth = barHeight/5;
          ctx.beginPath();
          ctx.moveTo(x,y);
          ctx.lineTo(x, y - barHeight);
          ctx.lineCap = "round";
          ctx.stroke();
          ctx.closePath();
        
          // circle
          ctx.beginPath();
          ctx.arc(0, y + barHeight, barHeight/10, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'hsl(1, 100%, ' + i/3 + '%)';
          ctx.stroke();

          ctx.restore();
          x += barWidth;
        }
}



  
// }


  

  /**
   * start web recorder 
   * send user stream to recorder
   * push data as blobPart as the data comes in
   * create object URL on stop recording
   * send URL to Player 
   * 
   */

  recordStream(stream?: any) {
    const stopButton = document.getElementById('stop')
    const data: any[] | undefined = []
    let recording: any
    this.sourceNode = this.webAudioContext.createBufferSource()
    this.sourceNode.connect(this.webAudioContext.destination)
    recording = this.record(stream, data, this.sourceNode)

    if(stopButton) {
      stopButton.onclick = () => recording.stop()
    }
  }

   record(stream: MediaStream, data: any, sourceNode:any) {
     /**
      * this can be a createMediaStreamDestination()
      * which then can be trasnformed into objectBlobURL or WAV file 
      * web audio book (93)
      */
    const recording = new MediaRecorder(stream)
    recording.start()
    recording.ondataavailable = event => data.push(event.data)
    recording.onstop = () => {
      new Blob(data).arrayBuffer()
      .then(arrayBuffer => this.webAudioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => sourceNode.buffer = audioBuffer)

      this.sourceNodeSubject.next(sourceNode)
    }

    return recording
  }
}
