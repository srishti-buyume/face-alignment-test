import React, { useRef, useEffect } from 'react';
import vision from "@mediapipe/tasks-vision"; // Import necessary components
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

const FaceStraightness = ({ onFrame }) => {
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
    // Get the (x, y) coordinates of keypoints for the right profile
    const rightProfileKeypoints = [
      landmarks[0][10], landmarks[0][338], landmarks[0][297], landmarks[0][332],
      landmarks[0][284], landmarks[0][251], landmarks[0][389], landmarks[0][356],
      landmarks[0][454], landmarks[0][323], landmarks[0][361], landmarks[0][288],
      landmarks[0][397], landmarks[0][365], landmarks[0][379], landmarks[0][378],
      landmarks[0][400], landmarks[0][377], landmarks[0][152]
    ];
  
    // Get the (x, y) coordinates of keypoints for the left profile
    const leftProfileKeypoints = [
      landmarks[0][148], landmarks[0][176], landmarks[0][149], landmarks[0][150],
      landmarks[0][136], landmarks[0][172], landmarks[0][58], landmarks[0][132],
      landmarks[0][93], landmarks[0][234], landmarks[0][127], landmarks[0][162],
      landmarks[0][21], landmarks[0][54], landmarks[0][103], landmarks[0][67],
      landmarks[0][109], landmarks[0][109], landmarks[0][109]
    ];
  
    // Calculate the area of the right profile contour
    const rightProfileArea = calculateContourArea(rightProfileKeypoints, canvas);
  
    // Calculate the area of the left profile contour
    const leftProfileArea = calculateContourArea(leftProfileKeypoints, canvas);
  
    // Calculate the ratio of areas
    const ratio = leftProfileArea / rightProfileArea;
  
    // Compare the ratio to determine if the face is straight
    if (ratio <= 1.5 && ratio >= 0.5) {
      console.log('Looking Straight');
    } else {
      console.log('Not Looking Straight');
    }
  };
  
  const calculateContourArea = (contour, canvas) => {
    let area = 0;
    for (let i = 0; i < contour.length; i++) {
      const point1 = contour[i];
      const point2 = contour[(i + 1) % contour.length];
      area += (point2.x * canvas.width - point1.x * canvas.width) * (point2.y * canvas.height + point1.y * canvas.height);
    }
    return Math.abs(area) / 2;
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

export default FaceStraightness;
