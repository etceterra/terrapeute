import AdminBro from 'admin-bro'
import AdminBroExpress from 'admin-bro-expressjs'
import AdminBroMongoose from 'admin-bro-mongoose'

import { Therapist, Therapy, Symptom } from './therapists/models.mjs'

export default function (app, route) {
  AdminBro.registerAdapter(AdminBroMongoose)
  const adminBro = new AdminBro({
    rootPath: route,
    resources: [Therapist, Therapy, Symptom],
  })
  const router = AdminBroExpress.buildRouter(adminBro)
  app.use(route, router)
}
