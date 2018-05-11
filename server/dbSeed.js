const User = require('./models/user')

// TODO: requires db connection, move to its own organelle
User.create({
  email: 'aivo@devlabs.bg',
  password: 'nd2ibd57GJlAjOpS',
  firstname: 'George',
  lastname: 'Restful'
}, (err, user) => {
  if (err) return console.log(err)

  console.log('Seed done.')
  process.exit(0)
})
