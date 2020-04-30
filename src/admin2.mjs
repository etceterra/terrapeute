import AdminBro from 'admin-bro'
import AdminBroExpress from 'admin-bro-expressjs'
import AdminBroMongoose from 'admin-bro-mongoose'

import { Therapist, Therapy, Symptom } from './therapists/models.mjs'

AdminBro.registerAdapter(AdminBroMongoose)
const adminBro = new AdminBro({
  rootPath: '/admin',
  resources: [
    {
      resource: Therapist,
      options: {
        // We'll add this later
      }
    }
  ],
})

export default AdminBroExpress.buildRouter(adminBro)
