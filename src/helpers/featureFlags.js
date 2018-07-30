/*
  To set a feature flag:
  In the browser dev tools console, type:
  `sessionStorage.setItem('gen3Features', JSON.stringify({ 'featureName': true }))`
  (replace 'featureName' with the feature to be enabled.)
  To verify it was set correctly, use:
  `JSON.parse(sessionStorage.getItem('gen3Features'))['featureName']
*/

import { paramByApp } from '../../data/dictionaryHelper';
import { params } from '../../data/parameters';

/*
  Will check parameters.js to see if there is default config for feature flags
  Then will check to see if user has set any flags in the browser
  Will return true if either of these types of flags is set to true
*/
function isEnabled(featureName) {
  const compileTimeFlags = paramByApp(params, 'featureFlags') || {};
  const runTimeFlags = JSON.parse(window.sessionStorage.getItem('gen3Features')) || {};
  return !!compileTimeFlags[featureName] || !!runTimeFlags[featureName];
}

export default isEnabled;