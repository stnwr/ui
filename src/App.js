import React from 'react'
import { Route, Router, Link } from 'react-router-dom'
import './Dashboard.css'
import './App.css'
import api from './api.js'
import Table from './Table.js'
import Tables from './Tables.js'
import Diagram from './Diagram.js'
import history from './history.js'

class App extends React.Component {
  componentDidMount () {
    api.get('/app')
      .then(result => {
        const app = result.data
        this.setState({ app })
      })
      .catch(err => {
        console.error(err)
      })
  }

  render () {
    if (!this.state || !this.state.app) {
      return 'Loading...'
    }

    const { app } = this.state

    return (
      <Router history={history}>
        <div className='row'>
          <div className='col-sm-3 col-md-2 sidebar'>
            <ul className='nav nav-sidebar'>
              <li className='active'><Link to={`/tables`}>Tables</Link></li>
              <li><Link to={`/diagram`}>Diagram</Link></li>
              {app.tables.map(t => (
                <li key={t.name}><Link to={`/table/${t.name}`}>{t.title}</Link></li>
              ))}
            </ul>
            <ul className='nav nav-sidebar'>
              <li><a href=''>Nav item</a></li>
              <li><a href=''>Nav item again</a></li>
              <li><a href=''>One more nav</a></li>
              <li><a href=''>Another nav item</a></li>
              <li><a href=''>More navigation</a></li>
            </ul>
            <ul className='nav nav-sidebar'>
              <li><a href=''>Nav item again</a></li>
              <li><a href=''>One more nav</a></li>
              <li><a href=''>Another nav item</a></li>
            </ul>
          </div>

          <Route path='/tables' exact render={props => <Tables app={app} {...props} />} />
          <Route path='/diagram' exact render={props => <Diagram app={app} {...props} />} />
          <Route path='/table/:name' exact render={props => <Table app={app} {...props} />} />
        </div>
      </Router>
    )
  }
}

export default App
