import AdminBro from 'admin-bro'
import AdminBroExpress from 'admin-bro-expressjs'
import AdminBroMongoose from 'admin-bro-mongoose'

import { Therapist, Therapy, Symptom, Synonym } from './therapists/models.mjs'

export default function (app, route) {
  AdminBro.registerAdapter(AdminBroMongoose)
  const adminBro = new AdminBro({
    rootPath: route,
    branding: {
      companyName: 'Terrapeute Admin',
    },
    resources: [
      { resource: Synonym,
        options: {
          listProperties: ['name', 'words'],
          showProperties: ['name', 'words'],
          editProperties: ['name', 'words'],
          titleProperty: 'name',
        }
      },
    ],
  })
  const router = AdminBroExpress.buildRouter(adminBro)
  app.use(route, router)
}
