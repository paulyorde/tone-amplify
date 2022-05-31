export class CanvasUtils {
      // let canvas = document.getElementById('canvas') as HTMLCanvasElement
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
}
