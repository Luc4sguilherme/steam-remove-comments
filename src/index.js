import moment from 'moment';
import SteamTotp from 'steam-totp';
import SteamUser from 'steam-user';

import log from './components/log.js';
import removeComments from './components/removeComments.js';
import { client, community } from './components/steamClient.js';
import main from './config/main.js';

client.logOn({
  accountName: main.userName,
  password: main.passWord,
  twoFactorCode: SteamTotp.getAuthCode(main.sharedSecret),
  identity_secret: main.identitySecret,
  rememberPassword: true,
  shared_secret: main.sharedSecret,
});

client.on('loggedOn', () => {
  client.setPersona(SteamUser.EPersonaState.Online);
});

client.on('webSession', async (value, cookies) => {
  community.setCookies(cookies);

  await removeComments();
  process.exit(0);
});

client.on('error', (error) => {
  const minutes = 25;
  const seconds = 5;

  switch (error.eresult) {
    case SteamUser.EResult.AccountDisabled:
      log.error(`This account is disabled!`);
      break;
    case SteamUser.EResult.InvalidPassword:
      log.error(`Invalid Password detected!`);
      break;
    case SteamUser.EResult.RateLimitExceeded:
      log.warn(
        `Rate Limit Exceeded, trying to login again in ${minutes} minutes.`
      );
      setTimeout(() => {
        client.relog();
      }, moment.duration(minutes, 'minutes'));
      break;
    case SteamUser.EResult.LogonSessionReplaced:
      log.warn(
        `Unexpected Disconnection!, you have LoggedIn with this same account in another place. Trying to login again in ${seconds} seconds.`
      );
      setTimeout(() => {
        client.relog();
      }, moment.duration(seconds, 'seconds'));
      break;
    default:
      log.warn(
        `Unexpected Disconnection!, trying to login again in ${seconds} seconds.`
      );
      setTimeout(() => {
        client.relog();
      }, moment.duration(seconds, 'seconds'));
      break;
  }
});
