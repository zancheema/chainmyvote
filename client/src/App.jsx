import './App.css';
import Owner from './pages/Owner';
import Voter from './pages/Voter';
import ElectionsFinished from './components/ElectionsFinished';
import { useAccount } from './components/AccountProvider';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NoWallet from './components/NoWallet';
import { OwnerDataProvider } from './components/OwnerDataProvider';
import VoteCast from './components/VoteCast';
import Ballot from './components/Ballot';
import UnverifiedVoter from './components/UnverifiedVoter';
import VoterRegistration from './components/VoterRegistration';

export default () => {
  const account = useAccount();
  const [routes, setRoutes] = useState({routes: [], default: {}});

  useEffect(() => {
    let routes = null;
    if (account === undefined || account.address === undefined) {
      routes = {
        default: {
          element: <Navigate to='/nowallet' replace />
        },
        routes: [
          {
            path: '/nowallet',
            element: <NoWallet />
          }
        ]
      }
    } else if (account.electionsFinished) {
      routes = {
        default: {
          element: <Navigate to='/elections/result' replace />
        },
        routes: [
          {
            path: '/elections/result',
            element: <ElectionsFinished />
          }
        ]
      }
    } else if (account.accountType === 'owner') {
      routes = {
        default: {
          element: <Navigate to='/owner' replace />
        },
        routes: [
          {
            path: '/owner',
            element: (
              <OwnerDataProvider>
                <Owner />
              </OwnerDataProvider>
            )
          }
        ]
      }
    } else if (account.voteStatus === 'vote-cast') {
      routes = {
        default: {
          element: <Navigate to='/voter/vote-cast' replace />
        },
        routes: [
          {
            path: '/voter/vote-cast',
            element: <VoteCast />
          }
        ]
      };
    } else if (account.voteStatus === 'verified') {
      routes = {
        default: {
          element: <Navigate to='/voter/ballot' replace />
        },
        routes: [
          {
            path: '/voter/ballot',
            element: <Ballot />
          }
        ]
      };
    } else if (account.voteStatus === 'unverified') {
      routes = {
        default: {
          element: <Navigate to='/voter/unverified' replace />
        },
        routes: [
          {
            path: '/voter/unverified',
            element: <UnverifiedVoter />
          }
        ]
      };
    } else {
      routes = {
        default: {
          element: <Navigate to='/voter/signup' replace />
        },
        routes: [
          {
            path: '/voter/signup',
            element: <VoterRegistration />
          }
        ]
      };
    }

    setRoutes(routes);
  }, [account]);

  return (
    <>
    <Router>
      <Routes>
        {
          routes.routes.map(route => (<Route path={route.path} element={route.element}>
            {route.children}
          </Route>))
        }
        <Route path='*' element={routes.default.element} />
      </Routes>
    </Router>
    {/* {
      (account === undefined || account.address === undefined)
        ? <h2>No Ethereum wallet detected.</h2>
        : account.electionsFinished
        ? <ElectionsFinished />
        : account.accountType === 'owner'
        ? <Owner />
        : <Voter />
    } */}
    </>
  );
};