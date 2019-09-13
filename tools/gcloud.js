const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    projectId: "seismic-plexus-232506",
});

async function uploadAssets(pathPrefix) {
    var array = process.env.ASSETS.split(' ');
    for (var assetid = 0; assetid < array.length; assetid++) {
        storage.bucket('formuladb-static-assets').upload(array[assetid], { destination: `${pathPrefix}/${array[assetid]}` }, function (err, file) {
            if (!err) {
                console.log(file.name)
            } else {
                throw err;
            }
        });
        console.log(array[assetid]);
    }
}

async function listBuckets() {
    const [buckets] = await storage.getBuckets();
    console.log('Buckets:');
    buckets.forEach(bucket => {
        console.log(bucket.name);
    });
}

async function createBucketIfNotExists(bucketName) {
    await storage.createBucket(bucketName, {
        location: 'eu',
        multiRegional: true,
    })
        .catch(err => {
            if (err.code === 409) {
                console.log(JSON.stringify(err, null, 4));
                console.log("Bucket already exists");
            } else {
                console.log(JSON.stringify(err, null, 4));
                throw err;
            }
        });
}

eval(process.argv[2]);
