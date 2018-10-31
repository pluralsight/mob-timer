const chai = require('chai')
const sinonChai = require('sinon-chai')

global.expect = chai.expect

chai.use(sinonChai)
