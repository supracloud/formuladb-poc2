//https://pixabay.com/api/?key=11981211-f4ec78d50713d951458075949&q=kiting&image_type=photo

const API_KEY = '11981211-f4ec78d50713d951458075949';

interface FreeImagesRespose {
    totalHits: number,
    hits: {
        id: string;
        previewURL: string;
        webformatURL: string;
        largeImageURL: string;
        webformatHeight: number;
        webformatWidth: number;
    }[];
}

export async function searchFreeImages(search: string) {
    let res: FreeImagesRespose = await fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(search)}&image_type=photo`, {
        method: 'GET'
    })
        .then(function (response) {
            return response.json();
        });

    return res;
}
// {
//     "totalHits": 500,
//     "hits": [
//         {
//             "largeImageURL": "https://pixabay.com/get/54e8dd444e5aaf14f6da8c7dda79367f1c37dfe752506c4870287fd39f4fc559b0_1280.jpg",
//             "webformatHeight": 426,
//             "webformatWidth": 640,
//             "likes": 260,
//             "imageWidth": 3456,
//             "id": 2887483,
//             "user_id": 127419,
//             "views": 45471,
//             "comments": 32,
//             "pageURL": "https://pixabay.com/photos/child-boy-dragon-dragon-flight-2887483/",
//             "imageHeight": 2304,
//             "webformatURL": "https://pixabay.com/get/54e8dd444e5aaf14f6da8c7dda79367f1c37dfe752506c4870287fd39f4fc559b0_640.jpg",
//             "type": "photo",
//             "previewHeight": 99,
//             "tags": "child, boy, dragon",
//             "downloads": 21679,
//             "user": "cocoparisienne",
//             "favorites": 229,
//             "imageSize": 746243,
//             "previewWidth": 150,
//             "userImageURL": "https://cdn.pixabay.com/user/2019/11/18/14-25-26-732_250x250.jpg",
//             "previewURL": "https://cdn.pixabay.com/photo/2017/10/25/10/24/child-2887483_150.jpg"
//         },
//     ],
//     "total": 769
// }


const sstk = require('shutterstock-api');
if (process.env.BUILD_DEVELOPMENT) {
    sstk.setSandbox(true);
}
sstk.setBasicAuth("18f0a-72a23-20947-2ae2c-a738c-62b77", "01616-8f6ca-085b8-f01ec-b6f37-7c34d");

export interface PremiumImagesRespose {
    total_count: number;
    page: number;
    message: string;
    search_id: string;
    data: {
        keywords: string[];
        is_adult: boolean;
        previewURL: string;
        imageId: string;
    }[];
}
const api = new sstk.ImagesApi();
export async function searchPremiumImages(search: string) {
    let response = await api.searchImages({
        query: search
    });
    let ret: PremiumImagesRespose = {
        ...response,
        data: response.data.map(hit => ({
            keywords: hit.keywords,
            is_adult: hit.is_adult,
            previewURL: hit.assets.preview.url,
            imageId: hit.id,
        }))
    };
    return ret;
}
