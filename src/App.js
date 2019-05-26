import React from 'react'
import update from 'immutability-helper'
import Form from 'react-jsonschema-form'
import FieldEditor from './FieldEditor.js'
import Dialog from './Dialog.js'
import './Dashboard.css'
import './App.css'
import { camelCase, pascalCase } from './string-utils.js'
import api from './api.js'
import { enumTypes } from './schema/types.js'
import BootstrapTable from 'react-bootstrap-table-next'

const products = [
  { id: 1, name: 'Eggs', price: 90 },
  { id: 2, name: 'Milk', price: 80 }
]
const columns = [{
  dataField: 'id',
  text: 'Product ID'
}, {
  dataField: 'name',
  text: 'Product Name'
}, {
  dataField: 'price',
  text: 'Product Price'
}]

const appSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', title: 'Name' }
  }
}

const tableSchema = {
  type: 'object',
  required: ['name', 'modelName', 'displayName'],
  properties: {
    name: { type: 'string', title: 'Name' },
    modelName: { type: 'string', title: 'Model name' },
    displayName: { type: 'string', title: 'Display name' }
  }
}

const addTableSchema = {
  type: 'object',
  required: ['displayName'],
  properties: {
    displayName: { type: 'string', title: 'Display name' }
  }
}

const addFieldSchema = {
  type: 'object',
  required: ['title', 'type'],
  properties: {
    title: { type: 'string', title: 'Title' },
    type: { type: 'string', title: 'Type', enum: enumTypes }
  }
}

const types = {
  TABLE: 'table',
  FIELD: 'field'
}

class App extends React.Component {
  // constructor (props) {
  //   super(props)
  //   const { app } = props
  //   this.state = { app }
  // }

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

  onSubmitUpdateField = (e) => {
    const { app, active } = this.state
    const { fieldId, table, tableId } = active
    const updated = update(app, {
      tables: {
        [tableId]: {
          fields: {
            [fieldId]: {
              $set: e.formData
            }
          }
        }
      }
    })

    this.setState({
      app: updated,
      active: {
        field: updated.tables[tableId].fields[fieldId],
        fieldId,
        table,
        tableId,
        type: types.FIELD
      }
    })
    // this.props.onChange(app)
  }

  onClickField = ({ field, fieldId, table, tableId }) => {
    this.setState({
      active: {
        field,
        fieldId,
        table,
        tableId,
        type: types.FIELD
      }
    })
  }

  onClickCloseDialog = () => {
    this.setState({
      showDialog: false
    })
  }

  onClickTable = ({ table }) => {
    this.setState({
      active: { type: types.TABLE, table }
    })
  }

  onSubmitAddField = (e) => {
    const { app, showDialog } = this.state
    const { title, type } = e.formData
    const table = showDialog.data.table
    const tableId = app.tables.findIndex(t => t === table)
    const field = {
      name: camelCase(title),
      title,
      type
    }

    const updated = update(app, {
      tables: {
        [tableId]: {
          fields: {
            $push: [field]
          }
        }
      }
    })

    const active = {
      field,
      fieldId: updated.tables[tableId].fields.indexOf(field),
      table,
      tableId,
      type: types.FIELD
    }

    this.setState({
      app: updated,
      active,
      showDialog: false
    })
  }

  onClickAddField = ({ table }) => {
    this.setState({
      showDialog: {
        title: 'Add field',
        schema: addFieldSchema,
        onSubmit: this.onSubmitAddField,
        data: { table }
      }
    })
  }

  onClickAddTable = ({ e }) => {
    this.setState({
      showDialog: {
        title: 'Add table',
        schema: addTableSchema,
        onSubmit: this.onSubmitAddTable
      }
    })
  }

  onSubmitAddTable = (e) => {
    const { app } = this.state
    const displayName = e.formData.displayName

    const table = {
      name: camelCase(displayName),
      displayName: displayName,
      modelName: pascalCase(displayName),
      fields: []
    }

    const updated = update(app, {
      tables: {
        $push: [table]
      }
    })

    const active = {
      table
    }

    this.setState({
      app: updated,
      showDialog: false,
      active
    })
  }

  getActiveEditor = () => {
    const { app, active } = this.state
    switch (active.type) {
      case types.FIELD:
        return <FieldEditor
          app={app}
          tables={app.tables}
          table={active.table}
          field={active.field}
          onSubmit={this.onSubmitUpdateField} />

      default:
        return <Form
          schema={tableSchema}
          formData={active.table} />
    }
  }

  render () {
    if (!this.state || !this.state.app) {
      return 'Loading...'
    }

    const { app, active, showDialog } = this.state

    const { tables } = app

    return (
      <>
        <div className='row'>
          <div className='col-sm-3 col-md-2 sidebar'>
            <ul className='nav nav-sidebar'>
              <li className='active'><a href='#'>Overview <span className='sr-only'>(current)</span></a></li>
              <li><a href='#'>Reports</a></li>
              <li><a href='#'>Analytics</a></li>
              <li><a href='#'>Export</a></li>
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
          <div className='col-sm-9 col-sm-offset-3 col-md-7 col-md-offset-2 main'>
            <h1 className='page-header'>Tables</h1>
            {showDialog && (
              <Dialog
                title={showDialog.title}
                onClickClose={this.onClickCloseDialog}>
                <Form
                  schema={showDialog.schema}
                  onSubmit={showDialog.onSubmit} />
              </Dialog>
            )}

            <a onClick={this.onClickAddTable}>Add Table</a>
            <div className='db-editor row'>
              {tables.map((table, tableId) => {
                return (
                  <div className='col-md-4' key={tableId}>
                    <div className='panel panel-default'>
                      <div className='panel-heading'>
                        <a onClick={e => this.onClickTable({ e, table })}>{table.displayName}</a>
                        <a className='pull-right' onClick={e => this.onClickAddField({ e, table, tableId })}>+</a>
                      </div>
                      <table className='table table-condensed'>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th style={{ textAlign: 'center' }}>Nullable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.fields.map((field, fieldId) => (
                            <tr key={fieldId}>
                              <td><a onClick={() => this.onClickField({ field, fieldId, table, tableId })}>{field.name}</a></td>
                              <td>{field.type}</td>
                              <td style={{ textAlign: 'center', position: 'relative' }}>
                                {field.type !== 'relation' && (
                                  <input type='checkbox' defaultChecked={field.nullable} readOnly disabled />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
              <BootstrapTable keyField='id' data={products} columns={columns} />
            </div>
          </div>
          <div className='col-sm-3 col-md-3 sidebar right'>
            {active ? this.getActiveEditor() : (
              <div className='panel-body'>
                <Form
                  schema={appSchema}
                  formData={app} />
                {/* <p>{table.displayName} {table.modelName} {table.name}</p> */}
              </div>
            )}
          </div>
        </div>
      </>
    )
  }
}

export default App
