import inquirer from 'inquirer';
import moment from 'moment';
import ora from 'ora';
import SteamTotp from 'steam-totp';
import SteamUser from 'steam-user';

import removeComments from './components/removeComments.js';
import { client, community } from './components/steamClient.js';
import main from './config/main.js';

async function askUser() {
  const { mode, filter } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Which comments would you like to remove?',
      choices: [
        { name: 'Remove the comments you made on other profiles', value: 1 },
        { name: 'Remove the comments made on your profile', value: 2 },
      ],
    },
    {
      type: 'list',
      name: 'filter',
      message: 'Which comments would you like to remove from your profile?',
      choices: [
        { name: 'Only comments made by others', value: 'others' },
        { name: 'Only comments made by me', value: 'mine' },
        { name: 'All comments', value: 'all' },
      ],
      when: (answers) => answers.mode && answers.mode === 2,
    },
  ]);

  return { mode, filter };
}

client.logOn({
  accountName: main.userName,
  password: main.passWord,
  twoFactorCode: SteamTotp.getAuthCode(main.sharedSecret),
  identity_secret: main.identitySecret,
  rememberPassword: true,
  shared_secret: main.sharedSecret,
});

const loginSpinner = ora('Logging into Steam...').start();

client.on('loggedOn', () => {
  client.setPersona(SteamUser.EPersonaState.Online);
  loginSpinner.text = 'Waiting for web session...';
});

client.on('webSession', async (value, cookies) => {
  community.setCookies(cookies);
  loginSpinner.succeed('Logged in successfully!');

  const { mode, filter } = await askUser();
  await removeComments(mode, filter);
  process.exit(0);
});

client.on('error', (error) => {
  const minutes = 25;
  const seconds = 5;

  loginSpinner.stop();

  switch (error.eresult) {
    case SteamUser.EResult.AccountDisabled:
      loginSpinner.fail(`This account is disabled!`);
      break;
    case SteamUser.EResult.InvalidPassword:
      loginSpinner.fail(`Invalid Password detected!`);
      break;
    case SteamUser.EResult.RateLimitExceeded:
      loginSpinner.fail(
        `Rate Limit Exceeded, trying to login again in ${minutes} minutes.`
      );
      setTimeout(() => {
        client.relog();
      }, moment.duration(minutes, 'minutes'));
      break;
    case SteamUser.EResult.LogonSessionReplaced:
      loginSpinner.fail(
        `Unexpected Disconnection!, you have LoggedIn with this same account in another place. Trying to login again in ${seconds} seconds.`
      );
      setTimeout(() => {
        client.relog();
      }, moment.duration(seconds, 'seconds'));
      break;
    default:
      loginSpinner.fail(
        `Unexpected Disconnection!, trying to login again in ${seconds} seconds.`
      );
      setTimeout(() => {
        client.relog();
      }, moment.duration(seconds, 'seconds'));
      break;
  }
});
