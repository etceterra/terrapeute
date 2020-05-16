import AdminBro from 'admin-bro'
import AdminBroExpress from 'admin-bro-expressjs'
import AdminBroMongoose from 'admin-bro-mongoose'

import { Therapist, Therapy, Symptom, Synonym } from './therapists/models.mjs'
import { Article } from './articles/models.mjs'

export default function (app, route) {
  AdminBro.registerAdapter(AdminBroMongoose)
  const adminBro = new AdminBro({
    rootPath: route,
    branding: {
      companyName: 'Naturapeute Admin',
    },
    dashboard: {
      // component: AdminBro.bundle('./my-dashboard-component')
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
          listProperties: ['title'],
          showProperties: ['title', 'slug', 'tags', 'body'],
          titleProperty: 'title',
          properties: {
            slug: { isVisible: false },
            body: {
              type: 'richtext'
            },
            tags: {
              components: {
                // list: AdminBro.bundle('./strings-list.jsx'),
              }
            }
          }
        }
      },
    ],
  })
  const router = AdminBroExpress.buildRouter(adminBro)
  app.use(route, router)
}
