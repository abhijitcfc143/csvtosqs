const fs = require('fs')
const { pipeline } = require('stream')
const csv = require('csv-parser')
const AWS = require('aws-sdk')
const pushtosqs = require('./pushtosqs')


class Csvtosqs {

    constructor({accessKeyId, secretAccessKey, region}) {
        // Create a SQS object
        this.sqs = new AWS.SQS({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            region: region
        })
    }

    send({file, queueUrl}){
        let readable = fs.createReadStream(file)
        pipeline(
            readable,
            csv(),
            new pushtosqs({queueUrl, sqs:this.sqs}),
            (err) => {
                if (err) {
                    // if error occurs any where in any stream, the errors are forwarded
                    // and cleanup is performed where we can clear things up before exiting
                    console.error('Pipeline failed.', err)
                } else {
                    // will get called when all the data from source stream as passed through all other
                    // streams successfully and there is nothing more to be done. 
                    console.log('Pipeline done.')
                }
            }
        )
    }
}

module.exports = Csvtosqs
