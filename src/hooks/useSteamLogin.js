import { useEffect, useState } from 'react';
import SteamTotp from 'steam-totp';
import SteamUser from 'steam-user';

import config from '../config/main.js';
import { client, community } from '../services/steamClient.js';

export function useSteamLogin() {
  const [loginState, setLoginState] = useState('logging-in');
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    client.logOn({
      accountName: config.userName,
      password: config.passWord,
      twoFactorCode: SteamTotp.getAuthCode(config.sharedSecret),
      identity_secret: config.identitySecret,
      rememberPassword: true,
      shared_secret: config.sharedSecret,
    });

    const onLoggedOn = () => {
      client.setPersona(SteamUser.EPersonaState.Online);
      setLoginState('waiting-session');
    };

    const onWebSession = (_value, cookies) => {
      community.setCookies(cookies);
      setLoginState('ready');
    };

    const onError = (err) => {
      const reconnectableMs = 5 * 1000;
      const rateLimitMs = 25 * 60 * 1000;

      switch (err.eresult) {
        case SteamUser.EResult.AccountDisabled:
          setLoginError('This account is disabled!');
          setLoginState('error');
          break;
        case SteamUser.EResult.InvalidPassword:
          setLoginError('Invalid Password detected!');
          setLoginState('error');
          break;
        case SteamUser.EResult.RateLimitExceeded:
          setLoginError(
            'Rate Limit Exceeded, trying to login again in 25 minutes.'
          );
          setLoginState('reconnecting');
          setTimeout(() => {
            client.relog();
            setLoginError(null);
            setLoginState('logging-in');
          }, rateLimitMs);
          break;
        case SteamUser.EResult.LogonSessionReplaced:
          setLoginError(
            'Unexpected Disconnection! You have logged in with this same account in another place. Trying to login again in 5 seconds.'
          );
          setLoginState('reconnecting');
          setTimeout(() => {
            client.relog();
            setLoginError(null);
            setLoginState('logging-in');
          }, reconnectableMs);
          break;
        default:
          setLoginError(
            'Unexpected Disconnection! Trying to login again in 5 seconds.'
          );
          setLoginState('reconnecting');
          setTimeout(() => {
            client.relog();
            setLoginError(null);
            setLoginState('logging-in');
          }, reconnectableMs);
          break;
      }
    };

    client.on('loggedOn', onLoggedOn);
    client.on('webSession', onWebSession);
    client.on('error', onError);

    return () => {
      client.removeListener('loggedOn', onLoggedOn);
      client.removeListener('webSession', onWebSession);
      client.removeListener('error', onError);
    };
  }, []);

  return { loginState, loginError };
}
