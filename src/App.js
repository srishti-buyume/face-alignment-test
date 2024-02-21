import React, { useState } from 'react';
import Webcam from './components/Webcam';
import FaceDistance from './components/FaceDistance';
import FaceLandmark from './components/FaceLandmark';
import FaceStraightness from './components/FaceStraightness';
import FaceAnalyzer from './components/FaceAnalyzer';

const App = () => {
  const [frame, setFrame] = useState('');

  return (
    <div>
      {/* <Webcam onFrame={setFrame} /> */}
      {/* <FaceDistance onFrame={setFrame} /> */}
      {/* <FaceAnalyzer frame={frame} /> */}
      {/* <FaceLandmark onFrame={setFrame} /> */}
      {/* <FaceStraightness onFrame={setFrame}/> */}
      <FaceAnalyzer onFrame={setFrame} />
    </div>
  );
};

export default App;
