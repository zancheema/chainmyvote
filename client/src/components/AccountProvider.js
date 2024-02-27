import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { initializeProvider } from "../util/contract";

const AccountContext = createContext(null);
const AccountDispatchContext = createContext(null);

export const useAccount = () => useContext(AccountContext);
export const useAccountDispatch = () => useContext(AccountDispatchContext);

export function AccountProvider({ children }) {
    const [account, dispatch] = useReducer(accountReducer, {});

    async function getAccount(address) {
        const contract = await initializeProvider();
        console.log('contract: ' + contract);
        const status = await contract.getAccountStatus();
        dispatch({
            type: 'change-account:' + status[0],
            address: address,
            accountType: status[0],
            electionsFinished: status[1],
            voteStatus: status[2]
        });
    }

    useEffect(() => {
        window.ethereum.request({method: 'eth_requestAccounts'})
            .then(res => {
                console.log('accounts: ' + res);
                if (res.length > 0)
                    getAccount(res[0])
            });
    }, []);

    useEffect(() => {
        window.ethereum?.on('accountsChanged', ([newAccount, previousAccount]) => {
            console.log('accounts changed: ' + newAccount);
            getAccount(newAccount);
        });
    }, []);

    useEffect(() => {
        (async () => {
            const contract = await initializeProvider();

            contract.on('ElectionsFinished', winner => {
                dispatch({ type: 'finish-elections' });
            });
        })();
    }, []);
    
    return (
        <AccountContext.Provider value={account}>
            <AccountDispatchContext.Provider value={dispatch}>
                {children}
            </AccountDispatchContext.Provider>
        </AccountContext.Provider>
    );
};
const accountReducer = (account, action) => {
    console.log('accountReducer: ' + JSON.stringify(action));
    switch (action.type) {
        case 'change-account:owner': {
            return {
                address: action.address,
                accountType: action.accountType,
                electionsFinished: action.electionsFinished
            };
        }
        case 'change-account:voter': {
            return {
                address: action.address,
                accountType: action.accountType,
                electionsFinished: action.electionsFinished,
                voteStatus: action.voteStatus
            };
        }
        case 'change-account:unregistered': {
            return {
                address: action.address,
                accountType: action.accountType,
                electionsFinished: action.electionsFinished,
            }
        }
        case 'change-vote-status': {
            return {
                ...account,
                voteStatus: action.voteStatus
            }
        }
        case 'finish-elections': {
            return {
                ...account,
                electionsFinished: true
            }
        }
    }
};
