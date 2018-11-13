let axios = require('axios');

module.exports = {
  getRandomCard: function() {
    return axios.get(`https://api.scryfall.com/cards/random`)
      .then(response => {
        response = `${response.data.name}`;
        const landList = ['Mountain', 'Island', 'Plains', 'Swamp', 'Forest'];
        if( landList.indexOf(response) != -1 ){
          console.log("Basic land %s found. Requesting new random card.", response)
          response = this.getRandomCard();
        }
        return response;
      })
  },
  //searches for selected card and returns all version images
  imageLookup: function(card) {
    return axios.get(`https://api.scryfall.com/cards/named?fuzzy=${card}`)
      .then(response => {
        const allEditions = response.data.prints_search_uri;
        return axios.get(allEditions);
      })
      .then(response => {
        return createEditionObject(response);
      })
      .then(response => {
        //sort editions alphabetically
        const orderedEditionImages = {};
        Object.keys(response).sort().forEach(function(key) {
          orderedEditionImages[key] = response[key];
        });
        return orderedEditionImages;
      })
      .catch(error => {
        console.log(error)
        if (error.response.status == 400 ||
            error.response.status == 404) {
          var noCard = {};
          noCard[0] = [[card],'Card Not Found', ['https://img.scryfall.com/errors/missing.jpg']];
          return noCard
        } else {
          console.log(error);
        }
      });
  },
  //looks up .png image for a card based on passed-in .jpg link
  hiRezDownload: function(name, link, transform) {
    //break early for card names that didn't convert to images successfully
    if (link === 'https://img.scryfall.com/errors/missing.jpg') {
      return undefined;
    }
    const oldLink = link;
    link = link.replace('small', 'png');
    link = link.replace('jpg', 'png');
    return axios.get(link)
      .then(response => {
        let downloadLink = {};
        downloadLink[name] = [link, transform];
        return downloadLink;
      })
      .catch(error => {
        console.log(error);
      });
  },
};

function createEditionObject(response, passdown = {}) {
  let editionImages = passdown;
  let responseObject = response;
  let tcgPromises = [];
  for (var edition of responseObject.data.data) {
    //shorten names and add Collector's Number for multiple artworks
    var multiverseKey = edition.multiverse_ids[0];
    var shortVersion = nameShorten(edition.set_name);
    //pushes front and back side images for dual-faced cards
    if (edition['layout'] === 'transform') {
      editionImages[multiverseKey] =
        [
          [
            edition.card_faces[0].name,
            edition.card_faces[1].name
          ],
          shortVersion,
          [
            edition.card_faces[0].image_uris.small,
            edition.card_faces[1].image_uris.small
          ],
          edition.tcgplayer_id
        ];
    } else {
      editionImages[multiverseKey] = 
      [
        [edition.name],
        shortVersion,
        [edition.image_uris.small],
        edition.tcgplayer_id
      ];
    }
    if (edition.tcgplayer_id !== undefined) {
      var tcgUrl = String(`https://api.tcgplayer.com/v1.9.0/pricing/product/${edition.tcgplayer_id}`);
      var tcgHeaders = {Authorization: "bearer " + process.env.BEARER_TOKEN, getExtendedFields: 'true' }
      tcgPromises.push(axios.get(tcgUrl, {headers: tcgHeaders}));
    }
  }
  return Promise.all(tcgPromises)
  .then((result) => {
    for (var multiKey in editionImages) {
      if (editionImages[multiKey][3] == 'undefined') { continue; }
      var prices = {
        normal: '',
        foil: ''
      };
      editionImages[multiKey].push(prices);
      for (var edition of result) {
        if (editionImages[multiKey][3] == edition.data.results[0].productId) {
          editionImages[multiKey][4].normal = edition.data.results[0].marketPrice;
          editionImages[multiKey][4].foil = edition.data.results[1].marketPrice;
          break;
        }
      }
    }
    if (responseObject.data.has_more === true) {
      return axios.get(responseObject.data.next_page)
        .then(response => {
          return createEditionObject(response, editionImages);
        })
        .catch(function() {
          return editionImages
        })
    } else {
      return editionImages
    }
  })
  .catch(error => {
    console.log(error);
  });
}

function comparator(a, b) {
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  return 0;
}

//name shortener helper function for cleaner presentation
function nameShorten(cardName) {
  const duelDecks = /^Duel Decks:/;
  cardName = cardName.replace(duelDecks, 'DD:');
  const duelDecksAnthology = /^Duel Decks Anthology:/;
  cardName = cardName.replace(duelDecksAnthology, 'DDA:');
  const fridayNightMagic = /^Friday Night Magic/;
  cardName = cardName.replace(fridayNightMagic, 'FNM');
  const magicOnline = /^Magic Online/;
  cardName = cardName.replace(magicOnline, 'MTGO');
  const magicPlayerRewards = /^Magic Player Rewards/;
  cardName = cardName.replace(magicPlayerRewards, 'MPR');
  const premiumDecks = /^Premium Deck Series:/;
  cardName = cardName.replace(premiumDecks, 'PDS');
  const proTour = /^Pro Tour/;
  cardName = cardName.replace(proTour, 'PT');
  return cardName;
}