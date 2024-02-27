import './BallotCandidates.css';

export default ({candidates, votedCandidateId, updateVotedCandidate}) => {

    return (<>
    {
        candidates.map(candidate => (
            <>
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
                    <div className="vote" onClick={() => updateVotedCandidate(candidate)}>
                        {
                            votedCandidateId === candidate.id && <img 
                            src="https://static.vecteezy.com/system/resources/previews/013/275/186/original/hand-drawn-cross-mark-illustration-marker-wrong-sign-clipart-ink-scribble-checkbox-single-element-vector.jpg" 
                            alt="" />
                        }
                    </div>
                </div>
            </div>
            </>
        ))
    }
    </>);
};