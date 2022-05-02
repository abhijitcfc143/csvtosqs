const stream = require('stream')
const uuid = require('uuid')


class Pushtosqs extends stream.Transform {

    constructor({options = {}, queueUrl, sqs}) {
        super({ ...options, objectMode: true })

        this.queueUrl = queueUrl
        this.sqs = sqs
        this.chunkArr = []
    }

    async _transform(chunk, encoding, done) {
        try {
            // console.count('Row: ')
            this.chunkArr.push(chunk)
            
            if (this.chunkArr.length == 10){
                // push to chunk to sqs
                await this.sendBulkMsgToSQS()
                // and then empty it
                this.chunkArr = []
            }
        }
        catch(error) {
            done(error)
        }
    }

    async _flush(rs, err) {
        // when stream ends
        if (this.chunkArr.length > 0){
            // push the last chunk
            await this.sendBulkMsgToSQS()
            // and then empty it
            this.chunkArr = []
        }

        if (err) {
            console.error('Stream failed.', err)
        }
    }

    sendBulkMsgToSQS(){
        const params = {
            QueueUrl: this.queueUrl,
            Entries: []
        }
        for (const message of this.chunkArr) {
            params.Entries.push({
                Id: uuid.v4(),
                MessageBody: JSON.stringify(message)
            })
        }

        return new Promise((resolve, reject) => {
            this.sqs.sendMessageBatch(params, function(err) {
                if (err) {
                    console.log('An error occurred while sending msg to SQS')
                    reject()
                }
                else {
                    // All msgs sent successfully
                    console.log('Processed: ', params.Entries.length)
                    resolve()
                }
            })
        })
    }

}

module.exports = Pushtosqs
