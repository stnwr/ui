import React from 'react'
import Form from 'react-jsonschema-form'
import update from 'immutability-helper'
import { enumTypes } from './schema/types.js'

const Editor = (props) => {
  const { schema, formData, uiSchema, onChange, onSubmit, onError, nullable = true } = props

  const editorSchema = {
    type: 'object',
    required: Array.isArray(schema.required)
      ? ['name', 'type'].concat(schema.required)
      : ['name', 'type'],
    properties: Object.assign({
      name: { type: 'string', title: 'Name' },
      type: { type: 'string', title: 'Type', enum: enumTypes },
      title: { type: 'string', title: 'Title' },
      description: { type: 'string', title: 'Description' }
    }, schema.properties, nullable ? {
      nullable: { type: 'boolean', title: 'Nullable' }
    } : {})
  }

  const editorUiSchema = Object.assign({}, uiSchema, {
    'ui:rootFieldId': formData.name,
    type: {
      'ui:widget': 'hidden'
    }
  })

  return <Form
    schema={editorSchema}
    formData={formData}
    uiSchema={editorUiSchema}
    onChange={onChange}
    onSubmit={onSubmit}
    onError={onError} />
}

const DefaultEditor = (props) => {
  const field = props.field
  const schema = {
    properties: {}
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

const StringEditor = (props) => {
  const field = props.field
  const formats = ['email', 'hostname', 'ipv4', 'ipv6', 'uri']
  const schema = {
    properties: {
      minLength: { type: 'integer', title: 'Min length' },
      maxLength: { type: 'integer', title: 'Max length' },
      pattern: { type: 'string', title: 'Regex' },
      format: { type: 'string', title: 'Format', enum: formats }
    }
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

const IntegerEditor = (props) => {
  const field = props.field

  const schema = {
    properties: {
      minimum: { type: 'integer', title: 'Minimum' },
      maximum: { type: 'integer', title: 'Maximum' }
    }
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

const NumberEditor = (props) => {
  const field = props.field

  const schema = {
    properties: {
      minimum: { type: 'number', title: 'Minimum' },
      maximum: { type: 'number', title: 'Maximum' }
    }
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

const BooleanEditor = (props) => {
  const field = props.field

  const schema = {
    properties: {
      // enumName: { type: 'array', title: 'Names', items: { type: 'string' } }
    }
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

class RelationEditor extends React.Component {
  constructor (props) {
    super(props)
    this.state = this.getState(props)
  }

  getState (props) {
    const { tables, table, field } = props

    const schema = {
      required: ['kind', 'from', 'table', 'to'],
      properties: {
        kind: { type: 'string', title: 'Kind', enum: ['BelongsToOne', 'HasOne', 'HasMany'] },
        from: { type: 'string', title: 'From', enum: table.fields.map(f => f.name) },
        table: { type: 'string', title: 'Table', enum: tables.map(t => t.name), enumNames: tables.map(t => t.displayName) },
        to: { type: 'string', title: 'To', enum: field.table && RelationEditor.getToEnums(field.table, tables) }
      }
    }

    return {
      schema,
      table: field.table,
      formData: field
    }
  }

  componentWillReceiveProps (props) {
    this.setState(this.getState(props))
  }

  static getToEnums (tableName, tables) {
    const toEnumFields = tableName && tables.find(t => t.name === tableName).fields
    return toEnumFields && toEnumFields.map(f => f.name)
  }

  onChange = (e) => {
    const { formData } = e
    const { tables } = this.props
    const { schema, table } = this.state

    if (table !== formData.table) {
      const updated = update(schema, {
        properties: {
          to: {
            enum: {
              $set: RelationEditor.getToEnums(formData.table, tables)
            }
          }
        }
      })

      this.setState({
        formData,
        schema: updated,
        table: formData.table
      })

      if (this.props.onChange) {
        this.props.onChange(e)
      }
    }
  }

  render () {
    const props = this.props
    const { schema, formData } = this.state
    const { tables, table } = props

    const uiSchema = {
    }

    return <Editor
      nullable={false}
      schema={schema}
      formData={formData}
      uiSchema={uiSchema}
      {...this.props}
      onChange={this.onChange} />
  }
}

const typeEditors = {
  'string': StringEditor,
  'integer': IntegerEditor,
  'boolean': BooleanEditor,
  'number': NumberEditor,
  'relation': RelationEditor
}

class FieldEditor extends React.Component {
  constructor (props) {
    super(props)
    console.log('ctor')
  }

  // state = {}

  // onClick = (e) => {
  //   if (this.state.showEditor) {
  //     this.setState({ showEditor: false })
  //     document.body.classList.remove('modal-open')
  //   } else {
  //     this.setState({ showEditor: { top: e.clientY, left: e.clientX } })
  //     document.body.classList.add('modal-open')
  //   }
  // }

  render () {
    const { field } = this.props
    const Type = typeEditors[field.type] || DefaultEditor

    return (
      <div className='field-editor'>
        <Type field={field} {...this.props} />
      </div>
    )
  }
}

export default FieldEditor
