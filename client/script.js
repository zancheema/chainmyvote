const aws = require('aws-sdk');
const { uuidV4 } = require('ethers');
const uuid = require('uuid');

const s3 = new aws.S3({
    credentials: {
        accessKeyId: 'AKIA27FRCEZ6G5AQAZXS',
        secretAccessKey: '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',
    },
    region: 'eu-west-1',
    apiVersion: '2006-03-01',
    params: {
        Bucket: 'chain-my-vote',
    }
});
const upload = s3.upload({
        Bucket: 'chain-my-vote',
        Key: uuid.v4(),
        Body: 'Hey how\'s it going'
}).promise();

upload
    .then(console.log)
    .catch(console.erro);
