# csvtosqs #

## Convert csv to json and then send a batch of rows to AWS SQS ##

This tool uses [node streams](https://nodejs.org/api/stream.html) and hence can work with large csv file (having thousands for rows).



### How does this tool work? ###

* Reads csv file using streams
* While reading, it converts each csv row into json and chunks them into a batch (of 10 msgs)
* Then send this batch to AWS SQS using `sendMessageBatch()`


### Library ###

----

**Installation**
```
npm install csvtosqs --save
```

**Code Sample**

```
const csvtsqs = require('csvtosqs')
var csv = new csvtsqs({
    accessKeyId: 'xxxxx',
    secretAccessKey: 'xxxxx',
    region: 'xxxxx'
})

csv.send({
    file: './large.csv',
    queueUrl: 'https://sqs.eu-west-1.amazonaws.com/xxxxx/test-queue'
})
```

### Contribution ###

This tool was designed to solve a simple problem efficiently. Your suggestions are welcome. Please feel free to reach out even for the smallest suggestion. Thank you!
