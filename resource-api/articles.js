const articles = {
    1: {
        id: "1",
        title: "Article 1",
        owner: "user1",
    },
    2: {
        id: "2",
        title: "Article 2",
        owner: "user2",
    },
};

const getArticles = async () => {
    return articles;
};

const getArticleById = async (id) => {
    console.log("id:", id)
    return articles[id];
};

module.exports = { getArticles, getArticleById };