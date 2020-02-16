const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    projectId: "seismic-plexus-232506",
});

async function uploadAssets(tenantName) {
    var array = process.env.ASSETS.split(/\s+/);
    for (let fileName of array) {
        storage.bucket('formuladb-env/static-assets')
            .upload(fileName, { 
                destination: `${tenantName}/production/${fileName.replace(/frmdb-apps\//, '')}`,
            })
            .then(res => console.log(res))
            .catch(err => console.error(err))
        ;  
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
