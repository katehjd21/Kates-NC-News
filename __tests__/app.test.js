const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const app = require("../db/app");

/* Set up your test imports here */

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: responds with an array of all topics each with a property of slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: responds with the appropriate article object by the given id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 11,
          body: "I find this existence challenging",
        });
      });
  });

  test("200: responds with the appropriate article by the given id with a comment_count property included", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("comment_count");
        expect(article.comment_count).toBe(11);
      });
  });
  test("200: responds with the appropriate article by the given id with a comment_count of 0, if the article has no comments", () => {
    return request(app)
      .get("/api/articles/4")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toEqual({
          author: "rogersop",
          title: "Student SUES Mitch!",
          article_id: 4,
          topic: "mitch",
          created_at: "2020-05-06T01:14:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
          comment_count: 0,
        });
      });
  });

  test("GET:400 responds with an appropriate error message when given an invalid id", () => {
    return request(app)
      .get("/api/articles/not-an-id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("GET:404 responds with an appropriate error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not found");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test("200: responds with all articles in an array sorted by created_at date in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("404: responds with an appropriate error message if given an invalid endpoint", () => {
    return request(app)
      .get("/api/notAnEndpoint")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not found");
      });
  });
});

describe("GET /api/articles?sort_by", () => {
  test("200: responds with articles sorted by author in descending order if ?sort_by=author", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("author", { descending: true });
      });
  });
  test("200: responds with articles sorted by article_id in descending order if ?sort_by=article_id", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("article_id", { descending: true });
      });
  });
  test("200: responds with articles sorted by title in descending order if ?sort_by=title", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("title", { descending: true });
      });
  });
  test("200: responds with articles sorted by topic in descending order if ?sort_by=topic", () => {
    return request(app)
      .get("/api/articles?sort_by=topic")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("topic", { descending: true });
      });
  });
  test("200: responds with articles sorted by created_at in descending order if ?sort_by=created_at", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: responds with articles sorted by votes in descending order if ?sort_by=votes", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("votes", { descending: true });
      });
  });
  test("200: responds with articles sorted by article_img_url in descending order if ?sort_by=article_img_url", () => {
    return request(app)
      .get("/api/articles?sort_by=article_img_url")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("article_img_url", { descending: true });
      });
  });
  test("200: responds with articles sorted by comment_count in descending order if ?sort_by=comment_count", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy(Number("comment_count"), {
          descending: true,
        });
      });
  });
  test("400: responds with an appropriate error message when given an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles/?sort_by=banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
});

describe("GET /api/articles?order", () => {
  test("200: responds with articles in ascending order by created_at date when given order query and no sort_by query", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("created_at");
      });
  });
  test("200: responds with articles in descending order by created_at date when given order query and no sort_by query", () => {
    return request(app)
      .get("/api/articles?order=desc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: responds with articles in descending order by created_at date by default when given no order query and no sort_by query", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("400: responds with an appropriate error message when given an invalid order query", () => {
    return request(app)
      .get("/api/articles/?order=up")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
});

describe("GET /api/articles?sort_by&order", () => {
  test("200: responds with articles sorted in the correct order when given a sort_by and order query", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("title");
      });
  });
  test("200: responds with articles sorted in the correct order when given a sort_by and order query", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=desc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy(Number("comment_count"), {
          descending: true,
        });
      });
  });
  test("400: responds with an appropriate error message when given an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles/?sort_by=banana&order=asc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("400: responds with an appropriate error message when given an invalid order query", () => {
    return request(app)
      .get("/api/articles/?sort_by=title&order=up")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
});

describe("GET /api/articles?topic", () => {
  test("200: responds with an array of filtered articles where the article topic matches the topic query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles, total_count } = body;
        expect(articles.length).toBe(10);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("200: responds with an empty array if the topic exists but there are no articles with that topic", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });
  test("200: responds with an array of all articles if topic query is ommitted", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
      });
  });
  test("404: responds with an appropriate error message when given a topic that doesn't exist in the topic query", () => {
    return request(app)
      .get("/api/articles?topic=banana")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not found");
      });
  });
});

describe("GET /api/artices?limit", () => {
  test("200: responds with an array of articles limited to the limit query given", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(5);
      });
  });
  test("200: responds with an array of articles limited to a default of 10 if no limit query given", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
      });
  });
  test("200: responds with a total_count property displaying the total number of articles when there is no filter applied, discounting the limit", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.total_count).toBe(13);
      });
  });
  test("200: responds with a total_count property displaying the total number of articles when there is a filter applied, discounting the limit", () => {
    return request(app)
      .get("/api/articles?topic=mitch&limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.total_count).toBe(12);
      });
  });

  test("400: responds with an appropriate error message when the limit query given is invalid", () => {
    return request(app)
      .get("/api/articles?limit=notValid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
});

describe("GET /api/articles?p", () => {
  test("200: responds with an array of articles from the page number given in the p query limited to 10 by default", () => {
    return request(app)
      .get("/api/articles?p=1")
      .expect(200)
      .then(({ body }) => {
        const { articles, total_count } = body;
        expect(articles.length).toBe(10);
        expect(total_count).toBe(13);
      });
  });
  test("200: responds with a limited array of articles on the final page of results", () => {
    return request(app)
      .get("/api/articles?p=2")
      .expect(200)
      .then(({ body }) => {
        const { articles, total_count } = body;
        expect(articles.length).toBe(3);
        expect(total_count).toBe(13);
        expect(articles[0].article_id).toBe(8);
        expect(articles[1].article_id).toBe(11);
        expect(articles[2].article_id).toBe(7);
      });
  });
  test("200: responds with an empty array if the p value given is higher than the number of pages of results", () => {
    return request(app)
      .get("/api/articles?p=3")
      .expect(200)
      .then(({ body }) => {
        console.log(body);
        const { articles, total_count } = body;
        expect(articles.length).toBe(0);
        expect(total_count).toBe(13);
        expect(articles).toEqual([]);
      });
  });
  test("200: responds with an array of articles from the page number given and limited to the limit value given", () => {
    return request(app)
      .get("/api/articles?limit=5&p=2")
      .expect(200)
      .then(({ body }) => {
        const { articles, total_count } = body;
        expect(articles.length).toBe(5);
        expect(total_count).toBe(13);
        expect(articles[0].article_id).toBe(5);
        expect(articles[1].article_id).toBe(1);
        expect(articles[2].article_id).toBe(9);
        expect(articles[3].article_id).toBe(10);
        expect(articles[4].article_id).toBe(4);
      });
  });
  test("200: responds with an array of articles defaulted to page 1 if no p query given", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then(({ body }) => {
        const { articles, total_count } = body;
        expect(articles.length).toBe(5);
        expect(total_count).toBe(13);
        expect(articles[0].article_id).toBe(3);
        expect(articles[1].article_id).toBe(6);
        expect(articles[2].article_id).toBe(2);
        expect(articles[3].article_id).toBe(13);
        expect(articles[4].article_id).toBe(12);
      });
  });
  test("200: responds with an array of articles limited to value given and from the page number given when a filter is applied", () => {
    return request(app)
      .get("/api/articles?limit=5&p=1&topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles, total_count } = body;
        expect(articles.length).toBe(5);
        expect(total_count).toBe(12);
        expect(articles[0].article_id).toBe(3);
        expect(articles[1].article_id).toBe(6);
        expect(articles[2].article_id).toBe(2);
        expect(articles[3].article_id).toBe(12);
        expect(articles[4].article_id).toBe(13);
      });
  });
  test("200: responds with an array of articles limited to value given and from the page number given when multiple other queries are given", () => {
    return request(app)
      .get("/api/articles?limit=5&p=1&topic=mitch&sort_by=author&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles, total_count } = body;
        expect(articles.length).toBe(5);
        expect(total_count).toBe(12);
        expect(articles[0].article_id).toBe(12);
        expect(articles[1].article_id).toBe(13);
        expect(articles[2].article_id).toBe(1);
        expect(articles[3].article_id).toBe(9);
        expect(articles[4].article_id).toBe(3);
      });
  });
  test("400: responds with an appropriate error message when the p query given is invalid", () => {
    return request(app)
      .get("/api/articles?p=notValid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
});

describe("POST /api/articles", () => {
  test("201: responds with the newly added article", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "Happy Go Lucky",
      body: "It's hard to know what to write!",
      topic: "paper",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          author: "butter_bridge",
          title: "Happy Go Lucky",
          body: "It's hard to know what to write!",
          topic: "paper",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
  test("responds with newly added article with default article_img_url if not provided", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "Happy Go Lucky",
      body: "It's hard to know what to write!",
      topic: "paper",
    };
    const defaultArticleUrl =
      "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700";
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(({ body }) => {
        const { article } = body;
        expect(article.article_img_url).toBe(defaultArticleUrl);
      });
  });
  test("400: responds with an appropriate error message when the request body does not contain an author", () => {
    const newArticle = {
      title: "Happy Go Lucky",
      body: "It's hard to know what to write!",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("400: responds with an appropriate error message when the request body does not contain a title", () => {
    const newArticle = {
      author: "butter_bridge",
      body: "It's hard to know what to write!",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("400: responds with an appropriate error message when the request body does not contain a body", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "Happy Go Lucky",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("400: responds with an appropriate error message when the request body does not contain a topic", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "Happy Go Lucky",
      body: "It's hard to know what to write!",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  const incVotes = { inc_votes: 8 };
  const decVotes = { inc_votes: -5 };
  test("200: responds with the updated article object with the vote property incremented when inc_votes is a positive integer", () => {
    return request(app)
      .patch("/api/articles/4")
      .send(incVotes)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            title: "Student SUES Mitch!",
            topic: "mitch",
            author: "rogersop",
            body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
            created_at: expect.any(String),
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            votes: 8,
            article_id: 4,
          })
        );
      });
  });
  test("200: responds with the updated article object with the vote property decremented when inc_votes is a negative integer", () => {
    return request(app)
      .patch("/api/articles/1")
      .send(decVotes)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: expect.any(String),
            votes: 95,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            article_id: 1,
          })
        );
      });
  });
  test("400: responds with an appropriate error message when request body does not contain the correct field", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ number: 9 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("400: responds with an appropriate error message when request body has a valid body field but the value of the field is invalid", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "String" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("400: responds with an appropriate error message when given an invalid article_id", () => {
    return request(app)
      .patch("/api/articles/notAnId")
      .send(incVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("404: responds with an appropriate error message when given a valid but non-existent article_id", () => {
    return request(app)
      .patch("/api/articles/99999")
      .send(decVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not found");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/9/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(2);
        body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 9,
            })
          );
        });
      });
  });
  test("200: responds with an array of comments for the given article_id in descending order by date created (most recent first)", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(11);
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: responds with an empty array if given an existing article_id but the article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test("400: responds with an appropriate error message when given an invalid id", () => {
    return request(app)
      .get("/api/articles/notAnId/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("404: responds with an appropriate error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  const newComment = {
    username: "lurker",
    body: "Brilliant article! Definitely worth a read!",
  };
  test.only("201: responds with a newly posted comment for an article", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: "Brilliant article! Definitely worth a read!",
            article_id: 3,
            author: "lurker",
            votes: 0,
            created_at: expect.any(String),
          })
        );
      });
  });
  test("400: responds with an appropriate error message when the request body does not contain the correct fields", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({ rating: 5, writer: "Mr Smiley Face" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("400: responds with an appropriate error message when the request body contains the correct fields but the value of the field is invalid", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({ username: 5, body: true })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("400: responds with an appropriate error message when given an invalid article_id", () => {
    return request(app)
      .post("/api/articles/notAnId/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("404: responds with an appropriate error message when given a valid but non-existent article_id", () => {
    return request(app)
      .post("/api/articles/99999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not found");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: responds with a no content message when comment successfully deleted", () => {
    return request(app).delete("/api/comments/3").expect(204);
  });
  test("404: responds with an appropriate error message when given a valid but non-existent id", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not found");
      });
  });
  test("400: responds with an appropriate error message when given an invalid id", () => {
    return request(app)
      .delete("/api/comments/notAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  const incVotes = { inc_votes: 3 };
  const decVotes = { inc_votes: -3 };
  test("200: responds with the updated comment object with the vote property incremented when inc_votes is a positive integer", () => {
    return request(app)
      .patch("/api/comments/10")
      .send(incVotes)
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toEqual(
          expect.objectContaining({
            body: "git push origin master",
            votes: 3,
            author: "icellusedkars",
            article_id: 3,
            created_at: expect.any(String),
          })
        );
      });
  });
  test("200: responds with the updated comment object with the vote property decremented when inc_votes is a negative integer", () => {
    return request(app)
      .patch("/api/comments/1")
      .send(decVotes)
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toEqual(
          expect.objectContaining({
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            votes: 13,
            author: "butter_bridge",
            article_id: 9,
            created_at: expect.any(String),
          })
        );
      });
  });
  test("400: responds with an appropriate error message when request body does not contain the correct field", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ number: 9 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("400: responds with an appropriate error message when request body has a valid body field but the value of the field is invalid", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "String" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("400: responds with an appropriate error message when given an invalid comment_id", () => {
    return request(app)
      .patch("/api/comments/notAnId")
      .send(incVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400: Bad request");
      });
  });
  test("404: responds with an appropriate error message when given a valid but non-existent comment_id", () => {
    return request(app)
      .patch("/api/comments/99999")
      .send(decVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not found");
      });
  });
});

describe("GET /api/users", () => {
  test("200: responds with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: responds with the appropriate user object for the username given", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toEqual({
          username: "lurker",
          name: "do_nothing",
          avatar_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
        });
      });
  });
  test("404: responds with an appropriate error message when passed a non-existent username", () => {
    return request(app)
      .get("/api/users/happyBunny123")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not found");
      });
  });
});

describe("General error handlers", () => {
  test("404: responds with an appropriate error message when given an invalid endpoint", () => {
    return request(app)
      .get("/api/notaroute")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not found");
      });
  });
});
