const stream = require('stream');
var uuid = require('uuid');
var sendToSQSArray = []
let queue = ""

class PushToSqs extends stream.Transform {
    
    constructor({options = {},queueUrl,sqs}) {
		super({ ...options, objectMode: true })
		
        // Asssign queue name
        queue = queueUrl
        this.sqs = sqs
	}

	async _transform(chunk, encoding, done) {
		try {
            console.count("Line:--->")
            sendToSQSArray.push(chunk)
            if (sendToSQSArray.length == 10){
                await this.sendBulkMsgToSQS(sendToSQSArray,queue)
                console.log("--------------------------------------------------------------------------")
                sendToSQSArray = []
            }
		} catch (error) {
			done(error)
		}
	}

    // Check for any last data in the sendToSQSArray 0 to 9
    async _flush(rs, err) {
        if (sendToSQSArray.length <= 10){
            await this.sendBulkMsgToSQS(sendToSQSArray,queue)
            console.log("--------------------------------------------------------------------------")
            sendToSQSArray = []
        }

        if (err) {
          console.error('Stream failed.', err);
        } else {
          console.log('Stream is done reading.');
        }
      }    

    sendBulkMsgToSQS(batchArray,queue){
        for (const _ of batchArray) {
            var params = {
                // QueueUrl: 'https://sqs.ap-south-1.amazonaws.com/303877189979/teletask-preupload-staging',
                QueueUrl:queue,
                Entries: []
            };

            for (const message of batchArray) {
                params.Entries.push({
                    Id: uuid.v4(),
                    MessageBody: JSON.stringify(message)
                });
            }
            
            return new Promise((resolve,reject) => {
                this.sqs.sendMessageBatch(params, function(err, data) {
                    if (err) {
                        console.log("Error Sending Msg to Queue ",queue)
                        reject()                    
                    } else {
                        //all msgs sent successfully
                        console.log("Msgs Sent Successfully to ",queue)
                        resolve()
                    }
                })
            })
        }
    }
}

module.exports = PushToSqs;