import React from 'react';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { fetchUser, fetchOAuthURL, fetchJsonOrText, fetchProjects } from '../actions';
import Spinner from '../components/Spinner';
import { getReduxStore } from '../reduxStore';
import { requiredCerts, submissionApiOauthPath } from '../configs';
import ReduxAuthTimeoutPopup from '../Popup/ReduxAuthTimeoutPopup';

let lastAuthMs = 0;
let lastTokenRefreshMs = 0;

const Body = styled.div`
  background: ${props => props.background};
  padding: ${props => props.padding || '50px 100px'};
`;

/**
 * Redux listener - just clears auth-cache on logout
 */
export function logoutListener(state = {}, action) {
  switch (action.type) {
  case 'RECEIVE_API_LOGOUT':
    lastAuthMs = 0;
    lastTokenRefreshMs = 0;
    break;
  default: // noop
  }
  return state;
}

/**
 * Avoid importing underscore just for this ... export for testing
 * @method intersection
 * @param aList {Array<String>}
 * @param bList {Array<String>}
 * @return list of intersecting elements
 */
export function intersection(aList, bList) {
  const key2Count = aList.concat(bList).reduce(
<<<<<<< HEAD
    (db, it) => { if (db[it]) { db[it] += 1; } else { db[it] = 1; } return db; },
    {},
  );
  return Object.entries(key2Count)
    .filter(kv => kv[1] > 1)
=======
    (db,it) => { if (db[it]) { db[it] += 1; } else { db[it] = 1; } return db; },
    {},
  );
  return Object.entries(key2Count)
    .filter(([k, v]) => v > 1)
>>>>>>> fix(AuthPopup): mv auth popup to ProtectedContent
    .map(([k]) => k);
}

/**
 * Container for components that require authentication to access.
 * Takes a few properties
 * @param component required child component
 * @param location from react-router
 * @param history from react-router
 * @param match from react-router.match
 * @param public default false - set true to disable auth-guard
 * @param background passed through to <Box background> wrapper for page-level background
 * @param filter {() => Promise} optional filter to apply before rendering the child component
 */
class ProtectedContent extends React.Component {
  static propTypes = {
    component: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.shape(
      {
        params: PropTypes.object,
        path: PropTypes.string,
      },
    ).isRequired,
    public: PropTypes.bool,
    background: PropTypes.string,
    filter: PropTypes.func,
  };

  static defaultProps = {
    public: false,
    background: null,
    filter: () => Promise.resolve('ok'),
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      authenticated: false,
      redirectTo: null,
    };
  }


  /**
   * We start out in an unauthenticatd state - after mount do
   * the checks to see if the current session is authenticated
   * in the various ways we want it to be.
   */
  componentDidMount() {
    if (!this.props.public) {
      getReduxStore().then(
        store =>
          Promise.all(
            [
              store.dispatch({ type: 'CLEAR_COUNTS' }), // clear some counters
              store.dispatch({ type: 'CLEAR_QUERY_NODES' }),
            ],
          ).then(
            () => this.checkLoginStatus(store)
              .then(newState => this.checkQuizStatus(newState))
              .then(newState => this.checkApiToken(store, newState)),
          ).then(
            (newState) => {
              const filterPromise = (newState.authenticated && typeof this.props.filter === 'function') ? this.props.filter() : Promise.resolve('ok');
              const finish = () => this.setState(newState); // finally update the component state
              return filterPromise.then(finish, finish);
            },
          ),
      );
    }
  }

  /**
   * Start filter the 'newState' for the checkLoginStatus component.
   * Check if the user is logged in, and update state accordingly.
   * @method checkLoginStatus
   * @param {ReduxStore} store
   * @return Promise<{redirectTo, authenticated, user}>
   */
  checkLoginStatus = (store) => {
    const nowMs = Date.now();
    const newState = {
      authenticated: true,
      redirectTo: null,
      user: store.getState().user,
    };

    if (nowMs - lastAuthMs < 60000) {
      // assume we're still logged in after 1 minute ...
      return Promise.resolve(newState);
    }

    return store.dispatch(fetchUser) // make an API call to see if we're still logged in ...
      .then(
        () => {
          const { user } = store.getState();
          newState.user = user;
          if (!user.username) { // not authenticated
            newState.redirectTo = '/login';
            newState.authenticated = false;
          } else { // auth ok - cache it
            lastAuthMs = Date.now();
          }
          return newState;
        },
      );
  };

  /**
   * Filter refreshes the gdc-api token (acquired via oauth with user-api) if necessary.
   * @method checkApiToken
   * @param store Redux store
   * @param initialState
   * @return newState passed through
   */
  checkApiToken = (store, initialState) => {
    const nowMs = Date.now();
    const newState = Object.assign({}, initialState);

    if (!newState.authenticated) {
      return Promise.resolve(newState);
    }
    if (nowMs - lastTokenRefreshMs < 41000) {
      return Promise.resolve(newState);
    }
    return store.dispatch(fetchProjects())
      .then(() => {
        //
        // The assumption here is that fetchProjects either succeeds or fails.
        // If it fails (we won't have any project data), then we need to refresh our api token ...
        //
        const projects = store.getState().submission.projects;
        if (projects) {
          // user already has a valid token
          return Promise.resolve(newState);
        }
        // else do the oauth dance
        return store.dispatch(fetchOAuthURL(submissionApiOauthPath))
          .then(
            oauthUrl => fetchJsonOrText({ path: oauthUrl, dispatch: store.dispatch.bind(store) }))
          .then(
            ({ status, data }) => {
              switch (status) {
              case 200:
                return {
                  type: 'RECEIVE_SUBMISSION_LOGIN',
                  result: true,
                };
              default: {
                return {
                  type: 'RECEIVE_SUBMISSION_LOGIN',
                  result: false,
                  error: data,
                };
              }
              }
            },
          )
          .then(
            msg => store.dispatch(msg),
          )
          .then(
            // refetch the projects - since the earlier call failed with an invalid token ...
            () => store.dispatch(fetchProjects()),
          )
          .then(
            () => {
              lastTokenRefreshMs = Date.now();
              return newState;
            },
            () => {
              // something went wront - better just re-login
              newState.authenticated = false;
              newState.redirectTo = '/login';
              return newState;
            },
          );
      });
  };

<<<<<<< HEAD
  /**
   * Filter the 'newState' for the ProtectedComponent.
   * User needs to take a security quiz before he/she can acquire tokens ...
   * something like that
   */
  checkQuizStatus = (initialState) => {
    const newState = Object.assign(initialState);

    if (!(newState.authenticated && newState.user && newState.user.username)) {
      return newState; // NOOP for unauthenticated session
    }
    const { user } = newState;
    // user is authenticated - now check if he has certs
    const isMissingCerts =
      intersection(requiredCerts, user.certificates_uploaded).length !== requiredCerts.length;
    // take quiz if this user doesn't have required certificate
    if (this.props.match.path !== '/quiz' && isMissingCerts) {
      newState.redirectTo = '/quiz';
      // do not update lastAuthMs (indicates time of last successful auth)
    } else if (this.props.match.path === '/quiz' && !isMissingCerts) {
      newState.redirectTo = '/';
    }
    return newState;
  };
=======
  componentDidMount() {
    getReduxStore().then(
      store => 
        Promise.all(
          [
            store.dispatch({ type: 'CLEAR_COUNTS' }), // clear some counters
            store.dispatch({ type: 'CLEAR_QUERY_NODES' }),
            this.requireAuth(store),
          ]
        ));
  }
>>>>>>> fix(AuthPopup): mv auth popup to ProtectedContent

  render() {
    const Component = this.props.component;
    let params = {}; // router params
    if (this.props.match) {
      params = this.props.match.params || {};
    }

    window.scrollTo(0, 0);
    if (this.state.redirectTo) {
      return (<Redirect to={this.state.redirectTo} />);
<<<<<<< HEAD
    } else if (this.props.public) {
      return (
        <Body {...this.props}>
          <Component params={params} location={this.props.location} history={this.props.history} />
        </Body>
      );
    } else if (this.state.authenticated) {
      return (
        <Body {...this.props}>
          <ReduxAuthTimeoutPopup />
          <Component params={params} location={this.props.location} history={this.props.history} />
        </Body>
      );
    }
    return (<Body {...this.props}><Spinner /></Body>);
=======
    } else if (this.state.authenticated) {
      let params = {};
      let path = '';
      if ( this.props.match ) {
        params = this.props.match.params || {};
        path = this.props.match.path || '';
      }
      console.log('got router params', this.props);
      return (<Component params={params} path={path} location={this.props.location} history={this.props.history} />);  // pass through react-router matcher params ...
    }
    return (<Spinner />);
>>>>>>> fix(AuthPopup): mv auth popup to ProtectedContent
  }
}

export default ProtectedContent;

