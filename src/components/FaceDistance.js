import React, { useRef, useEffect } from 'react';
import {
  FaceDetector,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

const FaceDistance = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((error) => {
          console.error('Error accessing webcam:', error);
        });
    }
  }, []);

  const handleFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // const context = canvas.getContext('2d');
    const context = canvas.getContext('webgl')

    if (canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Initialize the face detector
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      const faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
      });

      // Detect faces using the face detector
      const frame = canvas.toDataURL('image/jpeg');
      const detections = await faceDetector.detect(frame).detections;
      console.log(detections);

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw a green circle on the canvas
      context.beginPath();
      context.ellipse(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 3.5,
        canvas.height / 3,
        Math.PI / 2,
        0,
        Math.PI * 2
      );
      context.strokeStyle = 'skyblue';
      context.lineWidth = 8;
      context.stroke();

      // Check face conditions and display appropriate text
      if (detections.length === 0) {
        context.fillStyle = 'red';
        context.fillText('No face detected', canvas.width / 2, canvas.height / 2);
      } 
      

      else {
        console.log ("face detected")
      }


    //   else {

    //     const [face] = detections;
    //     const faceCenterX = (face.boundingBox.originX + face.boundingBox.width) * canvas.width;
    //     const faceCenterY = (face.boundingBox.originY + face.boundingBox.height) * canvas.height;

    //     const circleCenterX = canvas.width / 2;
    //     const circleCenterY = canvas.height / 2;
    //     const circleRadiusX = canvas.width / 3.5;
    //     const circleRadiusY = canvas.height / 3;

    //     const distance = Math.sqrt(
    //       Math.pow(faceCenterX - circleCenterX, 2) +
    //       Math.pow(faceCenterY - circleCenterY, 2)
    //     );

    //     if (distance > circleRadiusX) {
    //       context.fillStyle = 'red';
    //       context.fillText(
    //         'Face outside circle',
    //         canvas.width / 2,
    //         canvas.height / 2
    //       );
    //     } else if (distance < circleRadiusX && distance > circleRadiusX / 2) {
    //       context.fillStyle = 'orange';
    //       context.fillText(
    //         'Face partially inside circle',
    //         canvas.width / 2,
    //         canvas.height / 2
    //       );
    //     } else {
    //       context.fillStyle = 'green';
    //       context.fillText(
    //         'Face correct',
    //         canvas.width / 2,
    //         canvas.height / 2
    //       );
    //     }
    //   }

      const newFrame = canvas.toDataURL('image/jpeg');
      onFrame(newFrame);
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

export default FaceDistance;
