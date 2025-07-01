const stickerMaker = require('./stickerMaker');
const animeFinder = require('./animeFinder');
const lyricsFinder = require('./lyricsFinder');
const weather = require('./weather');
const jadwalSholat = require('./jadwalSholat');

module.exports = (bot) => {
  stickerMaker(bot);
  animeFinder(bot);
  lyricsFinder(bot);
  weather(bot);
  jadwalSholat(bot);
};
