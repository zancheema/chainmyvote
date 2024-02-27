import { useState } from "react";
import { initializeProvider } from "../util/contract";
import CustomWebcam from './CustomWebcam';
import { storeFile } from '../util/storageUtil';
import { useAccountDispatch } from "./AccountProvider";

export default () => {
    const [voter, setVoter] = useState({});
    const [brpOpen, setBrpOpen] = useState(false);
    const [picture, setPicture] = useState(null);

    const dispath = useAccountDispatch();

    async function onVoterRegistered() {
        dispath({
            type: 'change-vote-status',
            voteStatus: 'unverified'
        });
    }

    function openBrpCamera(e) {
        e.preventDefault();
        setBrpOpen(true);
    }

    function closeBrpCamera() {
        setBrpOpen(false);
    }

    async function onPictureCaptured(picture) {
        setPicture(picture);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        console.log('handleSubmit: ' + JSON.stringify(voter));
        const contract = await initializeProvider();
        try {
            // const location = await storeFile(picture);
            const location = 'no-location';
            console.log('file location: ' + location);

            contract.on('VoterAdded', voter => {
                console.log('Voter registered successfully.');
                onVoterRegistered();
            });

            await contract.addVoter(voter.brpNumber, voter.email, voter.firstName, voter.lastName, location);
        } catch (e) {
            console.error(e);
        }
    }

    function handleInput(e) {
        setVoter({ ...voter, [e.target.name]: e.target.value });
    }

    return (
        <>
            <div style={{display: 'flex', margin: 'auto'}}>
                <div style={{margin: 'auto'}} className="bordered container">
                    <h2>Request to be registered as voter</h2>
                    <form onSubmit={handleSubmit}>
                        <p>BRP Number</p>
                        <input type="text" name="brpNumber" value={voter.brpNumber} onChange={handleInput} />
                        <p>Email</p>
                        <input type="email" name="email" value={voter.email} onChange={handleInput} />
                        <p>firstName</p>
                        <input type="text" name="firstName" value={voter.firstName} onChange={handleInput} />
                        <p>lastName</p>
                        <input type="text" name="lastName" value={voter.lastName} onChange={handleInput} />
                        <p>brpPicture</p>
                        <div style={{ display: 'flex' }}>
                            <button onClick={openBrpCamera}>Capture</button>
                        </div>
                        <br />
                        <input className="button" type="submit" value="Register" />
                    </form>
                </div>
                <dialog open={brpOpen} style={{margin: 'auto'}}>
                    {
                        brpOpen && (
                            <div>
                                <h2>Capture a clear picture of you holding your BRP</h2>
                                <CustomWebcam onPictureCaptured={onPictureCaptured} onCameraClosed={closeBrpCamera} />
                            </div>
                        )
                    }
                </dialog>
            </div>
        </>
    );
};
