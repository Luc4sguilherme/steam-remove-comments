import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

async function getSteamId64(url) {
  if (url.includes('steamcommunity.com/profiles')) {
    const steamID = /(?<steamID>[0-9]{8,})/.exec(url)?.groups?.steamID;

    if (!steamID) {
      throw new Error('Invalid profile url');
    }

    return steamID;
  }

  const options = {
    method: 'GET',
    url,
    params: {
      xml: 1,
    },
  };

  const { data: XMLdata } = await axios(options);

  const parser = new XMLParser();
  const parsed = parser.parse(XMLdata);

  const steamID64 = parsed?.profile?.steamID64;

  if (!steamID64) {
    throw new Error('Steam ID not found');
  }

  if (Number.isNaN(Number.parseInt(steamID64, 10))) {
    throw new Error('Invalid Steam ID');
  }

  return steamID64;
}

export default getSteamId64;
