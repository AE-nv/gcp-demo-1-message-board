import * as functions from 'firebase-functions';

// Imports the Google Cloud client library
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const {Translate} = require('@google-cloud/translate');
const language = require('@google-cloud/language');
const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();
const {PubSub} = require('@google-cloud/pubsub');

const projectId = 'message-board-c2da6';
const messageBus = 'message-bus';

exports.translateMessageToEnglish = functions.firestore.document('messages/{messageId}').onCreate((snapshot) => {
  const message = snapshot.data();
  console.log(message);
  if (message !== undefined && message.en === undefined) {
    console.log(`Document translation:`);
    console.log(`Original   : ${message.descr}`);
    const translate = new Translate({
      projectId: 'message-board-c2da6',
    });
    return translate.translate(message.descr, {to: 'en'})
      .then((results: Array<string>) => {
        const translation = results[0];
        console.log(results);
        console.log(`Translation: ${translation}`);
        message.en = translation;
        console.log(message);
        snapshot.ref.set(message);
      })
      .catch((err: string) => {
        console.error('ERROR:', err);
      });
  }
  return false;
});

// Check Sentiment
exports.checkMessageSentiment = functions.firestore.document('messages/{messageId}').onUpdate((snapshot) => {
  const message = snapshot.after.data();

  if (message !== undefined && message.en !== undefined && message.score === undefined) {
    const client = new language.LanguageServiceClient();
    const document = {
      content: message.en,
      type: 'PLAIN_TEXT',
    };

    return client
      .analyzeSentiment({document: document})
      .then((results: Array<any>) => {
        message.score = results[0].documentSentiment.score;
        console.log(`Document sentiment:`);
        console.log(`  Text   : ${message.descr}`);
        console.log(`  English: ${message.en}`);
        console.log(`  Score  : ${message.score}`);

        publishAnalysedMessage(message);
        snapshot.after.ref.set(message);
      })
      .catch((err: string) => {
        console.error('ERROR:', err);
      });
  }
  return false;
});


// Read a message from the message bus and publish it on the board
exports.publishOnMessageBoard = functions.pubsub.topic(messageBus).onPublish(event => {
  console.log(Buffer.from(event.data, 'base64').toString());
  const message = event.data ? Buffer.from(event.data, 'base64').toString() : null;
  if (message !== null) {
    console.log(`Message received:`);
    console.log(`  Text   : ${message}`);
    return firestore.collection("messages").add({descr: message, date: new Date().toUTCString()});
  }
  return message;
});


// Publish analysed message
function publishAnalysedMessage (data: any) {
  // Instantiates a client
  const pubsub = new PubSub({projectId});

  // References an existing topic, e.g. "my-topic"
  const topic = pubsub.topic('analysed-messages');

  // Create a publisher for the topic (which can include additional batching configuration)
  const dataBuffer = Buffer.from(JSON.stringify(data));

  return topic.publish(dataBuffer)
    .then((messageId: string) => {
      console.log(`Message ${messageId} published.`);
      return messageId;
    });
}

