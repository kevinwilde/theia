import { Core, CoreHooks, Plugin } from '@coursehero/theia'
import * as http from 'http'
import { AddressInfo } from 'net'
import createExpressApp from './createExpressApp'

class ExpressPlugin implements Plugin {
  constructor (public port: number) {}

  apply (core: Core) {
    core.hooks.start.tapPromise('ExpressPlugin', this.onStart)
  }

  onStart = ({ core }: CoreHooks.OnStartArgs) => {
    const app = createExpressApp(core)
    const port = this.port
    app.set('port', port)

    const server = http.createServer(app)
    server.listen(port)
    server.on('error', onError)
    server.on('listening', onListening)

    function onError (error: NodeJS.ErrnoException) {
      if (error.syscall !== 'listen') {
        throw error
      }

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          core.logError('theia:ExpressPlugin', `Port ${port} requires elevated privileges`)
          process.exit(1)
          break
        case 'EADDRINUSE':
          core.logError('theia:ExpressPlugin', `Port ${port} is already in use`)
          process.exit(1)
          break
        default:
          throw error
      }
    }

    function onListening () {
      const { port } = server.address() as AddressInfo
      core.log('theia:ExpressPlugin', 'Listening on port ' + port)
    }

    return Promise.resolve()
  }
}

export default ExpressPlugin
