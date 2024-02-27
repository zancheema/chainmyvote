import { useEffect, useState } from "react";
import "./Candidates.css";
import { initializeProvider } from "../util/contract";

export default ({candidates}) => {
    const [votes, setVotes] = useState({});

    async function getVotes() {
        const contract = await initializeProvider();
        for (let i = 0; i < candidates.length; i++) {
            // console.log(i + ': ' + candidates[i].id);
            const candidate = candidates[i];
            try {
                const count = await contract.getVotes(candidate.id);
                // if (typeof count === 'undefined') continue;
                console.log('count: ' + count);
                if (typeof count === 'undefined') continue;
                votes[candidate.id] = count;
                setVotes({...votes});
            } catch (e) {
                console.error(e);
            }
        }
    }

    useEffect(() => {
        getVotes();
    }, [candidates]);

    return (<>
    {
        candidates.map(candidate => (
            <>
            <div>{candidate.id ?? 'id'}</div>
            <div className="list-divider" />
            <div className="list-content">
                <div>
                    <div className="title">{candidate.title}</div>
                    <div className="address">{candidate._address}</div>
                    <div className="party">{candidate.party}</div>
                </div>
                <div className="list-item-trail">
                    <div className="logo">
                        {candidate.logo && candidate.logo.startsWith('https://ipfs.io/ipfs') && <img src={candidate.logo} alt='candidate-logo.img' />}
                    </div>
                    <div className="vote">
                        <h1>{votes[candidate.id] ? votes[candidate.id] + '' : 0}</h1>
                    </div>
                </div>
            </div>
            </>
        ))
    }
    </>);
};