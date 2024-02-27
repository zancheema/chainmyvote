import Webcam from "react-webcam";
import { useCallback, useRef, useState } from "react";

export default ({onCameraClosed, onPictureCaptured}) => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);

    // create a capture function
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };

    const saveImage = () => {
        onPictureCaptured(imgSrc);
        onCameraClosed();
    };

    const closeCamera = () => {
        onCameraClosed();
        setImgSrc(null);
    };

    return (
        <div className="container">
            {imgSrc ? (
                <img src={imgSrc} alt="webcam" />
            ) : (
                <Webcam ref={webcamRef} />
            )}
            <div className="btn-container">
                {imgSrc ? (
                    <>
                        <button onClick={saveImage}>Save Image</button>
                        <button onClick={retake}>Retake photo</button>
                    </>
                ) : (
                    <button onClick={capture}>Capture photo</button>
                )}
                <button onClick={closeCamera}>Close</button>
            </div>
        </div>
    );
};