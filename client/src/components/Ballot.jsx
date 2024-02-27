import { useEffect, useState } from "react";
import BallotCandidates from "./BallotCandidates";
import { initializeProvider } from "../util/contract";
import { useAccountDispatch } from "./AccountProvider";

const candidates = [
    {
      id: 1,
      title: 'BASWA, Paresh',
      _address: '2 The Cottages, Anytown XY8 9JG',
      party: 'Liberal Democrat',
      logo: 'https://hertfordandstortfordlibdems.org.uk/en/image/6n0SqM/767/600/charcoal-bird-liberal-democrats-logo.png',
    },
    {
      id: 2,
      title: 'CRANLEY, Alana',
      _address: '4 The Walk, Anytown XY9 5JJ',
      party: 'Green Party',
      logo: 'https://greenparty.org.uk/assets/logos/visual-identity/GPLogoStackedBLACK300dpi.png',
    },
    {
      id: 3,
      title: 'EDGBASTON, Richard',
      _address: '6 The Heath, Anytown XY4 0BH',
      party: 'The Common Good Party',
      logo: '',
    },
    {
      id: 4,
      title: 'GUNNIL WALKER, Roger',
      _address: '33 The Lane, Anytown XY6 3GD',
      party: 'The Labour Party Candidate',
      logo: 'https://www.pngitem.com/pimgs/m/226-2260092_labour-party-logo-2018-hd-png-download.png',
    },
    {
      id: 5,
      title: 'SMITH, Katherine Angelina',
      _address: '21 The Grove, Anytown XY2 5JP',
      party: 'Independent',
      logo: '',
    },
    {
      id: 6,
      title: 'SMITH, Keith James',
      _address: '3 The Road, Anytown XY3 4JN',
      party: 'The Conservative Party Candidate',
      logo: 'https://search.electoralcommission.org.uk/Api/Registrations/Emblems/7730',
    },
    {
      id: 7,
      title: 'ZANUCH, Geroge Henry',
      _address: '17 The Parade, Anytown XY9 5KP',
      party: 'The United Kingdom Independence Party Candidate',
      logo: '',
    },
];

export default () => {
  const accountDispatch = useAccountDispatch();
  const [candidates, setCandidates] = useState([]);
  const [votedCandidateId, setVotedCandidateId] = useState(-1);

  async function getCandidates() {
    const contract = await initializeProvider();
    try {
      const candidates = await contract.getCandidates();
      setCandidates(candidates);
    } catch (e) {
      console.error(e);
    }
  }

  async function castVote() {
    const contract = await initializeProvider();
    try {
      contract.on('VoteCast', success => {
        if (success) {
          accountDispatch({
            type: 'change-vote-status',
            voteStatus: 'vote-cast'
          });
          console.log('Vote cast successfully.');
        }
      })

      await contract.castVote(votedCandidateId);
    } catch (e) {
      console.error(e);
    }
  }

  function updateVotedCandidate(candidate) {
      console.log('updateVotedCandidate: ' + candidate.id);
      setVotedCandidateId(candidate.id);
  }

  useEffect(() => {
    getCandidates()
  }, []);

    return (
        <section className="ballot">
            <div className="header"></div>
            <div className="block">
                <strong>
                Election of the member of the parliament for the ____ constituency
                </strong>
            </div> 
            <div className="block">
                Vote for <strong>only one canidate</strong> by putting a cross <span className="container">✗</span> next 
                to the candidate in the box next to your choice
            </div>
            <div style={{padding: '10px 0px', display: 'flex', justifyContent: 'end'}}>
              <button 
                onClick={castVote}
                style={{backgroundColor: votedCandidateId === -1 ? 'grey' : 'black', color: 'white', border: 'none', padding: '10px'}}
                disabled={votedCandidateId === -1}
              >
                <h2>Confirm</h2>
              </button>
            </div>
            <BallotCandidates 
              candidates={candidates} 
              votedCandidateId={votedCandidateId} 
              updateVotedCandidate={updateVotedCandidate}
            />
            <div className="divider"></div>
            <div className="footer"></div>
        </section>
    );
}