import React from 'react'
import update from 'immutability-helper'
import Form from 'react-jsonschema-form'
import { Link } from 'react-router-dom'
import BootstrapTable from 'react-bootstrap-table-next'
import assert from './assert.js'
import './Dashboard.css'
import './App.css'
import api from './api.js'
import { generateUISchema } from '@stoneware/common/helpers/schema'

const CustomDescriptionField = ({ id, description }) => {
  if (!description) {
    return ''
  }

  return (
    <div className='pull-right'>
      <div className='glyphicon glyphicon-question-sign' id={id} title={description} />
    </div>
  )
}

const fields = {
  // lookup: Lookup,
  DescriptionField: CustomDescriptionField
}

class LookupWidget extends React.Component {
  componentDidMount (props) {
    this.getData()
  }

  async getData ({ query = '' } = {}) {
    const props = this.props
    const { formContext, options } = props
    const { displayField, relation, table: toTable, to } = options

    // const query = `?eager=[${eager}]${search && '&' + search.slice(1)}`
    const dataResult = await api.get(`/api/table/${toTable}${query}`)
    assert(dataResult.ok)
    return dataResult.data
  }

  onClickEdit = async (e) => {
    this.setState({ mode: 'edit', loading: true })
    const results = await this.getData()
    this.setState({ results, loading: false })
  }

  render () {
    const props = this.props
    const state = this.state || {}
    const { formContext, options } = props
    const { mode, results } = state
    const { app, table, data } = formContext
    const { displayField, relation, table: toTable, to } = options
    const display = data[relation] && data[relation][displayField]

    return (
      <div className='lookup-widget'>
        <div className='display'>
          {display}
          <small className='pull-right'>
            <a onClick={this.onClickEdit}>Edit</a>
          </small>
          {/* <Link to={`/table/${toTable}?${to}:eq=${props.value}`}>{display}</Link> */}

          <input
            type='hidden'
            // type='text'
            className='form-control'
            value={props.value}
            onChange={e => props.onChange(e.target.value)} />
        </div>
        {mode === 'edit' && (
          <div className='search'>
            {/* <div className='input-group'>
              <input className='form-control'
                type='search'
                placeholder={props.placeholder}
              />
              <span className='input-group-btn'>
                <button className='btn btn-link' type='button'>
                  <i className='glyphicon glyphicon-search' aria-hidden='true' />
                </button>
              </span>
            </div> */}
            {results && (
              <div className='results list-group'>
                {results.map(result => (
                  <a key={result.id} href='#' className='list-group-item'>
                    <input type='radio' name={`${props.id}_option`} value={result[to]} /> {result[[displayField]]}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* <div className='input-group'>

          <input type='text'
            className='form-control' id={props.id}
            name={props.name} placeholder={props.placeholder}
            value={display}
            onChange={e => console.log(e)} />
          <span className='input-group-addon' id='basic-addon2'><i className='glyphicon glyphicon-search' aria-hidden='true' /></span>
        </div> */}
      </div>
    )
  }
}

const widgets = {
  lookup: LookupWidget
}

function linkFormatter (cell, row, rowIndex, formatExtraData) {
  return (
    <Link to={formatExtraData.getHref(row, cell)}>{formatExtraData.getText(row, cell)}</Link>
  )
}

class Table extends React.Component {
  state = {}

  async setTable (props) {
    try {
      const { app } = props
      const name = props.match.params.name
      const search = props.location.search
      const table = app.tables.find(tbl => tbl.name === name)

      this.setState({
        table,
        active: null,
        data: null,
        schema: null,
        uiSchema: null
      })

      const relations = table.fields
        .filter(f => f.type === 'relation')

      const eager = relations
        .map(f => f.name)
        .join(',')

      const query = `?eager=[${eager}]${search && '&' + search.slice(1)}`
      const dataResult = await api.get(`/api/table/${table.name}${query}`)
      assert(dataResult.ok)
      const schemaResult = await api.get(`/api/table/${table.name}/schema`)
      assert(schemaResult.ok)
      const schema = schemaResult.data
      // const uiSchemaResult = await api.get(`/api/table/${table.name}/ui/schema`)
      // assert(uiSchemaResult.ok)

      const uiSchema = generateUISchema(schema)
      const lookupRelations = relations.filter(r =>
        r.kind === 'HasOne' || r.kind === 'BelongsToOne')

      // lookupRelations.length = 0
      if (lookupRelations.length) {
        // const uiSchema = uiSchemaResult.data
        // Modify the ui schema by
        // applying the lookup widget
        lookupRelations.forEach(r => {
          const fromField = table.fields.find(f => f.name === r.from)
          const toTable = app.tables.find(f => f.name === r.table)
          // const toField = toTable.fields.find(f => f.name === r.to)
          uiSchema[r.from] = {
            'ui:title': fromField.title,
            'ui:widget': 'lookup',
            'ui:options': {
              'relation': r.name,
              'table': r.table,
              'to': r.to,
              'displayField': toTable.defaultTextField || 'id'
            }
          }
        })
      }

      this.setState({
        data: dataResult.data,
        schema: schema, // schemaResult.data,
        uiSchema: uiSchema // uiSchemaResult.data
      })
    } catch (err) {
      console.error(err)
    }
  }

  componentDidMount () {
    this.setTable(this.props)
  }

  componentWillReceiveProps (props) {
    this.setTable(props)
  }

  onClickAdd (e) {
    // Add row
    this.setState({
      active: {}
    })
  }

  render () {
    const { app } = this.props
    const { table, data, schema, uiSchema, active } = this.state

    if (!data) {
      return ''
    }

    const columns = []

    table.fields
      // .filter(() => false)
      .filter(f => f.type !== 'json') //  && f.type !== 'relation'
      .filter(f => !uiSchema[f.name] || uiSchema[f.name]['ui:widget'] !== 'hidden')
      .forEach(f => {
        if (f.type !== 'relation') {
          // Add it as a column unless it has a BelongsToOne relation buddy field.
          const hasRelation = !!table.fields.find(field =>
            field.type === 'relation' &&
            field.kind === 'BelongsToOne' &&
            field.from === f.name)

          if (!hasRelation) {
            const column = {
              dataField: f.name,
              text: (uiSchema[f.name] && uiSchema[f.name]['ui:title']) || (f.title || f.name)
            }
            columns.push(column)
          }
        } else {
          const target = app.tables.find(t => t.name === f.table)

          const column = f.kind === 'HasMany' ? {
            dataField: `id`,
            text: f.title,
            formatter: linkFormatter,
            formatExtraData: {
              getHref: (data) => `/table/${target.name}?${f.to}:eq=${data[f.from]}`,
              getText: () => f.title
            }
          } : {
            dataField: `${f.name}.${target.defaultTextField}`,
            text: f.title,
            formatter: linkFormatter,
            formatExtraData: {
              getHref: (data) => `/table/${target.name}?${f.to}:eq=${data[f.from]}`,
              getText: (data, cell) => cell || f.title
            }
          }

          columns.push(column)
        }
      })

    const columns1 = Object.keys(schema.properties)
      .filter(key => schema.properties[key].type !== 'object')
      .filter(key => !uiSchema[key] || uiSchema[key]['ui:widget'] !== 'hidden')
      .map(key => {
        const columnConfig = {
          dataField: key,
          text: (uiSchema[key] && uiSchema[key]['ui:title']) || key
        }

        return columnConfig
      })
      // .concat(
      //   table.fields
      //     // .filter(f => false)
      //     .filter(f => f.type === 'relation')
      //     // .filter(f => f.kind === 'BelongsToOne' || f.kind === 'HasOne')
      //     .filter(f => f.kind === 'HasMany' || app.tables.find(t => t.name === f.table).defaultTextField)
      //     .map(f => {
      //       const target = app.tables.find(t => t.name === f.table)

      //       return f.kind === 'HasMany' ? {
      //         dataField: `id`,
      //         text: f.title,
      //         formatter: linkFormatter,
      //         formatExtraData: {
      //           getHref: (data) => `/table/${target.name}?${f.to}:eq=${data[f.from]}`,
      //           getText: () => f.title
      //         }
      //       } : {
      //         dataField: `${f.name}.${target.defaultTextField}`,
      //         text: f.title,
      //         formatter: linkFormatter,
      //         formatExtraData: {
      //           getHref: (data) => `/table/${target.name}?${f.to}:eq=${data[f.from]}`,
      //           getText: (data, cell) => cell
      //         }
      //       }
      //     })
      // )

    const rowEvents = {
      onClick: (e, row, rowIndex) => {
        this.setState({
          active: data[rowIndex]
        })
      }
    }

    return (
      <>
        <div className='col-md-7 col-md-offset-2 main'>
          <h4>{table.title}</h4>
          <BootstrapTable keyField='id' data={data} columns={columns} rowEvents={rowEvents} hover />
          <a onClick={() => this.onClickAdd()}>Add</a>
          <pre>{JSON.stringify({ schema, uiSchema }, null, 2)}</pre>
        </div>
        <div className='col-md-3 sidebar right'>
          {active && (
            <Form
              schema={schema}
              formData={active}
              uiSchema={uiSchema}
              fields={fields}
              widgets={widgets}
              formContext={{ app, data: active, table }} />
          )}
          <pre>{JSON.stringify(active, null, 2)}</pre>
        </div>
      </>
    )
  }
}

export default Table

// onSubmitUpdateField = (e) => {
//   const { app, active } = this.state
//   const { fieldId, table, tableId } = active
//   const updated = update(app, {
//     tables: {
//       [tableId]: {
//         fields: {
//           [fieldId]: {
//             $set: e.formData
//           }
//         }
//       }
//     }
//   })

//   this.setState({
//     app: updated,
//     active: {
//       field: updated.tables[tableId].fields[fieldId],
//       fieldId,
//       table,
//       tableId
//     }
//   })
// }

// onClickAddTable = ({ e }) => {
//   this.setState({
//     showDialog: {
//       title: 'Add table',
//       onSubmit: this.onSubmitAddTable
//     }
//   })
// }

// onSubmitAddTable = (e) => {
//   const { app } = this.state
//   const title = e.formData.title

//   const table = {
//     name: camelCase(title),
//     title: title,
//     modelName: pascalCase(title),
//     modelPath: '.js',
//     description: title + ' table',
//     fields: []
//   }

//   const updated = update(app, {
//     tables: {
//       $push: [table]
//     }
//   })

//   const active = {
//     table
//   }

//   this.setState({
//     app: updated,
//     showDialog: false,
//     active
//   })
// }
