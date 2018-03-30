import { Core, CoreHooks, Plugin } from '../theia'

class UsagePlugin implements Plugin {
  apply (core: Core) {
    core.hooks.express.tapPromise('UsagePlugin', this.onExpress)
  }

  onExpress = ({ core, app }: CoreHooks.OnExpressArgs) => {
    app.get('/', async (req, res) => {
      const helloWorldResult = await core.render('mythos', 'Greeting', {
        name: 'World'
      })

      res.render('usage', {
        helloWorldResultHtml: helloWorldResult.html,
        helloWorldResultAssets: JSON.stringify(helloWorldResult.assets, null, 2)
      })
    })

    return Promise.resolve()
  }
}

export default UsagePlugin
