import * as functions from "firebase-functions";
import { PubSub } from "@google-cloud/pubsub";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const pubsub = new PubSub();
const fullTopicName = "/topics/topic";

export const subscribeTopic = functions.https.onRequest(async (req, res) => {
  const name: string = req.query.name as string;
  res.set("Access-Control-Allow-Origin", "*");
  try {
    const [topics] = await pubsub.getTopics();

    const testTopic = topics.filter((topic) =>
      topic.name.includes("topic")
    )?.[0];
    if (!testTopic) pubsub.createTopic("topic");
    const result = await pubsub.createSubscription("topic", name);
    console.log(result);
    res.end();
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

export const publishMessage = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  const message = req.query.message?.toString();
  const messageBody = JSON.stringify({ message });
  const buffer = Buffer.from(messageBody);

  try {
    const [topics] = await pubsub.getTopics();

    const testTopic = topics.filter((topic) =>
      topic.name.includes("topic")
    )?.[0];
    if (!testTopic) pubsub.createTopic("topic");
    const messageId = await pubsub
      .topic("topic")
      .publishMessage({ data: buffer });

    res.send(JSON.stringify({ messageId }));
  } catch (error) {
    console.log("🚀 ~ file: index.ts:54 ~ publishMessage ~ error", error);
    console.error(`unable to publish to topic ${fullTopicName}`);
    res.end();
  }
});

export const helloPubSub = functions.pubsub
  .topic("topic")
  .onPublish(async (message, ctx) => {
    const buffer = message.data;
    console.log({ data: Buffer.from(buffer, "base64").toString() });
    console.log({ ctx });

    return null; // returns nothing
  });
