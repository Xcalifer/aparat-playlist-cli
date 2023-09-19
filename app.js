import select, { Separator } from '@inquirer/select';
import input from '@inquirer/input';
import fs from 'fs';
const NEW_LINE = '\n';
const APPEND_FLAG = { flag: 'a' };
const FILE_NAME = 'links.txt';
const playlistNumber = await input({ message: 'Enter playlist number:' });
const selectedQuality = await select({
  message: 'Select quality:',
  choices: [
    {
      name: '144p',
      value: '144p',
    },
    {
      name: '240p',
      value: '240p',
    },
    {
      name: '360p',
      value: '360p',
    },
    {
      name: '480p',
      value: '480p',
    },
    {
      name: '720p',
      value: '720p',
    },
    {
      name: '1080p',
      value: '1080p',
    },
  ],
});

class Aparat {
  constructor() {
    this.deleteLinksFile();
    this.generateDownloadLinks();
  }
  async generateDownloadLinks() {
    // ? This endpoint return playlist information
    const PLAYLIST_INFORMATION_ENDPOINT = 'https://www.aparat.com/api/fa/v1/video/playlist/one/playlist_id/';
    const playListInformation = await (await fetch(PLAYLIST_INFORMATION_ENDPOINT + playlistNumber)).json();

    // ? This endpoint return video information
    const VIDEO_INFORMATION_ENDPOINT = 'https://www.aparat.com/api/fa/v1/video/video/show/videohash/';
    playListInformation.included.forEach(async video => {
      if (video.type === 'Video') {
        // ? for download video we need uid
        const videoUid = video.attributes.uid;
        const videoInformation = await (await fetch(VIDEO_INFORMATION_ENDPOINT + videoUid)).json();

        const videoTitle = videoInformation.data.attributes.title;
        const videoLinks = videoInformation.data.attributes.file_link_all;

        // ? Writing video title
        // ? We use writeFileSync and this will block event loop. because I want write title and links in order
        fs.writeFileSync(FILE_NAME, videoTitle + NEW_LINE, APPEND_FLAG);
        // ? Extracting selected quality link from different quality links
        videoLinks.forEach(async videoLink => {
          if (videoLink.profile === selectedQuality) {
            fs.writeFileSync(FILE_NAME, videoLink.urls[0] + NEW_LINE, APPEND_FLAG);
          }
        });
      }
    });
  }
  async deleteLinksFile() {
    try {
      fs.unlinkSync(FILE_NAME);
    } catch (error) {}
  }
}

new Aparat();
