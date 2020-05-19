import { Article } from './models.js'
import config from '../config.js'
import multer from 'multer'
import fs from 'fs'

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, next) => {
      const id = req.body.id
      if(!id.match(/^[0-9a-z]{24}$/)) return res(401)
      const dir = `${config.uploadPath}/journal/${id}`
      if(!fs.existsSync(dir)) fs.mkdirSync(dir)
      next(null, dir)
    },
    filename: (req, file, next) => {
      req.fileUrl = `${config.uploadUrl}/journal/${req.body.id}/${file.originalname}`
      next(null, file.originalname)
    }
  })
})

export default function (app, prefix = '') {

  app.get(`${prefix}/`, async (req, res) => {
    const articles = await Article.find({}).sort('-creationDate')
    res.render('articles/index', { articles })
  })

  app.get(`${prefix}/admin`, async (req, res) => {
    const articles = await Article.find({})
    res.render('articles/admin/list', { articles, therapists: [] })
  })

  app.get(`${prefix}/admin/new`, async (req, res) => {
    res.render('articles/admin/edit', { article: new Article() })
  })

  app.post(`${prefix}/admin/new`, async (req, res) => {
    const article = await Article.create(req.body)
    res.redirect('/journal/admin')
  })

  app.get(`${prefix}/admin/:id`, async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id })
    res.render('articles/admin/edit', { article })
  })

  app.post(`${prefix}/admin/:id`, async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id })
    // Don't use `updateOne` so that `pre('save')` is called.
    Object.assign(article, req.body)
    article.save()
    res.redirect('/journal/admin')
  })

  app.post(`${prefix}/admin/:id/delete`, async (req, res) => {
    const article = await Article.deleteOne({ _id: req.params.id })
    res.redirect('/journal/admin')
  })

  app.get(`${prefix}/:slug`, async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug })
    res.render('articles/view', { article })
  })

  app.post('/upload', upload.single('file'), (req, res) => {
    res.end(JSON.stringify({
      url: req.fileUrl,
      href: req.fileUrl,
    }))
  })
}
