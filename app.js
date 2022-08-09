const express = require('express'),
bodyParser = require('body-parser'),
mongoose = require('mongoose'),
methodOverride = require('method-override'),
expressSanitizer = require('express-sanitizer'),
dotenv = require('dotenv'),
app = express();
dotenv.config();

const username = process.env.db_user;
const password = process.env.password;

const mongoDBClusterURI = `mongodb+srv://${username}:${password}@cluster0.4iyweli.mongodb.net/restful_blog_db?retryWrites=true&w=majority`;
async function connectMongo() {
    try {
        await mongoose.connect(mongoDBClusterURI);
        console.log('Successfully connected to mongoDB');
    } catch { 
        err => console.log(err, 'Something went wrong');
    }
}
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// I would have created and used header and footer partials for
// my pages headers and footers but for some reason it just
// does not work. If you try it and it works please contact
// me and if you also know why it does not work please
// contact me as well. Thanks : )
// twitter @fanifrancs

const postSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now()},
});

const Post = mongoose.model('Post', postSchema);

app.get('/', (req, res) => {
    res.redirect('/posts');
});

app.get('/posts', (req, res) => {
    Post.find({}, (err, posts) => {
        if (err) {
            console.log('error');
        } else {
            res.render('index', {posts: posts});
        }
    })
});

app.get('/posts/new', (req, res) => {
    res.render('new');
});

app.post('/posts', (req, res) => {
    req.body.post.body = req.sanitize(req.body.post.body);
    Post.create(req.body.post, (err, newPost) => {
        if (err) {
            res.render('new');
        } else {
            res.redirect('/posts');
        }
    })
});

app.get('/posts/:id', (req, res) => {
    Post.findById(req.params.id, (err, foundPost) => {
        if (err) {
            res.redirect('/posts');
        } else {
            res.render('show', {post: foundPost});
        }
    })
});

app.get('/posts/:id/edit', (req, res) => {
    Post.findById(req.params.id, (err, foundPost) => {
        if (err) {
            res.redirect('/posts');
        } else {
            res.render('edit', {post: foundPost});
        }
    })
});

app.put('/posts/:id', (req, res) => {
    req.body.post.body = req.sanitize(req.body.post.body);
    Post.findByIdAndUpdate(req.params.id, req.body.post, (err, updatedPost) => {
        if (err) {
            res.redirect('/posts');
        } else {
            res.redirect('/posts/' + req.params.id);
        }
    })
});

app.delete('/posts/:id', (req, res) => {
    Post.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect('/posts');
        } else {
            res.redirect('/posts/');
        }
    })
});

// app.listen(3500, () => {
//     connectMongo();
//     console.log('server started on port 3500');
// });

app.listen(process.env.PORT, process.env.IP, () => {
    connectMongo();
    console.log('server started');
});