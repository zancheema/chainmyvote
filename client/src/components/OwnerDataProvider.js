import { createContext, useContext, useEffect, useReducer } from "react";
import { initializeProvider } from "../util/contract";

const OwnerContext = createContext(null);
const OwnerDispatchContext = createContext(null);

export const useOwner = () => useContext(OwnerContext);
export const useOwnerDispatch = () => useContext(OwnerDispatchContext);

export const OwnerDataProvider = ({children}) => {
    const [owner, dispatch] = useReducer(ownerReducer, {candidates: [], voterRequests: []});
        
    async function getCandidates() {
        const contract = await initializeProvider();
        const candidates = await contract.getCandidates();
        dispatch({ type: 'update-candidates', data: candidates });
    }

    async function getVoters() {
        const contract = await initializeProvider();
        const voters = await contract.getVoters();
        const data = [...voters].reverse();
        dispatch({ type: 'update-voter_requests', data: data });
    }
    
    useEffect(() => {
        getCandidates();
        getVoters();
    }, []);

    useEffect(() => {
        (async () => {
            const contract = await initializeProvider();
            contract.on('VoterVerified', voter => {
                dispatch({ type: 'voter-verified', data: voter });
            });
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const contract = await initializeProvider();
            contract.on('CandidateAdded', candidate => {
                console.log('on CandidateAdded');
                dispatch({ type: 'add-candidate', data: candidate });
            });
        })();
    }, []);

    return (
        <OwnerContext.Provider value={owner}>
            <OwnerDispatchContext.Provider value={dispatch}>
                {children}
            </OwnerDispatchContext.Provider>
        </OwnerContext.Provider>
    );
};

const ownerReducer = (owner, action) => {
    console.log('ownerReducer: ' + action.type);

    switch (action.type) {
        case 'update-candidates':
            return {
                ...owner,
                candidates: action.data
            };
        case 'update-voter_requests':
            return {
                ...owner,
                voterRequests: action.data.filter(v => !v.verified)
            };
        case 'voter-verified':
            return {
                ...owner,
                voterRequests: owner.voterRequests.filter(v => v.id != action.data.id)
            };
        case 'add-candidate': {
            const existingCandidates = owner.candidates.filter(c => c.id === action.data.id);
            if (existingCandidates.length > 0) return owner;
            return {
                ...owner,
                candidates: [...owner.candidates, action.data]
            }
        };
    }
    throw new Error('invalid ownerReducer action: ' + action.type);
};
