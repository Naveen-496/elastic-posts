import { Client } from "@elastic/elasticsearch";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";




dotenv.config({ path: "./.elastic.env" });

export const elasticClient = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUDID as string,
  },

  auth: {
    username: process.env.ELASTIC_USERNAME as string,
    password: process.env.ELASTIC_PASSWORD as string,
  },
});

const createIndex = async (indexName: string) => {
  try {
    const result  = await elasticClient.indices.exists({ index: indexName });
    if (result) {
      console.log(`Index ${indexName} already exists`);
      return;
    }
    await elasticClient.indices.create({ index: indexName });
    console.log("Index created");
  } catch (error) {
    console.error("Error creating index:", error);
  }
};


createIndex("posts");


const seedPostsIndex = async () => {
  for (let i = 0; i < 100; i++) {
    const post = {
      title: faker.lorem.lines(1),
      content: faker.lorem.paragraphs(3),
      author: faker.person.fullName(),
    };

    await elasticClient.index({
      index: "posts",
      document: {
        title: post.title,
        author: post.author,
        content: post.content,
      },
    });
  }

  console.log("Seeded Initial Posts");
};

// seedPostsIndex();