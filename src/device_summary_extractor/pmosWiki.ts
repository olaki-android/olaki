import axios from 'axios';
import { load } from 'cheerio';
import { Element } from 'domhandler/lib/node';
import { CodenameToDeviceSummary } from './model';
import logger from '../logger';

type PmosWikiDeviceInfo = { [k: string]: string };

const pmosWikiBaseUrl = 'https://wiki.postmarketos.org';

const cleanElementText = (text: string) => text.replaceAll('\n', '').trim();

export default async function extractPmOsWikiDeviceSummaries(): Promise<CodenameToDeviceSummary> {
  const response = await axios.get(`${pmosWikiBaseUrl}/wiki/Devices`);

  if (response.status !== 200) {
    throw new Error(
      `[PMOS] ERROR - Received non-200 status code when retrieving device data from PMOS wiki page: ${response.status}\n ${response.data}`
    );
  }

  const $ = load(response.data);
  const deviceTableCells = $('td.field_Device');

  if (deviceTableCells.length === 0) {
    throw new Error(`[PMOS] ERROR - Could not find device table cells! Page content:\n ${response.data}`);
  }

  const deviceUrls = deviceTableCells
    .map((index, element) => (element.firstChild === null ? null : (element.firstChild as Element).attribs.href))
    .filter(href => !!href);

  const devicePagesWithStatus = await Promise.allSettled(
    deviceUrls.map((index, deviceUrl) => axios.get(`${pmosWikiBaseUrl}${deviceUrl}`))
  );

  const deviceInfoList: PmosWikiDeviceInfo[] = devicePagesWithStatus.map(devicePageWithStatus => {
    const deviceInfo: PmosWikiDeviceInfo = {} as PmosWikiDeviceInfo;

    if (devicePageWithStatus.status === 'fulfilled') {
      const $ = load(devicePageWithStatus.value.data);
      $('table.infobox')
        .first()
        .find('tr')
        .get()
        .forEach(trElement => {
          const ths = $(trElement).find('th');
          const tds = $(trElement).find('td');
          const hasThAndTd = ths.length > 0 && tds.length > 0;
          if (hasThAndTd) {
            const key = cleanElementText(ths.first().text()).toLowerCase();
            deviceInfo[key] = cleanElementText(tds.first().text());
          }
        });
    } else {
      logger.error(`[PMOS] ERROR - Error while getting device summary: ${devicePageWithStatus.reason}`);
    }

    return deviceInfo;
  });

  const result: CodenameToDeviceSummary = {};
  deviceInfoList.forEach(deviceInfo => {
    if (deviceInfo.codename) {
      result[deviceInfo.codename] = {
        vendor: deviceInfo.manufacturer,
        name: deviceInfo.name,
        releaseDate: deviceInfo.released,
        pmos: {
          category: deviceInfo.category,
        },
      };
    } else {
      logger.error(`[PMOS] ERROR - Found device info without codename: ${JSON.stringify(deviceInfo)}`);
    }
  });
  return result;
}
