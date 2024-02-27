import Ballot from "../components/Ballot";
import VoterRegistration from "../components/VoterRegistration";
import UnverifiedVoter from "../components/UnverifiedVoter";
import VoteCast from "../components/VoteCast";
import { useAccount, useAccountDispatch } from "../components/AccountProvider";
import { Link, Navigate, Route } from 'react-router-dom';

export default () => {
    const {voteStatus} = useAccount();

    switch (voteStatus) {
        case 'vote-cast':
            return <Navigate to='/voter/vote-cast' replace />
        case 'verified':
            return <Navigate to='/voter/ballot' replace />
        case 'unverified':
            return <Navigate to='/voter/unverified' replace />
        default:
            return <Navigate to='/voter/signup' replace />
    }

    // return voteStatus === 'vote-cast'
    //     ? <VoteCast />
    //     : voteStatus === 'verified'
    //     ? <Ballot />
    //     : voteStatus === 'unverified'
    //     ? <UnverifiedVoter />
    //     : <VoterRegistration onVoterRegistered={onVoterRegistered} />
};