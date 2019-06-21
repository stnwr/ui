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

const appSchema = {
  type: 'object',
  required: ['name', 'domain'],
  properties: {
    name: { type: 'string', title: 'Name' },
    domain: { type: 'string', title: 'Domain' }
  }
}

const tableSchema = {
  type: 'object',
  required: ['name', 'modelName', 'title'],
  properties: {
    name: { type: 'string', title: 'Name' },
    title: { type: 'string', title: 'Title' },
    description: { type: 'string', title: 'Description' },
    modelName: { type: 'string', title: 'Model name' },
    modelPath: { type: 'string', title: 'Model path' },
    defaultTextField: { type: 'string', title: 'Default text field' },
    primaryKeyField: { type: 'array', title: 'Primary key', items: { type: 'string' } }
  }
}

const addTableSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', title: 'Title' }
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

class Tables extends React.Component {
  constructor (props) {
    super(props)
    const { app } = props
    this.state = { app }

    setInterval(() => {
      window.localStorage.setItem('appjson', JSON.stringify(this.state.app, null, 2))
    }, 20 * 1000)
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

  onSubmitUpdateTable = (e) => {
    const { app, active } = this.state
    const { tableId } = active
    const updated = update(app, {
      tables: {
        [tableId]: {
          $set: e.formData
        }
      }
    })

    this.setState({
      app: updated,
      active: {
        table: updated.tables[tableId],
        tableId,
        type: types.TABLE
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

  onClickTable = ({ table, tableId }) => {
    this.setState({
      active: { type: types.TABLE, table, tableId }
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
    const title = e.formData.title

    const table = {
      name: camelCase(title),
      title: title,
      modelName: pascalCase(title),
      description: title + ' table',
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
        const textField = tableSchema.properties.defaultTextField
        const primaryField = tableSchema.properties.primaryKeyField
        const strings = f => f.type === 'string'
        primaryField.items.enum = active.table.fields.map(f => f.name)
        primaryField.items.enumNames = active.table.fields.map(f => f.name)
        textField.enum = active.table.fields.filter(strings).map(f => f.name)
        textField.enumNames = active.table.fields.filter(strings).map(f => f.title || f.name)

        return <Form
          schema={tableSchema}
          formData={active.table}
          onSubmit={this.onSubmitUpdateTable} />
    }
  }

  getFieldClassName (field) {
    return ''
    if (field.type === 'relation') {
      return 'danger'
    } else if (field.virtual) {
      return 'warning'
    } else {
      return ''
    }
  }

  render () {
    const { app, active, showDialog } = this.state

    const { tables } = app

    const data = tables.map((t, id) => Object.assign({
      id,
      fieldCount: t.fields.length,
      relationsCount: t.fields.filter(f => f.type === 'relation').length
    }, t))

    const columns = [{
      dataField: 'id',
      text: 'id'
    }, {
      dataField: 'name',
      text: 'Table name'
    }, {
      dataField: 'title',
      text: 'Title'
    }, {
      dataField: 'description',
      text: 'Description'
    }, {
      dataField: 'modelName',
      text: 'Model name'
    }, {
      dataField: 'modelPath',
      text: 'Model path'
    }, {
      dataField: 'fieldCount',
      text: 'Fields'
    }, {
      dataField: 'relationsCount',
      text: 'Relations'
    }]

    return (
      <>
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
                      <a onClick={e => this.onClickTable({ e, table, tableId })}>{table.title}</a>
                      <a className='pull-right' onClick={e => this.onClickAddField({ e, table, tableId })}>+</a>
                    </div>
                    <table className='table table-condensed table-hover'>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th style={{ textAlign: 'center' }}>Nullable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.fields.map((field, fieldId) => (
                          <tr key={fieldId} className={this.getFieldClassName(field)} onClick={() => this.onClickField({ field, fieldId, table, tableId })}>
                            <td>{field.name}</td>
                            {field.type === 'relation' ? (
                              <td colSpan='2'>{`${field.type}<${field.table}>`}</td>
                            ) : (
                              <>
                                <td>{field.type} {field.virtual && <span className='text-info' title='Virtual field'> *</span>}</td>
                                <td style={{ textAlign: 'center', position: 'relative' }}>
                                  <input type='checkbox' defaultChecked={field.nullable}
                                    readOnly disabled />
                                </td>
                              </>
                            )}

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
          <BootstrapTable keyField='id' data={data} columns={columns} />
          <pre>{JSON.stringify(app, null, 2)}</pre>
          <a onClick={e => { var json = window.prompt('JSON'); json && this.setState({ app: JSON.parse(json) }) }}>Load</a>
        </div>
        <div className='col-sm-3 col-md-3 sidebar right'>
          {active ? this.getActiveEditor() : (
            <div className='panel-body'>
              <Form
                schema={appSchema}
                formData={app} />
            </div>
          )}
        </div>
      </>
    )
  }
}

export default Tables
