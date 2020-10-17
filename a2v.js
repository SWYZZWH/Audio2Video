const audiofile = document.getElementById("audiofile");

let file;
let audioBuff;

audiofile.addEventListener("change", function () {
  //get upload audio file
  file = this.files[0];
  let reader = new FileReader();

  //record user's chocie
  let graphkind = "time";
  let graphselect = document.getElementById("graphselect");
  graphkind = graphselect.options[graphselect.selectedIndex].value;

  //when the audio file is loaded, trigger
  reader.onload = function () {
    let arrBuffer = this.result;
    const audioCtx = new AudioContext();
    //decode the arrBuffer to audioBuffer
    audioCtx.decodeAudioData(arrBuffer, function (audioBuffer) {
      //audioBuff = audioBuffer;
      const source = this.createBufferSource();
      source.buffer = audioBuffer;
      
      //build and set analyser
      /**
       * @type AudioContext
       */
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const bufferLen = analyser.frequencyBinCount;

      //connect everything
      source.connect(analyser);
      //play audio using speaker
      analyser.connect(audioCtx.destination);

      //save last 60 frames message
      const cacheSize = 240;
      const cache = new Array(cacheSize);
      for (let i = 0; i < cacheSize; i++) {
        cache[i] = new Uint8Array(bufferLen);
        cache[i].fill(128.0);
      }

      //build canvas
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

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(255,255,255)";

        canvasCtx.beginPath();
        const sliceWidth = (canvas.width * 1.0) / (bufferLen * cacheSize);
        let x = 0;

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
        requestAnimationFrame(drawBar);
        const dataArray = new Uint8Array(bufferLen);
        analyser.getByteFrequencyData(dataArray);
        const barWidth = canvas.width / bufferLen * 3;
        let x = 0;
        for(let i = 0 ; i < bufferLen; i++){
          let y = dataArray[i];
          canvasCtx.strokeStyle = "#ffffff";
          ctx.lineWidth = 3;
          canvasCtx.strokeRect(x, canvas.height - y, barWidth*0.8, canvas.height);
          x += barWidth;
        }
      }

      //start point
      source.start();
      //draw different graphs according to user's choice
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
