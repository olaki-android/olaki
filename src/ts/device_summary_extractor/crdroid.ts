import logger from '../../logger';
import { CodenameToDeviceSummary } from './model';
import { fetchUrl, normaliseCodename, removeVendorPrefixFromModelAndTrim } from './util';

const CRDROID_BASE_URL = 'https://crdroid.net';
const CRDROID_DEVICES_LIST_JSON_URL = `${CRDROID_BASE_URL}/devices_handler/compiled.json`;

export default async function extractCrDroidDeviceSummaries(): Promise<CodenameToDeviceSummary> {
  const codenameToDeviceSummary: CodenameToDeviceSummary = {};

  logger.debug('[CRDROID] Discovering latest crDroid major version');
  let latestMajorVersion = Number.MIN_VALUE;
  const response = await fetchUrl('[CRDROID]', CRDROID_DEVICES_LIST_JSON_URL);
  const vendorToCodenames = response.data;
  for (const vendor in vendorToCodenames) {
    for (const codename in vendorToCodenames[vendor]) {
      for (const version in vendorToCodenames[vendor][codename]) {
        const versionAsNumber = +version;
        if (versionAsNumber > latestMajorVersion) {
          latestMajorVersion = versionAsNumber;
        }
      }
    }
  }
  logger.debug(`[CRDROID] Latest crDroid major version is ${latestMajorVersion}`);

  logger.debug('[CRDROID] Parsing list of crDroid devices');
  for (const vendor in vendorToCodenames) {
    for (const codename in vendorToCodenames[vendor]) {
      if (vendorToCodenames[vendor][codename][latestMajorVersion]) {
        const normalisedCodename = normaliseCodename(codename);
        codenameToDeviceSummary[normalisedCodename] = {
          codename: normalisedCodename,
          name: removeVendorPrefixFromModelAndTrim(vendor, vendorToCodenames[vendor][codename][latestMajorVersion].device),
          vendor: vendor,
          crdroid: {
            url: `${CRDROID_BASE_URL}/${codename}/${latestMajorVersion}`,
          },
        };
      } else {
        logger.debug(
          `[CRDROID] Excluding codename as there is no image available for latest major version ${latestMajorVersion}: ${codename}`
        );
      }
    }
  }

  return codenameToDeviceSummary;
}