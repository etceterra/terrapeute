import AdminBro from 'admin-bro'
import AdminBroExpress from 'admin-bro-expressjs'
import AdminBroMongoose from 'admin-bro-mongoose'

import { Therapist, Therapy, Symptom, Synonym } from './therapists/models.js'
import { Article } from './articles/models.js'

export default function (app, route) {
  AdminBro.registerAdapter(AdminBroMongoose)
  const adminBro = new AdminBro({
    rootPath: route,
    branding: {
      companyName: 'Naturapeute',
    },
    resources: [
      {
        resource: Synonym,
        options: {
          listProperties: ['name', 'words'],
          showProperties: ['name', 'words'],
          editProperties: ['name', 'words'],
          titleProperty: 'name',
          isVisible: { list: true, filter: true, show: false, edit: true },
        }
      },
      {
        resource: Article,
        options: {
          listProperties: ['title', 'creationDate'],
          showProperties: ['title', 'slug', 'tags', 'body'],
          titleProperty: 'title',
          properties: {
            slug: { isVisible: false },
            body: {
              type: 'richtext'
            },
            tags: {
              components: {
                // edit: AdminBro.bundle('strings-list'), //'StringsList',
                list: AdminBro.bundle('upload-image'), //'StringsList',
              }
            }
          }
        }
      },
      {
        resource: Therapy,
      },
      {
        resource: Therapist,
        options: {
          listProperties: ['firstname', 'lastname', 'creationDate'],
          showProperties: ['firstname', 'lastname', 'creationDate', 'therapies'],
          editProperties: ['firstname', 'lastname', 'creationDate', 'therapies'],
        }
      }
    ],
  })
  const router = AdminBroExpress.buildRouter(adminBro)
  app.use(route, router)
}
