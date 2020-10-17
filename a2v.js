const audiofile = document.getElementById("audiofile");

let file;
let audioBuff;

audiofile.addEventListener("change", function () {
  file = this.files[0];
  let reader = new FileReader();
  let graphkind = "time";
  let graphselect = document.getElementById("graphselect");
  graphkind = graphselect.options[graphselect.selectedIndex].value;
  reader.onload = function () {
    let arrBuffer = this.result;
    const audioCtx = new AudioContext();
    audioCtx.decodeAudioData(arrBuffer, function (audioBuffer) {
      audioBuff = audioBuffer;
      const source = this.createBufferSource();
      source.buffer = audioBuff;
      
      //start analyze the audio
      /**
       * @type AudioContext
       */
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const bufferLen = analyser.frequencyBinCount;

      //save last 60 frames message
      const cacheSize = 240;
      const cache = new Array(cacheSize);
      for (let i = 0; i < cacheSize; i++) {
        cache[i] = new Uint8Array(bufferLen);
        cache[i].fill(128.0);
      }

      //connect everything
      //analyser.getByteTimeDomainData(dataArray);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      /**
       * @type HTMLCanvasElement
       */
      const canvas = document.getElementById("canvas");
      const canvasCtx = canvas.getContext("2d");

      function drawWave() {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        //notice the browser to call draw function before drawing next frame
        requestAnimationFrame(drawWave);

        const dataArray = new Uint8Array(bufferLen);
        //acquire decode message for current frame
        analyser.getByteTimeDomainData(dataArray);
        cache.shift();
        cache.push(dataArray);

        //draw waveframes
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(255,255,255)";

        canvasCtx.beginPath();
        const sliceWidth = (canvas.width * 1.0) / (bufferLen * cacheSize);
        let x = 0;

        //draw a line for every xxx points

        //const smooth = 10;
        //let sumSmooth = 0;
        for (let i = 0; i < cacheSize ; i++) {
          for(let j = 0; j < bufferLen; j++){
            let y = ((cache[i][j] / 256.0) * canvas.height) / 2.0 + canvas.height / 4;
            if (i == 0 && j == 0) {
              canvasCtx.moveTo(x, y); 
            } else if (j % 10 == 0){
              canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
          }
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      }

      function drawBar(){
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.fillStyle = "rgb(51,51,51)";
        canvasCtx.globalAlpha = 0.0;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawBar);
        const dataArray = new Uint8Array(bufferLen);
        analyser.getByteFrequencyData(dataArray);
        const barWidth = canvas.width / bufferLen /2;
        let x = 0;
        for(let i = 0 ; i < bufferLen; i++){
          let y = dataArray[i];
          canvasCtx.stokeStyle = "rgb(255,255,255)";
          //canvasCtx.globalAlpha = 1 - barWidth / canvas.width;
          canvasCtx.Rect(x, canvas.height - y, x+barWidth*0.98, canvas.height);
          canvasCtx.stroke();
          x+=barWidth;
        }
      }

      source.start();
      if(graphkind == "time")
        drawWave();
      else
        drawBar();
    });
  };
  reader.readAsArrayBuffer(file);
});


const resetButton = document.getElementById("resetbutton");
resetButton.onclick = function(){
    location.reload();
};
