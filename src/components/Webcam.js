import React, { useRef, useEffect } from 'react';

const Webcam = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((error) => {
          console.error('Error accessing webcam:', error);
        });
    }
  }, []);

  const handleFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    // const canvas = document.createElement('canvas');

    if ( canvas) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
   
    // Draw the video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Draw a green circle on the canvas
    context.beginPath();
    context.arc(canvas.width/2, canvas.height/2, canvas.width/4, 0, 100, false)
    // context.ellipse(canvas.width/2, canvas.height/2, canvas.width/3.5, canvas.height/3, Math.PI/2, 0, Math.PI*2);
    context.strokeStyle = "skyblue";
    context.lineWidth = 8;
    context.stroke();
    
    const frame = canvas.toDataURL('image/jpeg');
    onFrame(frame);
   
    } // if closed
  };

  useEffect(() => {
    const interval = setInterval(handleFrame, 100); 
    return () => clearInterval(interval);
  }, []);


return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ position: 'absolute' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute' }} />
    </div>
  );
};

export default Webcam;
