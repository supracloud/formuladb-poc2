var OAuth = require('oauth')
// `npm install oauth` to satisfy
// website: https://github.com/ciaranj/node-oauth

const KEY = "03f31006c08243aa8ed4ddeb0070621b"
const SECRET = "0e79c46aea304f398c6dd02be671e049"

var oauth = new OAuth.OAuth(
	'http://api.thenounproject.com',
	'http://api.thenounproject.com',
	KEY,
	SECRET,
	'1.0',
	null,
	'HMAC-SHA1'
)

export interface PremiumIconRespose {
    icons: {
        id: string;
		preview_url: string;
		license_description: string;
        tags: {
			id: number,
			slug: string,
		}[];
    }[];
}

export async function searchPremiumIcons(search: string) {
    let res: PremiumIconRespose = await new Promise((resolve, reject) => {
		oauth.get(
			`http://api.thenounproject.com/icons/${search}`,
			null,
			null,
			function (e, data, res){
				if (e) reject(e)
				resolve(data);
			}
		)
	});

    return res;
}

export async function getPremiumIcon(iconId: string): Promise<{id: string, svg_url: string, name: string}> {
    return new Promise((resolve, reject) => {
		oauth.get(
			`http://api.thenounproject.com/icon/${iconId}`,
			null,
			null,
			function (e, data, res){
				if (e) reject(e);
				else {
					let icon = JSON.parse(data)!.icon;
					resolve({
						id: icon.id,
						svg_url: icon.icon_url,
						name: icon.term_slug + '-' + icon.tags.map(t => t.slug).join('-'),
					});
				}
			}
		)
	});
}


// oauth.get(
// 	'http://api.thenounproject.com/icons/kite',
// 	null,
// 	null,
// 	function (e, data, res) {
// 		if (e) console.error(e)
// 		console.log(data);
// 	}
// )

// 'http://api.thenounproject.com/icon/6324',
// {
//     "icon": {
//         "attribution": "Hackathon by Iconathon from Noun Project",
//         "collections": [
//             {
//                 "author": {
//                     "location": "Los Angeles, California, US",
//                     "name": "Iconathon",
//                     "permalink": "/Iconathon1",
//                     "username": "Iconathon1"
//                 },
//                 "author_id": "12701",
//                 "date_created": "2014-10-24 00:00:01",
//                 "date_updated": "2014-10-24 00:00:01",
//                 "description": "With the Art Institute of Seattle",
//                 "id": "1582",
//                 "is_collaborative": "",
//                 "is_featured": "0",
//                 "is_published": "1",
//                 "is_store_item": "0",
//                 "name": "Neighborhoods",
//                 "permalink": "/Iconathon1/collection/neighborhoods",
//                 "slug": "neighborhoods",
//                 "sponsor": {},
//                 "sponsor_campaign_link": "",
//                 "sponsor_id": "",
//                 "tags": [],
//                 "template": "24"
//             }
//         ],
//         "date_uploaded": "2012-10-15",
//         "icon_url": "https://static.thenounproject.com/noun-svg/6324.svg?Expires=1580935914&Signature=K4z-~ezlbfq~fAPICg5WsC7L5gcBghBlIxCHCwZPax6F3JhOHu4z4WOSvziF9IHX4vURf5kbd7ZvKjESs0Zt0fZscWG78-Db8AEsS7Dfqk9F~OgquDzlIfta~NLcwtW5ZbuD356QdrkMpVElVWquIVsH7ggrSDE0cEwCK5bp8j4_&Key-Pair-Id=APKAI5ZVHAXN65CHVU2Q",
//         "id": "6324",
//         "is_active": "1",
//         "is_explicit": "0",
//         "license_description": "public-domain",
//         "nounji_free": "0",
//         "permalink": "/term/hackathon/6324",
//         "preview_url": "https://static.thenounproject.com/png/6324-200.png",
//         "preview_url_42": "https://static.thenounproject.com/png/6324-42.png",
//         "preview_url_84": "https://static.thenounproject.com/png/6324-84.png",
//         "sponsor": {},
//         "sponsor_campaign_link": null,
//         "sponsor_id": "",
//         "tags": [
//             {
//                 "id": 7377,
//                 "slug": "hackathon"
//             },
//             {
//                 "id": 963,
//                 "slug": "team"
//             },
//             {
//                 "id": 7381,
//                 "slug": "solve"
//             },
//             {
//                 "id": 6425,
//                 "slug": "problem"
//             },
//             {
//                 "id": 961,
//                 "slug": "people"
//             },
//             {
//                 "id": 6464,
//                 "slug": "open-source"
//             },
//             {
//                 "id": 1843,
//                 "slug": "open"
//             },
//             {
//                 "id": 7380,
//                 "slug": "hack"
//             },
//             {
//                 "id": 7379,
//                 "slug": "developer"
//             },
//             {
//                 "id": 7378,
//                 "slug": "develop"
//             },
//             {
//                 "id": 157,
//                 "slug": "computer"
//             },
//             {
//                 "id": 422,
//                 "slug": "time"
//             }
//         ],
//         "term": "Hackathon",
//         "term_id": 7377,
//         "term_slug": "hackathon",
//         "updated_at": "2019-04-22 19:22:17",
//         "uploader": {
//             "location": "Los Angeles, California, US",
//             "name": "Iconathon",
//             "permalink": "/Iconathon1",
//             "username": "Iconathon1"
//         },
//         "uploader_id": "12701",
//         "year": 2012
//     }
// }




// 'http://api.thenounproject.com/icons/kite',
// {
// 	"generated_at": "Thu, 06 Feb 2020 08:35:09 GMT",
// 	"icons": [
// 	  {
// 		"attribution": "Kite by Ambar Bhusari from Noun Project",
// 		"attribution_preview_url": "https://static.thenounproject.com/attribution/7275-600.png",
// 		"collections": [],
// 		"date_uploaded": "2012-11-03",
// 		"id": "7275",
// 		"is_active": "1",
// 		"is_explicit": "0",
// 		"license_description": "creative-commons-attribution",
// 		"nounji_free": "0",
// 		"permalink": "/term/kite/7275",
// 		"preview_url": "https://static.thenounproject.com/png/7275-200.png",
// 		"preview_url_42": "https://static.thenounproject.com/png/7275-42.png",
// 		"preview_url_84": "https://static.thenounproject.com/png/7275-84.png",
// 		"sponsor": {},
// 		"sponsor_campaign_link": null,
// 		"sponsor_id": "",
// 		"tags": [
// 		  {
// 			"id": 8065,
// 			"slug": "kite"
// 		  },
// 		  {
// 			"id": 898,
// 			"slug": "air"
// 		  },
// 		  {
// 			"id": 824,
// 			"slug": "children"
// 		  },
// 		  {
// 			"id": 502,
// 			"slug": "flight"
// 		  },
// 		  {
// 			"id": 1656,
// 			"slug": "fly"
// 		  },
// 		  {
// 			"id": 604,
// 			"slug": "kid"
// 		  },
// 		  {
// 			"id": 988,
// 			"slug": "string"
// 		  },
// 		  {
// 			"id": 628,
// 			"slug": "toy"
// 		  },
// 		  {
// 			"id": 642,
// 			"slug": "wind"
// 		  }
// 		],
// 		"term": "Kite",
// 		"term_id": 8065,
// 		"term_slug": "kite",
// 		"updated_at": "2019-04-22 19:22:17",
// 		"uploader": {
// 		  "location": "Pune, Maharashtra, IN",
// 		  "name": "Ambar Bhusari",
// 		  "permalink": "/ambarbhusari",
// 		  "username": "ambarbhusari"
// 		},
// 		"uploader_id": "15186",
// 		"year": 2012
// 	  },
// 	  . . .
//    ]
// }
