import { useEffect, useState } from "react";
import { initializeProvider } from "../util/contract";
import "./Owner.css";
import Candidates from "../components/Candidates";
import { storeFile } from '../util/storageUtil';
import { useOwner, useOwnerDispatch } from "../components/OwnerDataProvider";

export default () => {
    const [brpPicture, setBrpPicture] = useState(null);
    const [openBrpPicture, setOpenBrpPicture] = useState({open: false, picture: null});
    let candidateForm = null;

    const owner = useOwner();

    async function finishElections() {
        try {
            const contract = await initializeProvider();
            await contract.finishElections();
        } catch (e) {
            console.error(e);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        console.log(candidateForm.title.value)

        const title = candidateForm.title.value;
        const address = candidateForm._address.value;
        const party = candidateForm.party.value;
        const logo = candidateForm.logo.value;
        const logoUrl = (logo && logo !== '') ?  await storeFile(logo) : 'no-logo';
        // const logoUrl = 'no-url';

        const contract = await initializeProvider();
        await contract.addCandidate(title, address, party, logoUrl);
        candidateForm.reset();
    }

    async function showBrpPicture(voter) {
        setBrpPicture(voter.brpPicture);
        const picture = await (await fetch(voter.brpPicture)).text();
        console.log('showBrpPicture: ' + voter.brpPicture  + ' : ' + picture.toString());
        setOpenBrpPicture({open: true, picture: picture});
    }

    function closeBrpPicture() {
        setBrpPicture(false);
        setOpenBrpPicture({open: false, picture: null});
    }

    async function verifyVoter(voter) {
        try {
            const contract = await initializeProvider();
            await contract.verifyVoter({
                id: voter.id, 
                brpNumber: voter.brpNumber,
                email: voter.email,
                firstName: voter.firstName,
                lastName: voter.lastName,
                brpPicture: voter.brpPicture,
                introVideo: voter.introVideo,
                verified: voter.verified
            });
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
        <div style={{display: 'flex'}}>
            <div style={{width: '50%', padding: '10px'}}>
                <div>
                    <button onClick={finishElections}>Finish Elections</button>
                </div>
                <div className="bordered container">
                    <h2>Add new candidate</h2>
                    <form onSubmit={handleSubmit} ref={ref => candidateForm = ref}>
                        <input className="form-input" type="text" placeholder="Title" name="title" />
                        <input className="form-input" type="text" placeholder="Address" name="_address" />
                        <input className="form-input" type="text" placeholder="Party" name="party" />
                        <div className="flex">
                            <p>Logo</p>
                            <input type="file" name="logo" />
                        </div>
                        <br />
                        <input className="button" type="submit" value="Add" />
                    </form>
                </div>
                <div>
                    <h2>Candidates</h2>
                    <div>
                        <Candidates candidates={owner.candidates} />
                    </div>
                </div>
            </div>
            <div style={{width: '50%', padding: '10px'}}>
                <h2>Pending Voters</h2>
                <table>
                    <thead>
                        <tr>
                            <th>BRP Number</th>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>BRP Img</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            owner.voterRequests/*.filter(voter => voter.verified === false)*/.map(voter => (
                                <tr>
                                    <td>{voter.brpNumber}</td>
                                    <td>{voter.email}</td>
                                    <td>{voter.firstName}</td>
                                    <td>{voter.lastName}</td>
                                    <td><button onClick={() => showBrpPicture(voter)}>View</button></td>
                                    <td><button onClick={() => verifyVoter(voter)}>Verify</button></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <dialog style={{margin: 'auto'}} open={openBrpPicture.open}>
                <img src={'' + openBrpPicture.picture} alt="brp-img" />
                <button onClick={closeBrpPicture}>Close</button>
            </dialog>
        </div>
        </>
    );
}