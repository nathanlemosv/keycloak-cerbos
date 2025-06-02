const express = require('express');
const app = express();
const { GRPC: Cerbos } = require("@cerbos/grpc");
const {getArticles, getArticleById} = require("./articles");
const PORT = 8585;

app.use(express.json());

app.use((req, res, next) => {
    req.user = {
        id: "user1",
        roles: ["user"],
    };
    next();
});

const cerbos = new Cerbos("localhost:3593", {
    tls: false,
});

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.get('/resource-api/article', async (req, res) => {
    const articles = await getArticles()
    res.json(articles);
});

app.get("/resource-api/article/:id", async (req, res) => {
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    console.log("user: ", JSON.stringify(req.user))
    const permissions = await cerbos.checkResource({
        principal: {
            id: req.user.id,
            roles: req.user.roles,
            attributes: req.user,
        },
        resource: {
            kind: "article",
            id: article.id,
            attributes: article,
        },
        actions: ["read"],
    });

    if (!permissions.isAllowed("read")) {
        res.status(403).json({ error: "Forbidden" });
    } else {
        res.json(article);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});