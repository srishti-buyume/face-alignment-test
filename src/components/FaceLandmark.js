import React, { useRef, useEffect } from 'react';
import vision from "@mediapipe/tasks-vision"; // Import necessary components
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

const Webcam = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Declare necessary variables
  let faceLandmarker;
  let lastVideoTime = -1;

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

  const createFaceLandmarker = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
      },
      outputFaceBlendshapes: true,
      runningMode: "IMAGE",
      numFaces: 1
    });
  };

  
  const handleFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Use the FaceLandmarker for face landmark detection
      if (!faceLandmarker) {
        // Initialize the faceLandmarker
        await createFaceLandmarker();
        console.log("created landmarks")
      }
      
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const faceLandmarkerResult = faceLandmarker.detect(video);
        console.log ("face landmark result", faceLandmarkerResult);
        // Now you can check if specific landmarks are inside the circle
        checkLandmarksInCircle(faceLandmarkerResult.faceLandmarks, canvas);
      }

      // Draw a green circle on the canvas
      context.beginPath();
      context.arc(canvas.width/2, canvas.height/2, canvas.width/3.5, 0, 2 * Math.PI);
      context.strokeStyle = "skyblue";
      context.lineWidth = 8;
      context.stroke();
      context.closePath();

      // Draw a green circle on the canvas
      context.beginPath();
      context.arc(canvas.width/2, canvas.height/2, canvas.width/6, 0, 2 * Math.PI);
      context.strokeStyle = "lightpink";
      context.lineWidth = 8;
      context.stroke();
      context.closePath();

      const frame = canvas.toDataURL('image/jpeg');
      onFrame(frame);
    }
  };

const checkLandmarksInCircle = (landmarks, canvas) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const circleRadius = canvas.width / 3.5;

    const circleRadiusi = canvas.width / 6;
    const circleRadiuso = canvas.width / 2;

    // Landmark points 10 and 389 (zero-based indexing)
    const landmarkPoint10 = landmarks[0][10];
    const landmarkPoint152 = landmarks[0][152];
    const landmarkPoint162 = landmarks[0][162];
    const landmarkPoint389 = landmarks[0][389];


    // Calculate distance from the center of the circle to the landmark points
    const distanceToLandmark10 = Math.sqrt(
    (centerX - landmarkPoint10.x * canvas.width) ** 2 +
    (centerY - landmarkPoint10.y * canvas.height) ** 2
    );

    const distanceToLandmark152 = Math.sqrt(
    (centerX - landmarkPoint152.x * canvas.width) ** 2 +
    (centerY - landmarkPoint152.y * canvas.height) ** 2
    );

    const distanceToLandmark162 = Math.sqrt(
    (centerX - landmarkPoint162.x * canvas.width) ** 2 +
    (centerY - landmarkPoint162.y * canvas.height) ** 2
    );

    const distanceToLandmark389 = Math.sqrt(
    (centerX - landmarkPoint389.x * canvas.width) ** 2 +
    (centerY - landmarkPoint389.y * canvas.height) ** 2
    );

    const ctx = canvas.getContext('2d');
    ctx.font = "25px Arial";
    // Compare distances to circle radius
    if ( distanceToLandmark10 < circleRadiusi && distanceToLandmark152 < circleRadiusi && distanceToLandmark162 < circleRadiusi && distanceToLandmark389 < circleRadiusi ) {
    ctx.fillStyle = 'red';
    ctx.fillText('Too far', canvas.width/2, canvas.height/1.1)
    }
    else if ( distanceToLandmark10 >= circleRadius || distanceToLandmark152 >= circleRadius || distanceToLandmark162 >= circleRadius || distanceToLandmark389 >= circleRadius) {
    ctx.fillStyle = 'red';
    ctx.fillText('Keep face inside the circle', canvas.width/3, canvas.height/1.1)
    console.log('Landmark point 10 is outside the circle');
    }
    else {
    ctx.fillStyle = 'green';
    ctx.fillText('Correct', canvas.width/2, canvas.height/1.1)
    }


    // Draw landmarks for Left Eye (point 10) and Right Eye (point 389)    
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(landmarkPoint10.x * canvas.width, landmarkPoint10.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.arc(landmarkPoint152.x * canvas.width, landmarkPoint152.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(landmarkPoint162.x * canvas.width, landmarkPoint162.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.arc(landmarkPoint389.x * canvas.width, landmarkPoint389.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    };

  // The rest of your code remains the same
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
